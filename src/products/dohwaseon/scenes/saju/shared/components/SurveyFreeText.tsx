"use client";

import { useState } from "react";
import type { SurveyTextStep } from "../types";

type Props = {
  step: SurveyTextStep;
  onNext: (text: string) => void;
  buttonLabel?: string;
};

export default function SurveyFreeText({
  step,
  onNext,
  buttonLabel = "도윤에게 알려주기 →",
}: Props) {
  const [text, setText] = useState("");

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext(text.trim());
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext("");
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
        <div>
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
            className="mt-5 whitespace-pre-line text-[22px] font-bold leading-[1.4]"
            style={{ color: "#F5EDE0" }}
          >
            {step.title}
          </h2>
          <div className="mt-3 flex items-baseline justify-between">
            <p
              className="text-[11px] tracking-[0.2em]"
              style={{ color: "#998f82" }}
            >
              {step.subtitle}
            </p>
            <p
              className="text-[11px] tracking-widest tabular-nums"
              style={{
                color:
                  text.length >= step.maxLength
                    ? "#E6C58E"
                    : "rgba(208,197,182,0.6)",
              }}
            >
              {text.length} / {step.maxLength}
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div
          className="relative mt-6 flex-1 overflow-hidden rounded-2xl"
          style={{
            background: "rgba(40,38,34,0.55)",
            backdropFilter: "blur(14px)",
            borderTop: "1px solid rgba(245,237,224,0.08)",
          }}
        >
          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value.slice(0, step.maxLength))
            }
            placeholder={step.placeholder}
            className="h-full w-full resize-none bg-transparent p-5 text-[14px] leading-relaxed outline-none placeholder:text-[#998f82]"
            style={{ color: "#F5EDE0", minHeight: "180px" }}
          />
        </div>

        <button
          onClick={handleNext}
          className="mt-8 w-full rounded-2xl py-3.5 text-[13px] font-bold tracking-[0.3em] transition-all"
          style={{
            background: "linear-gradient(135deg, #FFE2B3, #E6C58E)",
            color: "#412d04",
            boxShadow: "0 0 28px rgba(230,197,142,0.2)",
          }}
        >
          {buttonLabel}
        </button>
        <button
          onClick={handleSkip}
          className="mt-2 w-full py-2 text-[12px] tracking-[0.25em]"
          style={{ color: "rgba(208,197,182,0.55)" }}
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
