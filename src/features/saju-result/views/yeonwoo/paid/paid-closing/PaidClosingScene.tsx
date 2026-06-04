"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import { DialogueBox } from "@/components/DialogueBox";
import { FadeOverlay } from "@/components/FadeOverlay";
import { usePaidClosingScene } from "./usePaidClosingScene";
import { PAID_CLOSING_STEPS } from "./paidClosingSteps";

const CHARACTER_ID = "yeonwoo";

// URL에서 orderId 추출 — EpiloguePage / PaidLoadingClient 동일 패턴.
function extractOrderIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  const m = window.location.pathname.match(/\/saju\/paid\/([^/]+)/);
  const id = m?.[1] ?? "";
  return id === "_placeholder" || id === "" ? "test-order-id" : id;
}

export function PaidClosingScene() {
  const router = useRouter();
  // orderId는 URL에서 1회 계산 (컴포넌트 생애 동안 불변) — lazy useState로 render-safe하게.
  const [orderId] = useState(extractOrderIdFromUrl);

  // 클로징 씬 마운트 1회 — paidclosing_view (dev StrictMode 이중 마운트 가드).
  const viewFiredRef = useRef(false);
  useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackEvent("paidclosing_view", {
      character_id: CHARACTER_ID,
      order_id: orderId,
    });
  }, [orderId]);

  // 컷 진행/완독 이벤트 — 훅이 시점을 알리면 character_id/order_id를 실어 발화.
  const handleClosingEvent = useCallback<
    NonNullable<Parameters<typeof usePaidClosingScene>[0]>
  >(
    (e) => {
      if (e.type === "cut_view") {
        trackEvent("paidclosing_cut_view", {
          character_id: CHARACTER_ID,
          order_id: orderId,
          scene_label: e.sceneLabel,
          cut_type: e.cutType,
        });
      } else {
        trackEvent("paidclosing_cta_reveal", {
          character_id: CHARACTER_ID,
          order_id: orderId,
          scene_label: e.sceneLabel,
        });
      }
    },
    [orderId]
  );

  const {
    step,
    stepIndex,
    displayedText,
    isComplete,
    crossFading,
    flashWhite,
    ctaRevealed,
    handleTap,
  } = usePaidClosingScene(handleClosingEvent);

  const handleFinalCta = () => {
    trackEvent("paidclosing_cross_character_click", {
      from_character: CHARACTER_ID,
      to_character: "doyoon",
      order_id: orderId,
    });
    // 도윤 무료 결과로 — 기존 세션 saju 데이터 그대로 사용
    router.push("/saju/doyoon");
  };

  const handleHome = () => {
    trackEvent("paidclosing_home_click", {
      from_character: CHARACTER_ID,
      order_id: orderId,
    });
    router.push("/");
  };

  // 다음 스텝 bg (크로스페이드 전환 중 위에 fadeIn)
  const nextStep = PAID_CLOSING_STEPS[stepIndex + 1];

  return (
    <div
      className="relative flex flex-1 flex-col animate-[fadeIn_0.8s_ease-in]"
      style={{ fontFamily: "var(--font-pretendard)" }}
      onClick={handleTap}
    >
      <Image
        src={step.bg}
        alt=""
        fill
        priority
        className="object-cover object-center"
      />

      {crossFading && nextStep && (
        <Image
          src={nextStep.bg}
          alt=""
          fill
          priority
          className="absolute inset-0 object-cover object-center animate-[fadeIn_0.4s_ease-out]"
        />
      )}

      {/* 자막 박스 — silent 컷에선 숨김 / final-cta + ctaRevealed면 CTA로 교체 */}
      {step.type !== "silent" && !ctaRevealed && (
        <div className="relative z-10 mb-20 mt-auto px-4">
          <DialogueBox
            speaker={step.speaker}
            text={displayedText}
            isComplete={isComplete}
          />
        </div>
      )}

      {/* CTA — 자막 박스가 차지하던 자리에 그대로 등장 + 메인으로 secondary */}
      {ctaRevealed && step.type === "final-cta" && (
        <div
          className="relative z-10 mt-auto mb-20 px-4 animate-[fadeIn_0.5s_ease-in]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleFinalCta}
            className="w-full rounded-md py-4 text-[15px] font-semibold tracking-[0.1em] text-[#1a1612] cursor-pointer transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              background: "linear-gradient(180deg, #E6C58E 0%, #C9A56B 100%)",
              boxShadow: "0 4px 18px rgba(201,165,107,0.35)",
            }}
          >
            {step.ctaLabel} →
          </button>
          <button
            type="button"
            onClick={handleHome}
            className="mt-3 w-full py-2 text-[13px] text-white/70 underline-offset-4 hover:underline cursor-pointer"
          >
            메인으로
          </button>
        </div>
      )}

      <FadeOverlay visible={flashWhite} color="white" durationMs={280} easing="ease-out" />
    </div>
  );
}
