"use client";

import Image from "next/image";
import { CtaButton } from "@/shared/components/CtaButton";
import { useLanding } from "../hooks/useLanding";

export function LandingView() {
  const { fading, handleStart } = useLanding();

  return (
    <div className="relative flex flex-1 items-end justify-center">
      <Image
        src="/landing-poster.png"
        alt="도화선 — 운명을 태우고 너에게 닿을, 붉은 실"
        fill
        priority
        className="object-cover object-top"
      />
      <CtaButton
        label="1화 연애운편 시작하기"
        gradient="from-purple-600 via-violet-500 to-purple-600"
        onClick={handleStart}
      />
      <div
        className="pointer-events-none absolute inset-0 z-20 bg-black"
        style={{
          opacity: fading ? 1 : 0,
          transition: "opacity 0.8s ease-in",
        }}
      />
    </div>
  );
}
