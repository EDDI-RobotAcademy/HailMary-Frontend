"use client";

import type { DaeUn } from "@/features/saju";

type Props = {
  daeUn: DaeUn;
  name?: string;
};

export default function DaeUnTable({ daeUn, name }: Props) {
  const ownerLabel = name ? `${name}님` : "당신";
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
        {ownerLabel}의 대운표
      </p>
      <p
        className="mt-1 text-center text-[11px] leading-relaxed"
        style={{ color: "#998f82" }}
      >
        대운주기는 {daeUn.startAge}세부터 시작해 10년 주기로 찾아와요.
      </p>

      <div className="mt-4 overflow-x-auto">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${daeUn.periods.length}, minmax(44px, 1fr))`,
          }}
        >
          {daeUn.periods.map((p) => (
            <div
              key={p.age}
              className="py-2 text-center text-[11px] tabular-nums"
              style={{
                color: "#F5EDE0",
                borderTop: "1px solid rgba(245,237,224,0.08)",
                borderBottom: "1px solid rgba(245,237,224,0.08)",
              }}
            >
              {p.startYear}
            </div>
          ))}
          {daeUn.periods.map((p) => (
            <div
              key={`age-${p.age}`}
              className="py-2 text-center text-[11px] tabular-nums"
              style={{ color: "#D0C5B6" }}
            >
              {p.age}세
            </div>
          ))}
          {daeUn.periods.map((p) => (
            <div
              key={`stem-${p.age}`}
              className="flex flex-col items-center justify-center gap-0.5 py-2"
              style={{ borderTop: "1px solid rgba(245,237,224,0.06)" }}
            >
              <span
                className="text-[15px] font-black"
                style={{
                  color: p.hue,
                  textShadow: `0 0 10px ${p.hue}55`,
                }}
              >
                {p.stemHanja}
              </span>
              <span
                className="text-[13px] font-bold"
                style={{ color: "#D0C5B6" }}
              >
                {p.branchHanja}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
