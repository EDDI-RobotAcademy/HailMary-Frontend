"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail } from "@/shared/utils/validation";
import { getDeviceId, getSessionId, trackEvent } from "@/shared/utils/analytics";
import { api } from "@/shared/utils/api";
import {
  PRODUCTS,
  type CheckoutCharacter,
  type CheckoutProduct,
} from "../domain/checkoutProducts";

export type ConsentDoc = "data-usage" | "payment";

interface RequestPaymentResponse {
  orderId: string;
  payurl: string;
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
  applyCoupon: () => Promise<void>;
  handleBack: () => void;
  /** 검증 → BE /request → payurl 리다이렉트 (모달 없음, 마찰 최소화). */
  handleSubmit: () => Promise<void>;
  /** staging/local 전용: 결제 단계 스킵 → BE bypass → success polling. */
  devBypassPay: () => Promise<void>;
}

// BE 결제 요청 3종(request/redeem/bypass)에 Amplitude 식별자를 동봉 — BE가 Payment에
// 저장해뒀다가 webhook 발화 payment_completed에 그대로 실어, FE 퍼널과 유저가 이어진다.
// (식별자 누락 시 payment_completed가 user_id 단독의 "고아 유저"로 분리되던 문제의 FE측 수정)
function getAnalyticsIds(): { deviceId: string | null; sessionId: number | null } {
  const deviceId = getDeviceId() || null;
  const sid = getSessionId();
  return { deviceId, sessionId: sid ? Number(sid) : null };
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

  // PayApp 결제 페이지에서 뒤로가기 복귀 시 isProcessing reset.
  useEffect(() => {
    const reset = () => setIsProcessing(false);
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
  const handleSubmit = useCallback(async () => {
    trackEvent("checkout_pay_button_click", {
      character_id: character,
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
      }
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
    applyCoupon,
    handleBack,
    handleSubmit,
    devBypassPay,
  };
}
