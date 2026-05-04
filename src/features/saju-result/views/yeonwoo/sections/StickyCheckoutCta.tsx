"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/shared/utils/analytics";

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

export function StickyCheckoutCta() {
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
      className="fixed bottom-0 left-0 right-0 mx-auto z-50 px-4 pb-3 pt-3"
      style={{
        maxWidth: "28rem",
        background:
          "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%)",
      }}
    >
      <p
        className="text-center mb-2"
        style={{
          color: "#ECECEC",
          textShadow: "0 4px 4px rgba(0,0,0,0.25)",
          fontFamily: "Pretendard, sans-serif",
          fontSize: "16px",
          fontWeight: 500,
          letterSpacing: "-0.64px",
        }}
      >
        마지막 오픈 할인까지 {formatHMSD(remainingMs)}
      </p>
      <button
        type="button"
        className="w-full flex items-center justify-center"
        style={{
          height: "55px",
          borderRadius: "11px",
          background: "#D73F59",
          color: "#FFF",
          fontFamily: "Pretendard, sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          gap: "10px",
        }}
        onClick={() => {
          trackEvent("paid_report_cta_clicked", {
            character_id: "yeonwoo",
            cta_position: "sticky",
          });
          alert("결제 페이지는 준비 중이에요.");
        }}
      >
        결제하고 연우의 정밀 리포트 읽기
      </button>
    </div>
  );
}
