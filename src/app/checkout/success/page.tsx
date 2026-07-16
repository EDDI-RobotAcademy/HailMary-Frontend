"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import { api, ApiError } from "@/shared/utils/api";
import { PaidIntroScene as YeonwooPaidIntroScene } from "@/features/saju-result/views/yeonwoo/paid/paid-intro/PaidIntroScene";
import { PaidIntroScene as DoyoonPaidIntroScene } from "@/features/saju-result/views/doyoon/paid/paid-intro/PaidIntroScene";
import EmailConfirmModal from "@/features/checkout/views/components/EmailConfirmModal";

/**
 * PayApp 결제 페이지에서 returnurl 도착 시 진입.
 *
 * 처리 흐름:
 * 1. sessionStorage `checkoutPending` 에서 orderId/character 복원
 * 2. BE `GET /api/payments/status` 폴링 (1초 간격, 최대 60초)
 *    — PayApp이 webhook(`/feedback`)으로 BE에 결제완료 통지하면 status=DONE
 * 3. status=DONE → 캐릭터별 인트로 씬 → CTA → /saju/paid/{orderId}/loading
 * 4. status=CANCELED/ABORTED → 결제 실패 UI
 * 5. 60초 타임아웃 → 처리 지연 안내
 *
 * PayApp는 returnurl 도달 시점이 webhook 도달보다 빠를 수 있어 polling 필수.
 */

type ScreenStatus =
  | "polling"          // BE 폴링 중 (PayApp webhook 대기)
  | "intro_play"       // status=DONE → 인트로 씬
  | "cancelled"        // 결제 취소/중단
  | "timeout"          // 폴링 60초 초과
  | "error";           // 검증 실패 (orderId 누락 등)

interface PaymentStatusResponse {
  orderId: string;
  status: string;     // READY / DONE / CANCELED / ABORTED / WAITING_FOR_DEPOSIT / PARTIAL_CANCELED
  character: string;  // "yeonwoo" | "doyoon"
  // 2026-06-05: storage 유실 시 이메일 모달 프리필용 — 서버 저장값이 정본
  customerEmail?: string;
}

interface PendingCheckout {
  character: string;
  orderId: string;
  amount?: number;
  email?: string;
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60_000;

function SuccessBody() {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenStatus>("polling");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // 결제 완료(DONE) 직후 이메일 재확인 모달. 닫히면 인트로 씬 진입.
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const viewSentRef = useRef(false);
  const redirectSentRef = useRef(false);

  // 진입 트래킹
  useEffect(() => {
    if (viewSentRef.current) return;
    viewSentRef.current = true;
    let character: string | null = null;
    let orderId: string | null = null;
    let amount: number | null = null;
    try {
      // sessionStorage(탭 단위) 유실 대비 localStorage 백업까지 확인 (2026-06-05 hotfix와 동일).
      const raw =
        sessionStorage.getItem("checkoutPending") ??
        localStorage.getItem("checkoutPending");
      if (raw) {
        const p = JSON.parse(raw) as PendingCheckout;
        character = p?.character ?? null;
        orderId = p?.orderId ?? null;
        amount = p?.amount ?? null;
      }
    } catch {}
    // amount = 실제 청구 판매가(할인 적용가, product.priceKrw). 정가(originalPriceKrw)는 표시 전용.
    // PayApp 확정금액·결제수단의 단일 진실원은 BE payment_completed.
    trackEvent("checkout_success_view", { character_id: character, order_id: orderId, amount });
  }, []);

  // 폴링 루프
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    let pending: PendingCheckout | null = null;
    try {
      const raw = sessionStorage.getItem("checkoutPending");
      if (raw) pending = JSON.parse(raw) as PendingCheckout;
    } catch {}
    // 2026-06-05 prod 실결제 사고 hotfix: 카드사 인증 복귀가 새 브라우저 컨텍스트로
    // 떨어지면 sessionStorage(탭 단위)가 유실됨. BE /api/payments/return이 PayApp
    // var1(=주문번호)을 ?order_id= 로 전달하므로 URL 쿼리 우선, 그다음
    // sessionStorage → localStorage 백업 순으로 복구.
    if (!pending?.orderId) {
      try {
        const raw = localStorage.getItem("checkoutPending");
        if (raw) pending = JSON.parse(raw) as PendingCheckout;
      } catch {}
    }
    // 포트원 카카오페이 redirect 복귀 — 쿼리에 paymentId(성공) 또는 code(실패) 부착.
    let portonePaymentId = "";
    let portoneCode: string | null = null;
    try {
      const params = new URLSearchParams(window.location.search);
      portonePaymentId = params.get("paymentId") ?? "";
      portoneCode = params.get("code");
    } catch {}

    let orderId = "";
    try {
      orderId = new URLSearchParams(window.location.search).get("order_id") ?? "";
    } catch {}
    if (!orderId) orderId = portonePaymentId || (pending?.orderId ?? "");

    if (!orderId) {
      setScreen("error");
      setErrorMsg("결제 세션 정보가 없어요. 처음부터 다시 시도해 주세요.");
      return;
    }

    const startedAt = Date.now();

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await api.get<PaymentStatusResponse>(
          `/api/payments/status?order_id=${encodeURIComponent(orderId)}`,
        );
        if (cancelled) return;

        if (res.status === "DONE") {
          setPaymentStatus(res);
          // 결제 완료 직후 이메일 재확인 모달 노출 → 확정 후 intro_play 진입
          // 서버 저장 이메일이 정본 (storage 유실 케이스에서도 프리필 보장).
          let initialEmail = res.customerEmail ?? "";
          if (!initialEmail) {
            try {
              const raw =
                sessionStorage.getItem("checkoutPending") ??
                localStorage.getItem("checkoutPending");
              if (raw) initialEmail = (JSON.parse(raw) as PendingCheckout)?.email ?? "";
            } catch {}
          }
          setPendingEmail(initialEmail);
          setEmailModalOpen(true);
          return;
        }
        if (res.status === "CANCELED" || res.status === "ABORTED") {
          setScreen("cancelled");
          return;
        }
        // READY / WAITING_FOR_DEPOSIT / PARTIAL_CANCELED → 계속 폴링
      } catch (err) {
        // 404 (payment 없음) — webhook이 아직 record 만들지 않은 케이스는 없지만,
        // 만약 BE에 record 없다면 에러 표시
        if (err instanceof ApiError && err.status === 404) {
          setScreen("error");
          setErrorMsg("결제 정보를 찾을 수 없어요.");
          return;
        }
        // 기타 네트워크 에러는 재시도
      }

      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        if (!cancelled) setScreen("timeout");
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    // 포트원 복귀면 서버 검증(complete)을 먼저 — 그래야 폴링이 DONE을 본다.
    const init = async () => {
      if (portoneCode) {
        // 포트원 결제 실패/취소 (사용자 취소 등)
        if (!cancelled) setScreen("cancelled");
        return;
      }
      if (portonePaymentId) {
        try {
          await api.post(
            "/api/payments/portone/complete",
            { paymentId: portonePaymentId },
            { auth: "account" },
          );
        } catch (err) {
          // 검증 실패(400)=결제 미완료 → 취소 화면. 그 외(네트워크 등)는 웹훅 백업 기대하고 폴링 진행.
          if (err instanceof ApiError && err.status === 400) {
            if (!cancelled) setScreen("cancelled");
            return;
          }
        }
      }
      poll();
    };

    init();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // 인트로 씬 CTA → loading 페이지로
  const handleIntroCta = () => {
    if (redirectSentRef.current || !paymentStatus) return;
    redirectSentRef.current = true;
    // checkoutPending 제거(아래) 전에 amount 복원. 발화 시점엔 아직 살아있음.
    let amount: number | null = null;
    try {
      const raw =
        sessionStorage.getItem("checkoutPending") ??
        localStorage.getItem("checkoutPending");
      if (raw) amount = (JSON.parse(raw) as PendingCheckout)?.amount ?? null;
    } catch {}
    // amount = 실제 청구 판매가(할인 적용가). PayApp 확정금액은 BE payment_completed 기준.
    trackEvent("paid_result_redirect", {
      order_id: paymentStatus.orderId,
      character_id: paymentStatus.character,
      amount,
    });
    try { sessionStorage.removeItem("checkoutPending"); } catch {}
    try { localStorage.removeItem("checkoutPending"); } catch {}
    router.replace(`/saju/paid/${encodeURIComponent(paymentStatus.orderId)}/loading`);
  };

  // 이메일 확인 모달 콜백 — 2026-06-05 확정-후-발송 설계:
  // 결과지 메일은 이 "확정" 호출이 트리거 (변경 없어도 항상 호출 — 서버가
  // email_confirmed_at 기록 + 확정 주소로 1통 발송). 확정 없이 이탈하면
  // 서버 스위퍼가 grace 후 폴백 발송. 오타 주소 선발송/2통 문제 차단.
  const handleEmailConfirm = async (confirmedEmail: string) => {
    if (!paymentStatus) return;
    try {
      await api.post("/api/payments/update-email", {
        orderId: paymentStatus.orderId,
        newEmail: confirmedEmail,
      });
      if (confirmedEmail !== pendingEmail) {
        trackEvent("paid_email_updated", {
          order_id: paymentStatus.orderId,
          character_id: paymentStatus.character,
        });
      }
    } catch (err) {
      // 실패해도 인트로 진입 차단은 X — 스위퍼가 폴백 발송. 로깅만.
      console.error("[confirm-email] failed", err);
    }
    setEmailModalOpen(false);
    setScreen("intro_play");
  };

  if (screen === "intro_play" && paymentStatus) {
    return paymentStatus.character === "doyoon" ? (
      <DoyoonPaidIntroScene onCta={handleIntroCta} />
    ) : (
      <YeonwooPaidIntroScene onCta={handleIntroCta} />
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center gap-6 bg-white px-6 py-10 text-neutral-900">
      {screen === "polling" && (
        <>
          {/* 2026-06-05: "결제 결과 확인 중"은 결제 실패 불안을 유발 (QA 피드백) →
              사주 준비 로딩으로 리프레이밍. 실제로는 webhook DONE 폴링 대기 화면. */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" aria-hidden />
          <h1 className="text-lg font-semibold">사주 결과지를 준비하고 있어요</h1>
          <p className="text-[13px] text-neutral-500">잠시만요 — 준비되는 대로 바로 이어져요.</p>
        </>
      )}

      {screen === "cancelled" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">결제가 취소되었어요</h1>
          <p className="max-w-md text-center text-[13px] text-neutral-600">
            결제가 취소되었거나 진행되지 않았습니다. 다시 시도하시려면 처음부터 진행해 주세요.
          </p>
          <Link
            href="/"
            className="rounded-full border border-neutral-300 px-5 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100"
          >
            메인으로
          </Link>
        </>
      )}

      {screen === "timeout" && (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" aria-hidden />
          <h1 className="text-xl font-semibold">결제 처리가 지연되고 있어요</h1>
          <p className="max-w-md text-center text-[13px] text-neutral-600">
            잠시 후 새로고침해 주세요. 결제가 정상 완료되었다면 결과가 표시됩니다.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-neutral-300 px-5 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100"
          >
            새로고침
          </button>
        </>
      )}

      {screen === "error" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">결제 정보 확인 실패</h1>
          <p className="max-w-md text-center text-[13px] text-neutral-600">
            {errorMsg ?? "결제 정보 확인 중 오류가 발생했어요."}
          </p>
          <Link
            href="/"
            className="rounded-full border border-neutral-300 px-5 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100"
          >
            메인으로
          </Link>
        </>
      )}

      {/* 결제 완료 직후 이메일 확인 모달 (토스 패턴 회복). 닫히면 인트로 씬. */}
      <EmailConfirmModal
        email={pendingEmail}
        open={emailModalOpen}
        onConfirm={handleEmailConfirm}
      />
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessBody />
    </Suspense>
  );
}
