"use client";

import { useState } from "react";
import type { SurveyMultiStep } from "../types";

type Props = {
  step: SurveyMultiStep;
  onNext: (selected: string[]) => void;
};

export default function SurveyMultiSelect({ step, onNext }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isValid = selected.length > 0;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValid) return;
    onNext(selected);
  };

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,19,17,0.94) 0%, rgba(20,19,17,0.85) 50%, rgba(20,19,17,0.95) 100%)",
        }}
      />

      <div className="relative flex flex-1 flex-col px-6 pb-8 pt-14">
        {/* Header */}
        <div className="text-center">
          <p
            className="text-[10px] tracking-[0.4em]"
            style={{ color: "#E6C58E" }}
          >
            CELESTIAL ARCHIVE
          </p>
          <p
            className="mt-2 text-[10px] tracking-[0.3em]"
            style={{ color: "#998f82" }}
          >
            {step.pageLabel}
          </p>
          <h2
            className="mt-5 whitespace-pre-line text-[20px] font-bold leading-[1.45]"
            style={{ color: "#F5EDE0" }}
          >
            {step.title}
          </h2>
          <p
            className="mt-3 text-[11px] tracking-[0.2em]"
            style={{ color: "#998f82" }}
          >
            {step.subtitle}
          </p>
        </div>

        {/* Options */}
        <div className="mt-9 flex flex-col gap-3">
          {step.options.map((opt) => {
            const sel = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(opt.id);
                }}
                className="flex items-center justify-between rounded-full px-6 py-4 text-left transition-all active:scale-[0.99]"
                style={{
                  background: sel
                    ? "rgba(230,197,142,0.15)"
                    : "rgba(40,38,34,0.6)",
                  backdropFilter: "blur(14px)",
                  borderTop: sel
                    ? "1px solid rgba(230,197,142,0.4)"
                    : "1px solid rgba(245,237,224,0.08)",
                }}
              >
                <span
                  className="text-[14px] tracking-[0.05em]"
                  style={{
                    color: sel ? "#FFE2B3" : "#D0C5B6",
                    fontWeight: sel ? 600 : 400,
                  }}
                >
                  {opt.label}
                </span>
                <span
                  className="ml-3 text-[14px]"
                  style={{
                    color: sel ? "#E6C58E" : "rgba(208,197,182,0.4)",
                  }}
                >
                  {opt.icon}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <button
          onClick={handleNext}
          disabled={!isValid}
          className="mt-8 w-full rounded-2xl py-3.5 text-[13px] font-bold tracking-[0.3em] transition-all"
          style={{
            background: isValid
              ? "linear-gradient(135deg, #FFE2B3, #E6C58E)"
              : "rgba(230,197,142,0.18)",
            color: isValid ? "#412d04" : "rgba(208,197,182,0.5)",
            boxShadow: isValid ? "0 0 28px rgba(230,197,142,0.2)" : "none",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
