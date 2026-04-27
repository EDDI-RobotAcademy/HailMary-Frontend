"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, RefObject } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import {
  STEPS,
  CHAR_DELAY,
  CROSSFADE_ENTER_STEPS,
  FADEOUT_EXIT_STEPS,
  playSfx,
} from "../domain/introSteps";

export function useIntroScene() {
  const router = useRouter();
  const [started] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showSoundHint, setShowSoundHint] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fading, setFading] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);
  const [visibleNotifs, setVisibleNotifs] = useState(0);
  const [phonePhase, setPhonePhase] = useState<"animating" | "dialogue">("animating");
  const [flashSeqIndex, setFlashSeqIndex] = useState(0);
  const [flashSeqWhite, setFlashSeqWhite] = useState(false);
  const [crossFading, setCrossFading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // stale closure 방지 — goToStep 내부에서 현재 stepIndex 접근
  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;

  const step = STEPS[stepIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 사운드 안내 10초 후 사라짐
  useEffect(() => {
    const t = setTimeout(() => setShowSoundHint(false), 10000);
    return () => clearTimeout(t);
  }, []);

  // BGM 초기화
  useEffect(() => {
    const audio = new Audio("/intro-bgm.m4a");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const hasDialogue =
    step.type === "dialogue" ||
    step.type === "sfx-dialogue" ||
    step.type === "dramatic-dialogue" ||
    (step.type === "phone" && phonePhase === "dialogue");

  const fullText = hasDialogue
    ? (step as { lines: string[] }).lines[lineIndex] ?? ""
    : "";

  // 타이핑 효과
  useEffect(() => {
    if (!started || !hasDialogue) return;
    if (displayedCount < fullText.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedCount((c) => c + 1);
      }, CHAR_DELAY);
    } else {
      setIsComplete(true);
    }
    return clearTimer;
  }, [displayedCount, fullText, clearTimer, started, hasDialogue]);

  // 복도(stepIndex 7)부터 BGM 정지
  useEffect(() => {
    if (stepIndex >= 7 && audioRef.current) {
      audioRef.current.pause();
    }
  }, [stepIndex]);

  // 씬 진입 시점에 scenario_progress 발화
  useEffect(() => {
    trackEvent("scenario_progress", {
      chapter_index: stepIndex,
      scene_label: `${stepIndex + 1}/${STEPS.length}`,
    });
  }, [stepIndex]);

  // sfx-dialogue: 스텝 진입 시 효과음 재생
  useEffect(() => {
    if (!started) return;
    if (step.type === "sfx-dialogue") {
      playSfx(step.sfx, muted);
    }
  }, [stepIndex, started, step.type, muted]);

  // phone: 진입 시 상태 리셋
  useEffect(() => {
    if (!started || step.type !== "phone") return;
    setVisibleNotifs(0);
    setPhonePhase("animating");
  }, [stepIndex, started, step.type]);

  // dramatic-dialogue: 화이트 플래시 + 효과음
  useEffect(() => {
    if (!started || step.type !== "dramatic-dialogue") return;
    setFlashWhite(true);
    if (step.sfx) {
      playSfx(step.sfx, muted);
    }
    const t = setTimeout(() => setFlashWhite(false), 300);
    return () => clearTimeout(t);
  }, [stepIndex, started, step.type, muted]);

  // 페이드 전환으로 다음 스텝 이동
  const goToStep = useCallback((next: number) => {
    const nextStep = STEPS[next];

    if (CROSSFADE_ENTER_STEPS.has(next)) {
      videoRef.current?.pause();
      setCrossFading(true);
      setTimeout(() => {
        setStepIndex(next);
        setLineIndex(0);
        setDisplayedCount(0);
        setIsComplete(false);
        setCrossFading(false);
      }, 400);
      return;
    }

    // 즉시 전환 타입 (video / button / door / flash-sequence / sfx-dialogue / dramatic-dialogue)
    if (
      nextStep?.type === "video" ||
      nextStep?.type === "button" ||
      nextStep?.type === "door" ||
      nextStep?.type === "flash-sequence" ||
      nextStep?.type === "sfx-dialogue" ||
      nextStep?.type === "dramatic-dialogue"
    ) {
      setStepIndex(next);
      setLineIndex(0);
      setDisplayedCount(0);
      setIsComplete(false);
      return;
    }

    // 기본: 페이드 투 블랙 (dialogue / phone 등)
    const duration = FADEOUT_EXIT_STEPS.has(stepIndexRef.current) ? 1200 : 300;
    setFading(true);
    setTimeout(() => {
      setStepIndex(next);
      setLineIndex(0);
      setDisplayedCount(0);
      setIsComplete(false);
      setFading(false);
    }, duration);
  }, []);

  // flash-sequence: 자동 이미지 시퀀스 → /select 라우팅
  useEffect(() => {
    if (!started || step.type !== "flash-sequence") return;
    setFlashSeqIndex(0);
    setFlashSeqWhite(true);

    const images = step.images;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    images.forEach((img, i) => {
      timers.push(setTimeout(() => { setFlashSeqWhite(true); setFlashSeqIndex(i); }, elapsed));
      timers.push(setTimeout(() => { setFlashSeqWhite(false); }, elapsed + 200));
      elapsed += img.duration;
    });
    timers.push(setTimeout(() => { router.replace("/select"); }, elapsed));

    return () => timers.forEach(clearTimeout);
  }, [stepIndex, started, step.type, router]);

  const enableSound = () => {
    if (!muted) return;
    setMuted(false);
    setShowSoundHint(false);
    const audio = audioRef.current;
    if (audio && stepIndex < 7) {
      audio.muted = false;
      audio.play().catch(() => {});
    }
  };

  const toggleMute = (e: MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.muted = false;
      if (stepIndex < 7) audio.play().catch(() => {});
    } else {
      audio.muted = true;
    }
    setMuted(!muted);
  };

  const handleTap = () => {
    if (crossFading) return;
    if (muted) enableSound();

    // phone animating 중 탭 → 알림 한 개씩 노출
    if (step.type === "phone" && phonePhase === "animating") {
      const total = step.notifications.length;
      if (visibleNotifs < total) {
        playSfx(step.sfx, muted);
        setVisibleNotifs(visibleNotifs + 1);
      } else {
        setPhonePhase("dialogue");
      }
      return;
    }

    if (!hasDialogue) return;

    const lines = (step as { lines: string[] }).lines;
    if (!isComplete) {
      clearTimer();
      setDisplayedCount(fullText.length);
      setIsComplete(true);
    } else if (lineIndex < lines.length - 1) {
      setLineIndex(lineIndex + 1);
      setDisplayedCount(0);
      setIsComplete(false);
    } else {
      goToStep(stepIndex + 1);
    }
  };

  const handleVideoEnd = () => { goToStep(stepIndex + 1); };
  const handleDoorClick = () => { goToStep(stepIndex + 1); };
  const handleButtonClick = () => { goToStep(stepIndex + 1); };

  // 개발용 씬 점프 — 전환 효과 없이 바로 이동
  const jumpToStep = (delta: -1 | 1) => (e: MouseEvent) => {
    e.stopPropagation();
    const next = Math.max(0, Math.min(STEPS.length - 1, stepIndex + delta));
    if (next === stepIndex) return;
    clearTimer();
    setStepIndex(next);
    setLineIndex(0);
    setDisplayedCount(0);
    setIsComplete(false);
    setFading(false);
    setCrossFading(false);
    setFlashWhite(false);
    setVisibleNotifs(0);
    setPhonePhase("animating");
    setFlashSeqIndex(0);
    setFlashSeqWhite(false);
  };

  const bgImage = (() => {
    if ("bg" in step) return (step as { bg: string }).bg;
    if (step.type === "button") {
      const prev = STEPS[stepIndex - 1];
      return prev && "bg" in prev ? (prev as { bg: string }).bg : "";
    }
    return "";
  })();

  const showDialogue =
    started &&
    !fading &&
    !crossFading &&
    (step.type === "dialogue" ||
      step.type === "sfx-dialogue" ||
      step.type === "dramatic-dialogue" ||
      (step.type === "phone" && phonePhase === "dialogue"));

  return {
    step,
    stepIndex,
    bgImage,
    displayedText: fullText.slice(0, displayedCount),
    isComplete,
    showDialogue,
    fading,
    crossFading,
    flashWhite,
    muted,
    showSoundHint,
    visibleNotifs,
    phonePhase,
    flashSeqIndex,
    flashSeqWhite,
    handleTap,
    handleVideoEnd,
    handleDoorClick,
    handleButtonClick,
    toggleMute,
    jumpToStep,
    videoRef: videoRef as RefObject<HTMLVideoElement>,
  };
}
