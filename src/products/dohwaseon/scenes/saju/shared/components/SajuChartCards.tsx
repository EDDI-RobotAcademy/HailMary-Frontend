"use client";

import type { Pillar, SajuFreeResponse } from "@/features/saju";
import DaeUnTable from "./result/DaeUnTable";
import SajuDetailTable from "./result/SajuDetailTable";
import WuxingBarChart from "./result/WuxingBarChart";
import WuxingPentagon from "./result/WuxingPentagon";
import YongSinPanel from "./result/YongSinPanel";

export type SajuResultData = Omit<SajuFreeResponse, "sajuRequestId">;

type Props = {
  intro: string;
  data: SajuResultData;
  name?: string;
  onNext: () => void;
};

export default function SajuChartCards({ intro, data, name, onNext }: Props) {
  const { pillars, highlight, wuxing, yongSin, dayMaster, daeUn } = data;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,19,17,0.94) 0%, rgba(20,19,17,0.82) 50%, rgba(20,19,17,0.94) 100%)",
        }}
      />

      <div className="relative flex-1 space-y-5 overflow-y-auto px-6 pb-8 pt-14">
        <div className="text-center">
          <p
            className="text-[10px] tracking-[0.4em]"
            style={{ color: "#E6C58E" }}
          >
            ANALYSIS COMPLETE
          </p>
          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: "#F5EDE0" }}
          >
            &ldquo;{intro}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {pillars.map((p) => (
            <PillarSummaryCard key={p.label} pillar={p} />
          ))}
        </div>

        <HighlightCard highlight={highlight} />

        <SajuDetailTable pillars={pillars} />
        <DaeUnTable daeUn={daeUn} name={name} />
        <WuxingPentagon wuxing={wuxing} />
        <WuxingBarChart wuxing={wuxing} />
        <YongSinPanel
          wuxing={wuxing}
          yongSin={yongSin}
          dayMaster={dayMaster}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="mt-2 w-full rounded-2xl py-3.5 text-[13px] font-bold tracking-[0.3em] transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #FFE2B3, #E6C58E)",
            color: "#412d04",
            boxShadow: "0 0 28px rgba(230,197,142,0.2)",
          }}
        >
          다음 단계로 →
        </button>
      </div>
    </div>
  );
}

function PillarSummaryCard({ pillar: p }: { pillar: Pillar }) {
  const unknown = p.unknown;
  const heaven = unknown ? "?" : p.heaven;
  const earth = unknown ? "?" : p.earth;
  const element = unknown ? "—" : p.element;
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-4 py-5"
      style={{
        background: "rgba(40,38,34,0.6)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(245,237,224,0.1)",
        opacity: unknown ? 0.72 : 1,
      }}
    >
      <p
        className="text-[10px] tracking-[0.3em]"
        style={{ color: p.hue, opacity: 0.85 }}
      >
        {p.label}
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className="text-4xl font-black leading-none"
          style={{
            color: p.hue,
            textShadow: unknown ? "none" : `0 0 18px ${p.hue}55`,
          }}
        >
          {heaven}
        </span>
        <span
          className="text-2xl font-bold leading-none"
          style={{ color: "#D0C5B6" }}
        >
          {earth}
        </span>
      </div>
      <p
        className="mt-3 text-[10px] tracking-[0.2em]"
        style={{ color: "#998f82" }}
      >
        {element}
      </p>
      {unknown && (
        <p
          className="mt-1 text-[9px] tracking-[0.2em]"
          style={{ color: "#998f82" }}
        >
          시간 미입력
        </p>
      )}
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-4"
      style={{
        background: "rgba(40,38,34,0.55)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(245,237,224,0.12)",
      }}
    >
      <p
        className="text-[10px] tracking-[0.3em]"
        style={{ color: "#E6C58E" }}
      >
        핵심 변수
      </p>
      <p
        className="mt-2 text-[13px] font-bold leading-relaxed"
        style={{ color: "#FFE2B3" }}
      >
        {highlight}
      </p>
    </div>
  );
}
