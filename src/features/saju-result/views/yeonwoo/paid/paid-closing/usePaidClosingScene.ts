"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreloadImages } from "@/shared/hooks/usePreloadImages";
import {
  PAID_CLOSING_STEPS,
  PAID_CLOSING_CHAR_DELAY,
  PAID_CLOSING_DRAMATIC_STEPS,
} from "./paidClosingSteps";

// paid-intro의 useIntroScene 패턴을 단순화한 버전.
// - 타이핑 → 탭으로 라인 진행 → 탭으로 다음 스텝
// - 진입이 'dramatic'인 스텝은 화이트 플래시 + 살짝 긴 페이드
// - silent 스텝은 대사 없이 탭으로 진행

// 클로징 씬 컷 진행/완독 분석 이벤트 콜백 (View가 character_id/order_id를 주입해 trackEvent 발화).
// 훅은 발화 시점만 결정하고 실제 trackEvent(IO)는 View 계층에 맡긴다 (의존성 방향 준수).
type PaidClosingEvent =
  | { type: "cut_view"; sceneLabel: string; cutType: string }
  | { type: "cta_reveal"; sceneLabel: string };

const TOTAL_CUTS = PAID_CLOSING_STEPS.length;
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
  // final-cta 컷에서 자막 다 본 후 탭 → 자막 사라지고 같은 자리에 CTA 노출
  const [ctaRevealed, setCtaRevealed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // onEvent를 ref로 보관 — 콜백 정체성 변화가 effect/콜백을 재실행하지 않도록.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // 첫 컷(1/10) cut_view 마운트 1회 발화 가드 (dev StrictMode 이중 마운트 방지).
  const firstCutFiredRef = useRef(false);

  const step = PAID_CLOSING_STEPS[stepIndex];

  // 마운트 시 첫 컷(1/10)도 cut_view로 발화 → 전 컷 분포 일관 (option A).
  useEffect(() => {
    if (firstCutFiredRef.current) return;
    firstCutFiredRef.current = true;
    const first = PAID_CLOSING_STEPS[0];
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

  // 모든 bg 프리로드
  const images = useMemo(() => PAID_CLOSING_STEPS.map((s) => s.bg), []);
  usePreloadImages(images);

  const hasDialogue =
    step.type === "dialogue" ||
    step.type === "dramatic-dialogue" ||
    step.type === "final-cta";

  const fullText = hasDialogue ? step.lines[lineIndex] ?? "" : "";

  // 타이핑 효과
  useEffect(() => {
    if (!hasDialogue) {
      setIsComplete(true);
      return;
    }
    if (displayedCount < fullText.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedCount((c) => c + 1);
      }, PAID_CLOSING_CHAR_DELAY);
    } else {
      setIsComplete(true);
    }
    return clearTimer;
  }, [displayedCount, fullText, clearTimer, hasDialogue]);

  // 극적 진입: 진입 시 화이트 플래시
  useEffect(() => {
    if (step.type === "dramatic-dialogue") {
      setFlashWhite(true);
      const t = setTimeout(() => setFlashWhite(false), 280);
      return () => clearTimeout(t);
    }
  }, [stepIndex, step.type]);

  const goToStep = useCallback((next: number) => {
    if (next >= PAID_CLOSING_STEPS.length) return;

    // 진한 크로스페이드 단계는 더 긴 페이드
    const dramatic = PAID_CLOSING_DRAMATIC_STEPS.has(stepIndex);
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
        cutType: PAID_CLOSING_STEPS[next].type,
      });
    }, duration);
  }, [stepIndex]);

  const handleTap = () => {
    if (crossFading) return;
    if (ctaRevealed) return; // CTA 노출 후엔 버튼 클릭만 받음

    if (step.type === "silent") {
      goToStep(stepIndex + 1);
      return;
    }
    if (!hasDialogue) return;

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
    } else if (stepIndex < PAID_CLOSING_STEPS.length - 1) {
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
    ctaRevealed,
    handleTap,
  };
}
