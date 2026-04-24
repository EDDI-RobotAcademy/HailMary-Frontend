"use client";

import type { MouseEvent } from "react";
import { DialogueBox } from "@/components/DialogueBox";
import { MuteButton } from "@/components/MuteButton";
import type { CutStep } from "@/features/intro/domain/introSteps";

interface DialogueCutProps {
  step: Extract<CutStep, { type: "dialogue" | "sfx-dialogue" | "dramatic-dialogue" }>;
  displayedText: string;
  isComplete: boolean;
  muted: boolean;
  showSoundHint: boolean;
  fading: boolean;
  crossFading: boolean;
  flashWhite: boolean;
  onToggleMute: (e: MouseEvent) => void;
}

export function DialogueCut({
  step,
  displayedText,
  isComplete,
  muted,
  onToggleMute,
}: DialogueCutProps) {
  const speaker = (step as { speaker?: string }).speaker ?? "나";

  return (
    <div className="relative z-10 mb-20 mt-auto px-4">
      <div className="mb-2 flex justify-end">
        <MuteButton muted={muted} onToggle={onToggleMute} />
      </div>
      <DialogueBox speaker={speaker} text={displayedText} isComplete={isComplete} />
    </div>
  );
}
