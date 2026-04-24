"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { DialogueBox } from "@/components/DialogueBox";
import { MuteButton } from "@/components/MuteButton";
import type { CutStep } from "@/features/intro/domain/introSteps";

interface PhoneCutProps {
  step: Extract<CutStep, { type: "phone" }>;
  visibleNotifs: number;
  phonePhase: "animating" | "dialogue";
  displayedText: string;
  isComplete: boolean;
  muted: boolean;
  fading: boolean;
  onToggleMute: (e: MouseEvent) => void;
}

export function PhoneCut({
  step,
  visibleNotifs,
  phonePhase,
  displayedText,
  isComplete,
  muted,
  fading,
  onToggleMute,
}: PhoneCutProps) {
  return (
    <>
      {/* 핸드폰 알림 팝업 — 새 알림이 위로, 기존 알림은 뒤로 밀려 그림자처럼 */}
      {!fading && (
        <div className="pointer-events-none absolute inset-0 z-30">
          {step.notifications.map((src, i) => {
            const isVisible = i < visibleNotifs;
            const depth = Math.max(0, visibleNotifs - 1 - i);
            const yOffset = depth * 14;
            const scale = 1 - depth * 0.05;
            const opacity = isVisible ? Math.max(0.35, 1 - depth * 0.45) : 0;
            return (
              <div
                key={src}
                className="absolute left-1/2 w-[92%]"
                style={{
                  top: "38%",
                  zIndex: 50 - depth,
                  opacity,
                  transform: isVisible
                    ? `translate(-50%, ${yOffset}px) scale(${scale})`
                    : `translate(-50%, 0) scale(0.94)`,
                  transition:
                    "opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <Image
                  src={src}
                  alt="알림"
                  width={400}
                  height={80}
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 대사 단계 */}
      {phonePhase === "dialogue" && !fading && (
        <div className="relative z-10 mb-20 mt-auto px-4">
          <div className="mb-2 flex justify-end">
            <MuteButton muted={muted} onToggle={onToggleMute} />
          </div>
          <DialogueBox
            speaker={step.speaker ?? "나"}
            text={displayedText}
            isComplete={isComplete}
          />
        </div>
      )}
    </>
  );
}
