"use client";

import type { RefObject } from "react";
import type { CutStep } from "@/features/intro/domain/introSteps";

interface VideoCutProps {
  step: Extract<CutStep, { type: "video" }>;
  muted: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  onEnded: () => void;
}

export function VideoCut({ step, muted, videoRef, onEnded }: VideoCutProps) {
  return (
    <video
      ref={videoRef}
      src={step.src}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      autoPlay
      playsInline
      muted={muted}
      onEnded={onEnded}
    />
  );
}
