"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingScene() {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    setFading(true);
    setTimeout(() => router.push("/intro"), 900);
  };

  return (
    <div className="relative flex flex-1 items-end justify-center">
      <Image
        src="/landing-poster.png"
        alt="도화선 — 운명을 태우고 너에게 닿을, 붉은 실"
        fill
        priority
        className="object-cover object-top"
      />
      <div className="relative z-10 flex w-full flex-col items-center px-8 pb-12">
        <button
          onClick={handleStart}
          className="w-full rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-purple-900/30 transition-opacity hover:opacity-90 active:opacity-80"
        >
          1화 연애운편 시작하기
        </button>
      </div>

      {/* 페이드 투 블랙 오버레이 */}
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
