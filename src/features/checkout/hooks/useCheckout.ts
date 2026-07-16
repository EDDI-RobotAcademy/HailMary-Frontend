"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail } from "@/shared/utils/validation";
import { getDeviceId, getSessionId, trackEvent } from "@/shared/utils/analytics";
import { api } from "@/shared/utils/api";
import { env } from "@/lib/env";
import { getAccountIdFromToken } from "@/lib/authAccount";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  makePortoneOrderId,
  requestPortonePayment,
  type PortonePaymentResult,
} from "./portone";
import {
  PRODUCTS,
  type CheckoutCharacter,
  type CheckoutProduct,
} from "../domain/checkoutProducts";

export type ConsentDoc = "data-usage" | "payment";

/** 결제수단 — kakao=포트원 카카오페이 결제창 / payapp=PayApp(카드·간편결제). */
export type PayMethod = "kakao" | "payapp";

interface RequestPaymentResponse {
  orderId: string;
  payurl: string;
  // 카드사 심사용 테스트 계정이면 BE가 0원 무료 발급 → payurl 빈 문자열 + freeGranted=true.
  freeGranted?: boolean;
}

interface DevBypassResponse {
  orderId: string;
}

interface ValidateCouponResponse {
  valid: boolean;
  message: string;
}

interface RedeemCouponResponse {
  orderId: string;
}

/** 결제 패스 버튼 노출 여부 — localhost 한정 allowlist.
 *  prod 전환(2026-06-05): 기존 블록리스트(운영 도메인만 차단)는 staging·새 도메인에서
 *  fail-open이라 폐기. 배포된 모든 도메인에서 숨기고 로컬 개발에서만 노출.
 *  (BE /api/payments/dev/bypass 는 별도로 APP_ENV != "prod" 게이트 — prod에선 404.) */
export function isDevBypassEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

export interface UseCheckoutReturn {
  product: CheckoutProduct;
  email: string;
  setEmail: (v: string) => void;
  emailError: string | null;
  handleEmailBlur: () => void;
  coupon: string;
  setCoupon: (v: string) => void;
  handleCouponBlur: () => void;
  /** 쿠폰 검증 통과 여부 — true면 0원 무료 발급 플로로 전환. */
  couponApplied: boolean;
  /** 카드사 심사용 테스트 계정 로그인 상태 — 결제 0원 + UI 안내 분기. */
  isTestAccount: boolean;
  /** 카카오페이(포트원) 결제 옵션 노출 여부. true면 카카오페이 버튼 + PayApp 버튼 공존. */
  kakaopayAvailable: boolean;
  /** "적용" 결과 안내 문구 (유효/무효). */
  couponMessage: string | null;
  couponChecking: boolean;
  agreeDataUsage: boolean;
  handleAgreeDataUsage: (v: boolean) => void;
  agreePayment: boolean;
  handleAgreePayment: (v: boolean) => void;
  openConsent: ConsentDoc | null;
  setOpenConsent: (v: ConsentDoc | null) => void;
  handleConsentDetail: (doc: ConsentDoc) => void;
  isProcessing: boolean;
  /** 지금 처리 중인 결제수단 — 눌린 버튼만 로딩 표시(다른 버튼은 그대로). */
  processingMethod: PayMethod | null;
  applyCoupon: () => Promise<void>;
  handleBack: () => void;
  /** 결제 실행. method="kakao"면 포트원 카카오페이, "payapp"면 PayApp. 쿠폰 적용 시 method 무관 무료발급. */
  handleSubmit: (method?: PayMethod) => Promise<void>;
  /** staging/local 전용: 결제 단계 스킵 → BE bypass → success polling. */
  devBypassPay: () => Promise<void>;
}

// BE 결제 요청 3종(request/redeem/bypass)에 Amplitude 식별자를 동봉 — BE가 Payment에
// 저장해뒀다가 webhook 발화 payment_completed에 그대로 실어, FE 퍼널과 유저가 이어진다.
// (식별자 누락 시 payment_completed가 user_id 단독의 "고아 유저"로 분리되던 문제의 FE측 수정)
function getAnalyticsIds(): { deviceId: string | null; sessionId: number | null } {
  // BE device_id 컬럼은 String(64) — 초과 값(크래프트된 ?ampDeviceId 링크 등)은 절단해
  // 결제 요청이 1406으로 500나지 않게 한다. session_id도 안전한 양의 정수만 통과.
  const rawDeviceId = getDeviceId();
  const deviceId = rawDeviceId ? rawDeviceId.slice(0, 64) : null;
  const n = Number(getSessionId());
  const sessionId = Number.isSafeInteger(n) && n > 0 ? n : null;
  return { deviceId, sessionId };
}

function scrollToField(id: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  if (el instanceof HTMLElement) el.focus({ preventScroll: true });
}

// 2026-06-05 prod 실결제 사고: 카드사 인증 복귀가 새 브라우저 컨텍스트로 떨어지면
// sessionStorage(탭 단위)가 유실돼 success 페이지가 "결제 세션 정보 없음"을 띄웠음.
// → localStorage에도 백업 (1차 복구는 BE /api/payments/return의 ?order_id= 쿼리).
function savePendingCheckout(payload: {
  character: string;
  orderId: string;
  amount: number;
  email: string;
}): void {
  const raw = JSON.stringify(payload);
  try { sessionStorage.setItem("checkoutPending", raw); } catch {}
  try { localStorage.setItem("checkoutPending", raw); } catch {}
}

export function useCheckout(character: CheckoutCharacter): UseCheckoutReturn {
  const router = useRouter();
  const product = PRODUCTS[character];
  const { profile, refreshMe } = useAuth();
  // 테스트 계정(provider=test)으로 로그인 시 → 결제 UI를 "테스트" 문구로 전환.
  const isTestAccount = profile?.provider === "test";
  // 카카오페이(포트원) 결제 옵션 노출 여부: enabled + (전체개방 OR 테스트계정).
  // true면 체크아웃에 '카카오페이' 버튼이 PayApp(카드·간편결제) 버튼과 함께 노출.
  const kakaopayAvailable =
    env.PORTONE_ENABLED && (env.PORTONE_FOR_ALL || Boolean(isTestAccount));

  // 새 탭/리로드로 결제 페이지에 바로 진입하면 토큰은 살아있어도 in-memory 프로필이 비어
  // isTestAccount가 false로 떨어진다(0원 발급은 토큰 기반이라 정상이지만 안내 UI가 안 뜸).
  // 진입 시 프로필이 없으면 /me로 1회 복원해 provider(test 여부)를 채운다. (토큰 없으면 no-op)
  useEffect(() => {
    if (!profile) void refreshMe();
  }, [profile, refreshMe]);

  const [email, setEmailState] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [coupon, setCouponState] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [agreeDataUsage, setAgreeDataUsage] = useState(true);
  const [agreePayment, setAgreePayment] = useState(true);
  const [openConsent, setOpenConsent] = useState<ConsentDoc | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<PayMethod | null>(
    null,
  );

  // PayApp 결제 페이지에서 뒤로가기 복귀 시 isProcessing reset.
  useEffect(() => {
    const reset = () => {
      setIsProcessing(false);
      setProcessingMethod(null);
    };
    window.addEventListener("pageshow", reset);
    window.addEventListener("focus", reset);
    return () => {
      window.removeEventListener("pageshow", reset);
      window.removeEventListener("focus", reset);
    };
  }, []);

  const setEmail = useCallback((v: string) => {
    setEmailState(v);
    if (emailError) setEmailError(null);
  }, [emailError]);

  // 코드를 수정하면 적용 상태 해제 — 바뀐 코드로 무료 발급되는 일 방지.
  const setCoupon = useCallback((v: string) => {
    setCouponState(v);
    setCouponApplied(false);
    setCouponMessage(null);
  }, []);

  const handleEmailBlur = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed) return;
    trackEvent("checkout_email_input", {
      character_id: character,
      has_value: true,
      is_valid: isValidEmail(trimmed),
    });
  }, [email, character]);

  const handleCouponBlur = useCallback(() => {
    const trimmed = coupon.trim();
    if (!trimmed) return;
    trackEvent("checkout_coupon_input", {
      character_id: character,
      has_value: true,
    });
  }, [coupon, character]);

  const handleAgreeDataUsage = useCallback(
    (v: boolean) => {
      setAgreeDataUsage(v);
      trackEvent("checkout_consent_toggle", {
        character_id: character,
        consent_type: "data-usage",
        checked: v,
      });
    },
    [character],
  );

  const handleAgreePayment = useCallback(
    (v: boolean) => {
      setAgreePayment(v);
      trackEvent("checkout_consent_toggle", {
        character_id: character,
        consent_type: "payment",
        checked: v,
      });
    },
    [character],
  );

  const handleConsentDetail = useCallback(
    (doc: ConsentDoc) => {
      setOpenConsent(doc);
      trackEvent("checkout_consent_detail_click", {
        character_id: character,
        consent_type: doc,
      });
    },
    [character],
  );

  const handleBack = useCallback(() => {
    trackEvent("checkout_back_click", { character_id: character });
    router.push(`/saju/result?character=${character}`);
  }, [router, character]);

  const applyCoupon = useCallback(async () => {
    const code = coupon.trim();
    trackEvent("checkout_coupon_apply_click", {
      character_id: character,
      has_value: code.length > 0,
    });
    if (!code) {
      setCouponApplied(false);
      setCouponMessage("쿠폰 코드를 입력해 주세요.");
      return;
    }
    if (couponChecking) return;
    setCouponChecking(true);
    try {
      const res = await api.post<ValidateCouponResponse>("/api/coupons/validate", {
        code,
      });
      setCouponApplied(res.valid);
      setCouponMessage(res.message);
      trackEvent("checkout_coupon_validated", {
        character_id: character,
        valid: res.valid,
      });
    } catch (err) {
      setCouponApplied(false);
      setCouponMessage(err instanceof Error ? err.message : "쿠폰 확인에 실패했어요.");
    } finally {
      setCouponChecking(false);
    }
  }, [coupon, character, couponChecking]);

  /** 결제 버튼 클릭 — 검증 → BE /request → payurl 리다이렉트 (모달 없음). */
  const handleSubmit = useCallback(async (method: PayMethod = "payapp") => {
    trackEvent("checkout_pay_button_click", {
      character_id: character,
      pay_method: method,
      amount: product.priceKrw,
      email_filled: email.trim().length > 0,
      agree_data_usage: agreeDataUsage,
      agree_payment: agreePayment,
    });
    if (!isValidEmail(email)) {
      setEmailError("이메일 형식을 확인해 주세요.");
      scrollToField("checkout-email");
      trackEvent("checkout_validation_failed", {
        character_id: character,
        reason: "email_invalid",
      });
      return;
    }
    if (!agreeDataUsage || !agreePayment) {
      scrollToField(!agreeDataUsage ? "agree-data-usage" : "agree-payment");
      alert("결제 진행에는 두 가지 동의가 모두 필요합니다.");
      trackEvent("checkout_validation_failed", {
        character_id: character,
        reason: "consent_missing",
      });
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessingMethod(method);

    const sajuRequestId =
      typeof window !== "undefined"
        ? localStorage.getItem(`${character}SajuRequestId`)
        : null;
    const sessionToken = sajuRequestId;

    // 쿠폰 적용 시: PayApp 대신 무료 발급(redeem) → 결제완료와 동일한 success 폴링 진입.
    if (couponApplied) {
      try {
        const res = await api.post<RedeemCouponResponse>(
          "/api/coupons/redeem",
          {
            sessionToken,
            character,
            customerEmail: email.trim(),
            code: coupon.trim(),
            ...getAnalyticsIds(),
          },
          // 로그인 시 계정 JWT 첨부 → 결제 보관함 귀속 (비로그인은 무영향)
          { auth: "account" },
        );
        savePendingCheckout({
          character,
          orderId: res.orderId,
          amount: 0,
          email: email.trim(),
        });
        trackEvent("coupon_redeemed", {
          character_id: character,
          order_id: res.orderId,
        });
        router.replace("/checkout/success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "쿠폰 사용에 실패했어요.";
        trackEvent("coupon_redeem_failed", {
          character_id: character,
          error_message: message,
        });
        alert(`쿠폰 사용에 실패했어요: ${message}`);
        setIsProcessing(false);
        setProcessingMethod(null);
      }
      return;
    }

    // 카카오페이(포트원) — 테스트계정은 제외(0원 free 경로로 흘림, F). 버튼은 kakaopayAvailable일 때만.
    if (method === "kakao" && !isTestAccount) {
      // B: 사주 세션 없으면 결제창 열기 '전'에 차단 — 결제 후 발급 불가로 돈만 나가는 것 방지.
      if (!sessionToken) {
        alert("세션이 만료됐어요. 처음부터 다시 시도해 주세요.");
        setIsProcessing(false);
        setProcessingMethod(null);
        return;
      }
      const orderId = makePortoneOrderId();
      savePendingCheckout({
        character,
        orderId,
        amount: product.priceKrw,
        email: email.trim(),
      });
      trackEvent("payment_initiated", {
        character_id: character,
        saju_request_id: sajuRequestId,
        amount: product.priceKrw,
        pg: "portone_kakaopay",
      });

      // 결제창 호출 — 여기서 throw = 결제 '시작' 실패(돈 안 나감) → 안내 후 재시도 허용.
      let result: PortonePaymentResult;
      try {
        result = await requestPortonePayment({
          paymentId: orderId,
          orderName: product.productLabel,
          totalAmount: product.priceKrw,
          customData: {
            character,
            sessionToken,
            email: email.trim(),
            accountId: getAccountIdFromToken(), // E: 웹훅 경로에서도 계정 귀속(보관함)
            ...getAnalyticsIds(),
          },
          // H: 쿼리 없이 — 포트원이 ?paymentId= 를 부착, success 페이지가 그것으로 식별.
          redirectUrl: `${window.location.origin}/checkout/success/`,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "결제를 시작하지 못했어요.";
        trackEvent("payment_failed", {
          character_id: character,
          error_message: message,
        });
        alert(`결제를 시작하지 못했어요: ${message}`);
        setIsProcessing(false);
        setProcessingMethod(null);
        return;
      }

      // 모바일은 위에서 페이지 이동 → 여기 도달 안 함. PC return-value만 처리.
      if (!result.ok) {
        // 결제 취소/실패(돈 안 나감).
        trackEvent("payment_failed", {
          character_id: character,
          error_message: result.message ?? result.code ?? "결제 취소",
        });
        setIsProcessing(false);
        setProcessingMethod(null);
        return;
      }

      // A: 결제 성공(돈 나감) → complete는 best-effort. 실패해도 success로 보낸다
      // (웹훅 + status 폴링이 발급 마무리). "결제 시작 실패" alert/재시도 금지 = 이중결제 방지.
      try {
        await api.post(
          "/api/payments/portone/complete",
          { paymentId: orderId },
          { auth: "account" },
        );
      } catch {
        // 무시 — 웹훅 백업 + success 폴링이 발급을 마무리한다.
      }
      router.replace(
        `/checkout/success/?order_id=${encodeURIComponent(orderId)}`,
      );
      return;
    }

    trackEvent("payment_initiated", {
      character_id: character,
      saju_request_id: sajuRequestId,
      amount: product.priceKrw,
    });

    try {
      const res = await api.post<RequestPaymentResponse>(
        "/api/payments/request",
        {
          sessionToken,
          character,
          customerEmail: email.trim(),
          ...getAnalyticsIds(),
        },
        // 로그인 시 계정 JWT 첨부 → 결제 보관함 귀속 (비로그인은 무영향)
        { auth: "account" },
      );

      // 테스트 계정(카드사 심사) → BE가 0원 무료 발급(payurl 없음) → PayApp 스킵, 쿠폰과 동일 success 폴링.
      if (res.freeGranted || !res.payurl) {
        savePendingCheckout({
          character,
          orderId: res.orderId,
          amount: 0,
          email: email.trim(),
        });
        trackEvent("payment_free_granted", {
          character_id: character,
          order_id: res.orderId,
        });
        router.replace("/checkout/success");
        return;
      }

      savePendingCheckout({
        character,
        orderId: res.orderId,
        amount: product.priceKrw,
        email: email.trim(),
      });

      window.location.href = res.payurl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "결제를 시작하지 못했어요.";
      trackEvent("payment_failed", {
        character_id: character,
        error_message: message,
      });
      alert(`결제를 시작하지 못했어요: ${message}`);
      setIsProcessing(false);
      setProcessingMethod(null);
    }
  }, [
    email,
    agreeDataUsage,
    agreePayment,
    character,
    product,
    isProcessing,
    couponApplied,
    coupon,
    router,
    isTestAccount,
  ]);

  /** 결제 패스 (staging/local 전용) — BE bypass endpoint 호출 → success polling. */
  const devBypassPay = useCallback(async () => {
    if (isProcessing) return;
    if (!isValidEmail(email)) {
      setEmailError("이메일 형식을 확인해 주세요.");
      scrollToField("checkout-email");
      return;
    }
    setIsProcessing(true);
    const sessionToken =
      typeof window !== "undefined"
        ? localStorage.getItem(`${character}SajuRequestId`)
        : null;
    try {
      const res = await api.post<DevBypassResponse>(
        "/api/payments/dev/bypass",
        {
          sessionToken,
          character,
          customerEmail: email.trim(),
          ...getAnalyticsIds(),
        },
        // 로그인 시 계정 JWT 첨부 → 결제 보관함 귀속 (비로그인은 무영향)
        { auth: "account" },
      );
      savePendingCheckout({
        character,
        orderId: res.orderId,
        amount: product.priceKrw,
        email: email.trim(),
      });
      trackEvent("payment_dev_bypass", { character_id: character, order_id: res.orderId });
      router.replace("/checkout/success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "결제 패스 실패";
      alert(`결제 패스 실패: ${message}`);
      setIsProcessing(false);
    }
  }, [character, email, isProcessing, product, router]);

  return {
    product,
    email,
    setEmail,
    emailError,
    handleEmailBlur,
    coupon,
    setCoupon,
    handleCouponBlur,
    couponApplied,
    isTestAccount,
    kakaopayAvailable,
    couponMessage,
    couponChecking,
    agreeDataUsage,
    handleAgreeDataUsage,
    agreePayment,
    handleAgreePayment,
    openConsent,
    setOpenConsent,
    handleConsentDetail,
    isProcessing,
    processingMethod,
    applyCoupon,
    handleBack,
    handleSubmit,
    devBypassPay,
  };
}
