"use client";

import {
  WUXING_ELEMENTS,
  WUXING_HANJA,
  WUXING_HUES,
  type DayMaster,
  type Wuxing,
  type YongSinSlot,
  type YongSinView,
} from "@/features/saju";

type Props = {
  wuxing: Wuxing;
  yongSin: YongSinView | null;
  dayMaster: DayMaster;
};

const STRENGTH_LABELS = [
  "극약",
  "태약",
  "신약",
  "중화",
  "신강",
  "태강",
  "극왕",
] as const;

export default function YongSinPanel({ wuxing, yongSin, dayMaster }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-5"
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
        오행·용신·신강신약
      </p>

      {/* 오행 비율 리스트 */}
      <div className="mt-4 flex flex-col gap-1.5">
        {WUXING_ELEMENTS.map((el) => {
          const ratio = wuxing.ratios[el];
          const judgment = wuxing.judgments[el];
          const isOver = judgment === "과다";
          const hue = WUXING_HUES[el];
          return (
            <div
              key={el}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{
                background: isOver
                  ? "rgba(245,237,224,0.08)"
                  : "transparent",
                borderTop: isOver
                  ? "1px solid rgba(245,237,224,0.12)"
                  : "1px solid transparent",
              }}
            >
              <span
                className="text-[13px] font-bold tracking-[0.05em]"
                style={{ color: hue }}
              >
                {el} {WUXING_HANJA[el]}
              </span>
              <span
                className="text-[12px] tabular-nums"
                style={{ color: isOver ? "#FFE2B3" : "#D0C5B6" }}
              >
                {ratio.toFixed(1)}% · {judgment}
              </span>
            </div>
          );
        })}
      </div>

      {/* 용신 / 희신 / 기신 */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <YongSinCircle label="용신" slot={yongSin?.primary ?? null} />
        <YongSinCircle label="희신" slot={yongSin?.secondary ?? null} />
        <YongSinCircle
          label="기신"
          slot={yongSin?.opposing ?? null}
          warn
        />
      </div>
      <p
        className="mt-3 text-center text-[10px]"
        style={{ color: "#998f82" }}
      >
        * 억부용신 및 조후용신을 고려한 결과입니다.
      </p>

      {/* 신강신약 게이지 */}
      <div className="mt-5">
        <p
          className="text-[11px] tracking-[0.25em]"
          style={{ color: "#D0C5B6" }}
        >
          신강신약
        </p>
        <div className="mt-3 flex items-center justify-between">
          {STRENGTH_LABELS.map((lab, i) => {
            const pos = i + 1;
            const active = pos === dayMaster.strengthPosition;
            const dotSize = active ? 18 : 10;
            return (
              <div key={lab} className="flex flex-1 flex-col items-center">
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    background: gaugeColor(pos),
                    boxShadow: active
                      ? `0 0 14px ${gaugeColor(pos)}aa`
                      : "none",
                    border: active
                      ? "2px solid rgba(255,226,179,0.6)"
                      : "none",
                  }}
                />
                <span
                  className="mt-2 text-[10px] tracking-[0.1em]"
                  style={{
                    color: active ? "#FFE2B3" : "#998f82",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {lab}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="mt-4 rounded-xl px-4 py-3 text-center text-[12px]"
          style={{
            background: "rgba(245,237,224,0.05)",
            borderTop: "1px solid rgba(245,237,224,0.08)",
            color: "#F5EDE0",
          }}
        >
          일간{" "}
          <strong style={{ color: "#FFE2B3" }}>
            &lsquo;{dayMaster.stem}&rsquo;
          </strong>
          ,{" "}
          <strong style={{ color: "#FFE2B3" }}>
            &lsquo;{dayMaster.strengthLevel}&rsquo;
          </strong>
          한 사주입니다.
        </div>
      </div>
    </div>
  );
}

function YongSinCircle({
  label,
  slot,
  warn = false,
}: {
  label: string;
  slot: YongSinSlot | null;
  warn?: boolean;
}) {
  const hasValue = slot !== null;
  const hue = hasValue
    ? (WUXING_HUES as Record<string, string>)[slot.element] ?? "#998f82"
    : "#5c564e";
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[11px] tracking-[0.2em]"
        style={{ color: warn ? "#E6A88E" : "#D0C5B6" }}
      >
        {label}
      </span>
      <div
        className="mt-2 flex h-14 w-14 items-center justify-center rounded-full text-[22px] font-black"
        style={{
          background: hasValue ? `${hue}1f` : "rgba(92,86,78,0.2)",
          color: hue,
          border: `1.5px solid ${hasValue ? hue : "rgba(245,237,224,0.12)"}`,
        }}
      >
        {hasValue ? slot.hanja : "—"}
      </div>
      <span
        className="mt-1 text-[10px]"
        style={{ color: hasValue ? "#D0C5B6" : "#998f82" }}
      >
        {hasValue ? `${slot.element}(${slot.hanja})` : "없음"}
      </span>
    </div>
  );
}

function gaugeColor(pos: number): string {
  // 1 극약(옅음) → 7 극왕(진적) 그라데이션
  const colors = [
    "#F5C9BF", // 1
    "#F0A894",
    "#E88870",
    "#D96850",
    "#C04836",
    "#8B2E24",
    "#5C1B16", // 7
  ];
  return colors[pos - 1] ?? "#998f82";
}
