"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/shared/utils/analytics";

const PRIMARY_COLOR = "#E94E3F";
const TEXT_COLOR = "#2a1f15";
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

function formatHMSD(totalMs: number): string {
  const ms = Math.max(0, totalMs);
  const totalDecis = Math.floor(ms / 100);
  const h = Math.floor(totalDecis / 36000);
  const m = Math.floor((totalDecis % 36000) / 600);
  const s = Math.floor((totalDecis % 600) / 10);
  const d = totalDecis % 10;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${d}`;
}

type Props = {
  ctaLabel: string;
  characterId: "doyoon" | "yeonwoo";
  visible?: boolean;
  onCheckout?: () => void;
};

export default function StickyCheckoutCta({
  ctaLabel,
  characterId,
  visible = true,
  onCheckout,
}: Props) {
  const [endAt, setEndAt] = useState<number>(() => Date.now() + TWELVE_HOURS_MS);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (now >= endAt) {
      setEndAt(now + TWELVE_HOURS_MS);
    }
  }, [now, endAt]);

  const remainingMs = Math.max(0, endAt - now);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 mx-auto z-50 px-4 pb-3 pt-4"
      style={{
        maxWidth: "28rem",
        background:
          "linear-gradient(to top, rgba(253,245,234,0.98) 0%, rgba(253,245,234,0.92) 65%, rgba(253,245,234,0) 100%)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <p
        className="text-center mb-2"
        style={{
          color: TEXT_COLOR,
          fontFamily: "Pretendard, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        마지막 오픈 할인까지 {formatHMSD(remainingMs)}
      </p>
      <button
        type="button"
        className="w-full"
        style={{
          height: "55px",
          borderRadius: "11px",
          background: PRIMARY_COLOR,
          color: "#FFF",
          fontFamily: "Pretendard, sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          boxShadow: "0 6px 18px rgba(233,78,63,0.28)",
        }}
        onClick={() => {
          trackEvent("paid_report_cta_clicked", {
            character_id: characterId,
            cta_position: "sticky",
          });
          if (onCheckout) {
            onCheckout();
          } else {
            alert("결제 페이지는 준비 중이에요.");
          }
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
