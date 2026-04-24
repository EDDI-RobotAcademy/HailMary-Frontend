"use client";

import Image from "next/image";
import type { CutStep } from "@/features/intro/domain/introSteps";

interface FlashSequenceCutProps {
  step: Extract<CutStep, { type: "flash-sequence" }>;
  flashSeqIndex: number;
  flashSeqWhite: boolean;
}

export function FlashSequenceCut({ step, flashSeqIndex, flashSeqWhite }: FlashSequenceCutProps) {
  return (
    <div className="absolute inset-0 z-20 bg-black">
      <Image
        src={step.images[flashSeqIndex].src}
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-white"
        style={{
          opacity: flashSeqWhite ? 1 : 0,
          transition: "opacity 0.2s ease-out",
        }}
      />
    </div>
  );
}
