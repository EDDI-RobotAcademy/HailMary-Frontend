"use client";

// 도화선 사주 씬 공용 시네마틱 상태기계.
// 컷 진행, 타이핑, 페이드/크로스페이드, lean-in 줌, CTA 노출 타이밍을 한 곳에서 관리.
// 도윤/연우 씬이 각자 cuts 배열과 crossfadeOnEnter 만 주입해서 재사용한다.

import { useCallback, useEffect, useRef, useState } from "react";

// 훅이 기대하는 최소 Cut shape. 각 캐릭터 Cut 타입은 이걸 만족하는 super-type.
export type CutShape = {
  type: string;
  lines?: string[];
};

export type UseCutProgressionOptions = {
  // 이 인덱스의 컷으로 "진입"할 때 크로스페이드 사용 (같은 인물 표정/구도 변화 등).
  crossfadeOnEnter: Set<number>;
};

// 도윤/연우 공통 타이밍 상수. 연출 톤이 동일하므로 하드코딩.
const CHAR_DELAY = 32;
const AUTO_ADVANCE_DELAY_MS = 1400;
const LEAN_IN_ZOOM_DELAY_MS = 250;
const CTA_AFTER_LINE_DELAY_MS = 600;
const DARK_FADE_DURATION_MS = 380;
const LIGHT_FADE_DURATION_MS = 280;
const CROSSFADE_DURATION_MS = 400;

// "UI가 주체"인 컷 — 진입/이탈 시 다크 페이드 사용.
const UI_CUT_TYPES = new Set<string>([
  "info-form",
  "analysis-loading",
  "analysis-result",
  "survey",
  "tablet-handoff",
]);

function hasLines<C extends CutShape>(
  c: C,
): c is C & { lines: string[] } {
  return Array.isArray(c.lines);
}

function isUiCut<C extends CutShape>(c: C): boolean {
  return UI_CUT_TYPES.has(c.type);
}

export function useCutProgression<C extends CutShape>(
  cuts: C[],
  options: UseCutProgressionOptions,
) {
  const { crossfadeOnEnter } = options;

  const [cutIndex, setCutIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [fading, setFading] = useState(false);
  const [crossFading, setCrossFading] = useState(false);
  const [leanInZoomed, setLeanInZoomed] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cut = cuts[cutIndex];

  const fullText = hasLines(cut) ? cut.lines[lineIndex] ?? "" : "";
  const isComplete =
    hasLines(cut) && fullText.length > 0 && displayedCount >= fullText.length;

  const clearTyping = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetLineState = useCallback(() => {
    setLineIndex(0);
    setDisplayedCount(0);
  }, []);

  // 타이핑 효과
  useEffect(() => {
    if (!hasLines(cut)) return;
    if (displayedCount >= fullText.length) return;
    timerRef.current = setTimeout(() => {
      setDisplayedCount((c) => c + 1);
    }, CHAR_DELAY);
    return clearTyping;
  }, [displayedCount, fullText, clearTyping, cut]);

  // 컷 이동
  const goToCut = useCallback(
    (next: number) => {
      const nextCut = cuts[next];
      if (!nextCut) return;

      const useCrossfade = crossfadeOnEnter.has(next);

      if (useCrossfade) {
        setCrossFading(true);
        setTimeout(() => {
          setCutIndex(next);
          resetLineState();
          setLeanInZoomed(false);
          setCtaVisible(false);
          setCrossFading(false);
        }, CROSSFADE_DURATION_MS);
        return;
      }

      const needsDarkFade = isUiCut(cut) || isUiCut(nextCut);
      const duration = needsDarkFade
        ? DARK_FADE_DURATION_MS
        : LIGHT_FADE_DURATION_MS;

      setFading(true);
      setTimeout(() => {
        setCutIndex(next);
        resetLineState();
        setLeanInZoomed(false);
        setCtaVisible(false);
        setFading(false);
      }, duration);
    },
    [cut, cuts, crossfadeOnEnter, resetLineState],
  );

  // tablet-handoff 자동 진행 (1.4초)
  useEffect(() => {
    if (cut.type !== "tablet-handoff") return;
    const t = setTimeout(() => goToCut(cutIndex + 1), AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [cutIndex, cut.type, goToCut]);

  // final-leanin 진입 시 줌 전환
  useEffect(() => {
    if (cut.type !== "final-leanin") return;
    const t = setTimeout(() => setLeanInZoomed(true), LEAN_IN_ZOOM_DELAY_MS);
    return () => clearTimeout(t);
  }, [cutIndex, cut.type]);

  // final-leanin 마지막 라인 후 CTA 노출
  useEffect(() => {
    if (cut.type !== "final-leanin") return;
    if (!isComplete || !hasLines(cut) || lineIndex !== cut.lines.length - 1)
      return;
    const t = setTimeout(() => setCtaVisible(true), CTA_AFTER_LINE_DELAY_MS);
    return () => clearTimeout(t);
  }, [cut, isComplete, lineIndex]);

  // 탭 처리 (대사 컷에서만 의미 있음)
  const handleTap = useCallback(() => {
    if (crossFading || fading) return;
    if (!hasLines(cut)) return;

    if (!isComplete) {
      clearTyping();
      setDisplayedCount(fullText.length);
      return;
    }

    if (lineIndex < cut.lines.length - 1) {
      setLineIndex(lineIndex + 1);
      setDisplayedCount(0);
      return;
    }

    // final-leanin은 마지막 라인 후 CTA만 표시, 탭으로 다음 컷 진행 안 함
    if (cut.type === "final-leanin") return;

    goToCut(cutIndex + 1);
  }, [
    crossFading,
    fading,
    cut,
    isComplete,
    clearTyping,
    fullText,
    lineIndex,
    cutIndex,
    goToCut,
  ]);

  // 개발용 네비
  const jumpTo = useCallback(
    (delta: -1 | 1) => {
      const next = Math.max(0, Math.min(cuts.length - 1, cutIndex + delta));
      if (next === cutIndex) return;
      clearTyping();
      setCutIndex(next);
      resetLineState();
      setFading(false);
      setCrossFading(false);
      setLeanInZoomed(false);
      setCtaVisible(false);
    },
    [cuts.length, cutIndex, clearTyping, resetLineState],
  );

  return {
    cut,
    cutIndex,
    lineIndex,
    displayedCount,
    fullText,
    isComplete,
    fading,
    crossFading,
    leanInZoomed,
    ctaVisible,
    handleTap,
    goToCut,
    jumpTo,
  };
}
