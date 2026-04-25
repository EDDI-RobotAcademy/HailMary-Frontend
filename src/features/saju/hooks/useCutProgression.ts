"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CutShape = {
  type: string;
  lines?: string[];
};

export type UseCutProgressionOptions = {
  crossfadeOnEnter: Set<number>;
};

const CHAR_DELAY = 32;
const AUTO_ADVANCE_DELAY_MS = 1400;
const LEAN_IN_ZOOM_DELAY_MS = 250;
const CTA_AFTER_LINE_DELAY_MS = 600;
const DARK_FADE_DURATION_MS = 380;
const LIGHT_FADE_DURATION_MS = 280;
const CROSSFADE_DURATION_MS = 400;

const UI_CUT_TYPES = new Set<string>([
  "info-form",
  "analysis-loading",
  "analysis-result",
  "survey",
  "tablet-handoff",
  "scene-pause",
]);

function hasLines<C extends CutShape>(c: C): c is C & { lines: string[] } {
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
  const transitioning = useRef(false);
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

  useEffect(() => {
    if (!hasLines(cut)) return;
    if (displayedCount >= fullText.length) return;
    timerRef.current = setTimeout(() => {
      setDisplayedCount((c) => c + 1);
    }, CHAR_DELAY);
    return clearTyping;
  }, [displayedCount, fullText, clearTyping, cut]);

  const goToCut = useCallback(
    (next: number) => {
      if (transitioning.current) return;
      const nextCut = cuts[next];
      if (!nextCut) return;

      transitioning.current = true;
      const useCrossfade = crossfadeOnEnter.has(next);

      if (useCrossfade) {
        setCrossFading(true);
        setTimeout(() => {
          setCutIndex(next);
          resetLineState();
          setLeanInZoomed(false);
          setCtaVisible(false);
          setCrossFading(false);
          transitioning.current = false;
        }, CROSSFADE_DURATION_MS);
        return;
      }

      const needsDarkFade = isUiCut(cut) || isUiCut(nextCut);
      const duration = needsDarkFade ? DARK_FADE_DURATION_MS : LIGHT_FADE_DURATION_MS;

      setFading(true);
      setTimeout(() => {
        setCutIndex(next);
        resetLineState();
        setLeanInZoomed(false);
        setCtaVisible(false);
        setFading(false);
        transitioning.current = false;
      }, duration);
    },
    [cut, cuts, crossfadeOnEnter, resetLineState],
  );

  // tablet-handoff / scene-pause 자동 진행
  useEffect(() => {
    if (cut.type !== "tablet-handoff" && cut.type !== "scene-pause") return;
    const t = setTimeout(() => goToCut(cutIndex + 1), AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [cutIndex, cut.type, goToCut]);

  // final-leanin 줌
  useEffect(() => {
    if (cut.type !== "final-leanin") return;
    const t = setTimeout(() => setLeanInZoomed(true), LEAN_IN_ZOOM_DELAY_MS);
    return () => clearTimeout(t);
  }, [cutIndex, cut.type]);

  // final-leanin CTA 노출
  useEffect(() => {
    if (cut.type !== "final-leanin") return;
    if (!isComplete || !hasLines(cut) || lineIndex !== cut.lines.length - 1) return;
    const t = setTimeout(() => setCtaVisible(true), CTA_AFTER_LINE_DELAY_MS);
    return () => clearTimeout(t);
  }, [cut, isComplete, lineIndex]);

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

    if (cut.type === "final-leanin") return;

    goToCut(cutIndex + 1);
  }, [crossFading, fading, cut, isComplete, clearTyping, fullText, lineIndex, cutIndex, goToCut]);

  const jumpTo = useCallback(
    (delta: -1 | 1) => {
      const next = Math.max(0, Math.min(cuts.length - 1, cutIndex + delta));
      if (next === cutIndex) return;
      clearTyping();
      transitioning.current = false;
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
    cut, cutIndex, lineIndex, displayedCount, fullText,
    isComplete, fading, crossFading, leanInZoomed, ctaVisible,
    handleTap, goToCut, jumpTo,
  };
}
