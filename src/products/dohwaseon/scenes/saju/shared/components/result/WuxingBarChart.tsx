"use client";

import {
  WUXING_ELEMENTS,
  WUXING_HANJA,
  WUXING_HUES,
  type Wuxing,
} from "@/features/saju";

type Props = { wuxing: Wuxing };

const MAX_HEIGHT = 140;

export default function WuxingBarChart({ wuxing }: Props) {
  const ratios = WUXING_ELEMENTS.map((el) => wuxing.ratios[el]);
  const max = Math.max(...ratios, 1);
  const maxIdx = ratios.indexOf(max);

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-4 py-5"
      style={{
        background: "rgba(40,38,34,0.55)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(245,237,224,0.1)",
      }}
    >
      <p
        className="text-center text-[10px] tracking-[0.3em]"
        style={{ color: "#E6C58E" }}
      >
        오행 강약
      </p>
      <p
        className="mt-1 text-center text-[11px]"
        style={{ color: "#998f82" }}
      >
        내 사주 속 오행의 비율
      </p>

      <div className="mt-6 flex items-end justify-around px-2" style={{ minHeight: `${MAX_HEIGHT + 30}px` }}>
        {WUXING_ELEMENTS.map((el, i) => {
          const ratio = wuxing.ratios[el];
          const hue = WUXING_HUES[el];
          const h = (ratio / max) * MAX_HEIGHT;
          const isMax = i === maxIdx && ratio > 0;
          return (
            <div key={el} className="flex flex-col items-center gap-2">
              {isMax && (
                <div className="relative mb-1">
                  <div
                    className="rounded-md px-2 py-1 text-[10px] tracking-[0.2em]"
                    style={{
                      background: "rgba(20,19,17,0.92)",
                      color: "#FFE2B3",
                      borderTop: "1px solid rgba(230,197,142,0.3)",
                    }}
                  >
                    나의 오행
                  </div>
                </div>
              )}
              <div
                className="w-9 rounded-t-sm transition-all"
                style={{
                  height: `${h}px`,
                  background: hue,
                  boxShadow: isMax ? `0 0 20px ${hue}80` : "none",
                  opacity: ratio === 0 ? 0.2 : 1,
                }}
              />
              <div
                className="text-[13px] font-bold"
                style={{ color: hue }}
              >
                {WUXING_HANJA[el]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
