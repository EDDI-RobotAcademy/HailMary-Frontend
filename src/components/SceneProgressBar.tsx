"use client";

import type { MouseEvent } from "react";

interface SceneProgressBarProps {
  stepIndex: number;
  totalSteps: number;
  onPrev?: (e: MouseEvent) => void;
  onNext?: (e: MouseEvent) => void;
}

const IS_DEV = process.env.NODE_ENV !== "production";

export function SceneProgressBar({ stepIndex, totalSteps, onPrev, onNext }: SceneProgressBarProps) {
  const fillPct = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="absolute left-0 right-0 top-0 z-50 px-4 pt-3">
      {/* 게이지 바 */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-green-400"
          style={{ width: `${fillPct}%`, transition: "width 0.3s ease" }}
        />
      </div>

      {/* dev 전용 점프 버튼 */}
      {IS_DEV && onPrev && onNext && (
        <div className="flex items-center gap-1.5 px-3 pt-2">
          <button
            onClick={onPrev}
            disabled={stepIndex === 0}
            className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur-md transition-opacity active:opacity-80 disabled:opacity-25"
          >
            이전
          </button>
          <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] tabular-nums text-white backdrop-blur-md">
            {stepIndex + 1} / {totalSteps}
          </span>
          <button
            onClick={onNext}
            disabled={stepIndex === totalSteps - 1}
            className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur-md transition-opacity active:opacity-80 disabled:opacity-25"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
