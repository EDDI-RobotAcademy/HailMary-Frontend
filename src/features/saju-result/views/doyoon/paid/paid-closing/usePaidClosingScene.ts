"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreloadImages } from "@/shared/hooks/usePreloadImages";
import {
  DOYOON_PAID_CLOSING_STEPS,
  DOYOON_PAID_CLOSING_CHAR_DELAY,
  DOYOON_PAID_CLOSING_DRAMATIC_STEPS,
} from "./paidClosingSteps";

// 연우 paid-closing과 동일 구조, 데이터만 도윤용.

// 클로징 씬 컷 진행/완독 분석 이벤트 콜백 (View가 character_id/order_id를 주입해 trackEvent 발화).
// 훅은 발화 시점만 결정하고 실제 trackEvent(IO)는 View 계층에 맡긴다 (의존성 방향 준수).
type PaidClosingEvent =
  | { type: "cut_view"; sceneLabel: string; cutType: string }
  | { type: "cta_reveal"; sceneLabel: string };

const TOTAL_CUTS = DOYOON_PAID_CLOSING_STEPS.length;
const sceneLabelOf = (idx: number) => `${idx + 1}/${TOTAL_CUTS}`;

export function usePaidClosingScene(
  onEvent?: (e: PaidClosingEvent) => void
) {
  const [stepIndex, setStepIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [crossFading, setCrossFading] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  // 진입 후 일정 시간 대사 박스 숨기고 탭 무시 (예: 핵심 이미지 응시 시간)
  const [holdingForDialogue, setHoldingForDialogue] = useState(false);
  // final-cta 컷에서 자막 다 본 후 탭하면 자막 사라지고 같은 자리에 CTA 노출
  const [ctaRevealed, setCtaRevealed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // onEvent를 ref로 보관 — 콜백 정체성 변화가 effect/콜백을 재실행하지 않도록.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // 첫 컷(1/10) cut_view 마운트 1회 발화 가드 (dev StrictMode 이중 마운트 방지).
  const firstCutFiredRef = useRef(false);

  const step = DOYOON_PAID_CLOSING_STEPS[stepIndex];

  // 마운트 시 첫 컷(1/10)도 cut_view로 발화 → 전 컷 분포 일관 (option A).
  useEffect(() => {
    if (firstCutFiredRef.current) return;
    firstCutFiredRef.current = true;
    const first = DOYOON_PAID_CLOSING_STEPS[0];
    onEventRef.current?.({
      type: "cut_view",
      sceneLabel: sceneLabelOf(0),
      cutType: first.type,
    });
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const images = useMemo(() => DOYOON_PAID_CLOSING_STEPS.map((s) => s.bg), []);
  usePreloadImages(images);

  const hasDialogue = true; // 모든 step에 라인 있음

  const fullText = step.lines[lineIndex] ?? "";

  useEffect(() => {
    if (!hasDialogue) {
      setIsComplete(true);
      return;
    }
    if (holdingForDialogue) return; // hold 중에는 타이핑 시작 안 함
    if (displayedCount < fullText.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedCount((c) => c + 1);
      }, DOYOON_PAID_CLOSING_CHAR_DELAY);
    } else {
      setIsComplete(true);
    }
    return clearTimer;
  }, [displayedCount, fullText, clearTimer, hasDialogue, holdingForDialogue]);

  // step 진입 시 dialogueDelayMs 처리 (hold + 자동 해제)
  useEffect(() => {
    const delayMs =
      step.type === "dramatic-dialogue" ? step.dialogueDelayMs ?? 0 : 0;
    if (delayMs > 0) {
      setHoldingForDialogue(true);
      const t = setTimeout(() => setHoldingForDialogue(false), delayMs);
      return () => clearTimeout(t);
    }
    setHoldingForDialogue(false);
  }, [stepIndex, step]);

  const goToStep = useCallback((next: number) => {
    if (next >= DOYOON_PAID_CLOSING_STEPS.length) return;
    const nextStep = DOYOON_PAID_CLOSING_STEPS[next];

    // 다음 step이 dramatic-dialogue면 전환 시작 시점에 플래시 발화 + 이전 컷
    // 대사 박스 즉시 숨김 (플래시 동안 남는 박스 어색함 방지).
    // hold는 stepIndex 갱신 후 step useEffect에서 다시 dialogueDelayMs 만큼 연장.
    if (nextStep && nextStep.type === "dramatic-dialogue") {
      setHoldingForDialogue(true);
      const color = nextStep.flashColor ?? "white";
      if (color === "red") {
        setFlashRed(true);
        setTimeout(() => setFlashRed(false), 600);
      } else {
        setFlashWhite(true);
        setTimeout(() => setFlashWhite(false), 550);
      }
    }

    const dramatic = DOYOON_PAID_CLOSING_DRAMATIC_STEPS.has(stepIndex);
    const duration = dramatic ? 700 : 400;
    setCrossFading(true);
    setTimeout(() => {
      setStepIndex(next);
      setLineIndex(0);
      setDisplayedCount(0);
      setIsComplete(false);
      setCrossFading(false);
      // 컷 진입 시점에 cut_view 발화 (2/10 ~ 10/10). 1/10은 마운트 effect가 담당.
      onEventRef.current?.({
        type: "cut_view",
        sceneLabel: sceneLabelOf(next),
        cutType: DOYOON_PAID_CLOSING_STEPS[next].type,
      });
    }, duration);
  }, [stepIndex]);

  const handleTap = () => {
    if (crossFading || holdingForDialogue) return;
    if (ctaRevealed) return; // CTA 노출 후엔 버튼 클릭만 받음 (탭으로 진행 X)

    const lines = step.lines;
    if (!isComplete) {
      clearTimer();
      setDisplayedCount(fullText.length);
      setIsComplete(true);
    } else if (lineIndex < lines.length - 1) {
      setLineIndex(lineIndex + 1);
      setDisplayedCount(0);
      setIsComplete(false);
    } else if (step.type === "final-cta") {
      // 마지막 컷: 자막 완료 + 탭 → 자막 사라지고 같은 자리에 CTA 등장 (="끝까지 봄"=완독)
      onEventRef.current?.({
        type: "cta_reveal",
        sceneLabel: sceneLabelOf(stepIndex),
      });
      setCtaRevealed(true);
    } else if (stepIndex < DOYOON_PAID_CLOSING_STEPS.length - 1) {
      goToStep(stepIndex + 1);
    }
  };

  return {
    step,
    stepIndex,
    displayedText: fullText.slice(0, displayedCount),
    isComplete,
    crossFading,
    flashWhite,
    flashRed,
    holdingForDialogue,
    ctaRevealed,
    handleTap,
  };
}
