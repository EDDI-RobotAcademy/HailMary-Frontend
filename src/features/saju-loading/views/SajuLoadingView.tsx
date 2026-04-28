"use client";

import Image from "next/image";
import { Epilogue } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/shared/utils/analytics";
import { shuffleLoadingTmis } from "../domain/tmis";
import type { LoadingCharacter } from "../domain/types";
import TipLine from "./components/TipLine";

const epilogue = Epilogue({ subsets: ["latin"], weight: "800", display: "swap" });

const SLOT_MS = 7000;
const LOADING_BAR_MS = 10000;
const CROSSFADE_MS = 800;

const COLOR = {
  surface: "#121414",
  primary: "#ffb68d",
  primaryContainer: "#ff8c42",
  goldPulse: "#ffe16d",
  onSurface: "#e2e2e2",
  onSurfaceVariant: "#ddc1b3",
  outlineVariant: "#564338",
};

type Props = {
  character: LoadingCharacter;
};

export default function SajuLoadingView({ character }: Props) {
  const router = useRouter();
  const tmis = useMemo(() => shuffleLoadingTmis(), []);
  const [slotIdx, setSlotIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    trackEvent("loading_enter", { character_id: character });
  }, [character]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(100));
    const cycleId = window.setInterval(() => {
      setSlotIdx((i) => (i + 1) % tmis.length);
    }, SLOT_MS);
    const doneTimer = window.setTimeout(() => {
      setDone(true);
      trackEvent("loading_done", { character_id: character });
    }, LOADING_BAR_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(cycleId);
      window.clearTimeout(doneTimer);
    };
  }, [tmis.length, character]);

  useEffect(() => {
    const slug = tmis[slotIdx]?.bg.split("/").pop()?.replace(".png", "") ?? "";
    trackEvent("loading_slot_change", {
      character_id: character,
      slot_index: slotIdx,
      line_slug: slug,
    });
  }, [slotIdx, tmis, character]);

  const handleClick = () => {
    trackEvent("loading_result_clicked", { character_id: character });
    router.push(`/saju/result?character=${character}`);
  };

  const currentLine = tmis[slotIdx]?.line ?? "";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: COLOR.surface }}
    >
      {/* Layer 0: 배경 사진 스택 (크로스페이드) — 머리 보존 위해 +80px 오프셋 */}
      {tmis.map((tmi, i) => (
        <Image
          key={tmi.bg}
          src={tmi.bg}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: "center calc(50% + 80px)",
            opacity: slotIdx === i ? 1 : 0,
            transition: `opacity ${CROSSFADE_MS}ms ease`,
          }}
        />
      ))}

      {/* Layer 1: 하단 가독성용 그라디언트 베일 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(18,20,20,0.92) 0%, rgba(18,20,20,0.55) 35%, rgba(18,20,20,0) 70%)",
        }}
      />

      {/* 하단 글래스 패널 */}
      <div
        className="absolute bottom-0 left-0 w-full z-20 backdrop-blur-xl"
        style={{
          height: "min(28vh, 180px)",
          minHeight: "160px",
          background: "rgba(0,0,0,0.28)",
          borderTop: "1px solid rgba(255,140,66,0.5)",
          boxShadow: "0 -10px 20px rgba(255,140,66,0.15)",
        }}
      >
        {/* 프로그레스 레일 */}
        <div
          className="absolute left-0 w-full pointer-events-none"
          style={{
            top: "-1px",
            height: "4px",
            background: "rgba(255,140,66,0.12)",
          }}
        >
          <div
            className="relative h-full"
            style={{
              width: `${progress}%`,
              background: COLOR.primaryContainer,
              boxShadow: "0 0 15px rgba(255,140,66,0.8)",
              transition: `width ${LOADING_BAR_MS}ms linear`,
            }}
          >
            <div
              className="absolute right-0 top-0 bottom-0"
              style={{
                width: "2px",
                background: COLOR.goldPulse,
                boxShadow: `0 0 10px ${COLOR.goldPulse}`,
              }}
            />
          </div>
        </div>

        {/* 패널 내부 — 컨텐츠 하단 정렬 */}
        <div className="relative w-full h-full flex flex-col items-center justify-end px-4 sm:px-6 pb-4 text-center">
          {/* Filigree 4 모서리 */}
          {[
            "top-3 left-3 border-t-2 border-l-2",
            "top-3 right-3 border-t-2 border-r-2",
            "bottom-3 left-3 border-b-2 border-l-2",
            "bottom-3 right-3 border-b-2 border-r-2",
          ].map((cls) => (
            <div
              key={cls}
              className={`absolute w-5 h-5 sm:w-6 sm:h-6 ${cls}`}
              style={{ borderColor: COLOR.outlineVariant }}
            />
          ))}

          {/* LOADING... → "결과 보기 →" 토글 */}
          {done ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className={`${epilogue.className} uppercase animate-[fadeIn_0.4s_ease-out] cursor-pointer inline-flex items-center justify-center`}
              style={{
                fontSize: "clamp(16px, 2.6vw, 24px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                fontWeight: 800,
                color: COLOR.primaryContainer,
                background: "transparent",
                border: `1px solid ${COLOR.goldPulse}`,
                padding: "0.65rem 1.25rem 0.55rem",
                marginBottom: "0.625rem",
                filter: "drop-shadow(0 0 8px rgba(255,140,66,0.4))",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,140,66,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              결과 보기 →
            </button>
          ) : (
            <h1
              className={`${epilogue.className} uppercase`}
              style={{
                fontSize: "clamp(20px, 3.2vw, 30px)",
                lineHeight: 1.2,
                letterSpacing: "-0.04em",
                fontWeight: 800,
                color: COLOR.onSurface,
                filter: "drop-shadow(0 0 6px rgba(255,140,66,0.28))",
                marginBottom: "0.625rem",
              }}
            >
              LOADING...
            </h1>
          )}

          {/* TMI 블록 — 상하 골드 디바이더 */}
          <div
            className="flex flex-col items-center gap-1 w-full py-3 sm:py-3.5 mt-1"
            style={{
              borderTop: "1px solid rgba(164,140,127,0.3)",
              borderBottom: "1px solid rgba(164,140,127,0.3)",
            }}
          >
            <p
              className="uppercase font-bold text-[11px] sm:text-[13px]"
              style={{
                color: COLOR.primary,
                letterSpacing: "0.15em",
                lineHeight: 1.5,
              }}
            >
              TMI
            </p>
            <TipLine key={slotIdx} line={currentLine} />
          </div>
        </div>
      </div>
    </div>
  );
}
