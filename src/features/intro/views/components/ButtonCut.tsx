"use client";

import type { CutStep } from "@/features/intro/domain/introSteps";

interface ButtonCutProps {
  step: Extract<CutStep, { type: "button" }>;
  bgImage: string;
  fading: boolean;
  onNext: () => void;
}

export function ButtonCut({ step, fading, onNext }: ButtonCutProps) {
  if (fading) return null;

  return (
    <div className="relative z-10 mb-20 mt-auto px-8">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="w-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-orange-500 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-red-900/40 transition-opacity hover:opacity-90 active:opacity-80"
      >
        {step.label}
      </button>
    </div>
  );
}
