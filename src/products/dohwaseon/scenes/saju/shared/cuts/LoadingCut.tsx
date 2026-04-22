"use client";

// analysis-loading 컷의 로딩/에러 UI.
// - 에러 상태에선 서버 메시지 + "다시 시도" 버튼
// - 그 외에는 "데이터 분석 중" / 3초 경과 시 "별의 배치를 읽는 중…" + 점 3개 애니메이션

import type { SajuError } from "@/features/saju";

type LoadingCutProps = {
  status: "idle" | "loading" | "success" | "error";
  error: SajuError | undefined;
  showSlowMessage: boolean;
  onRetry: () => void;
};

export default function LoadingCut({
  status,
  error,
  showSlowMessage,
  onRetry,
}: LoadingCutProps) {
  return (
    <div className="relative z-10 my-auto px-6 text-center">
      {status === "error" && error ? (
        <>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: "#F5EDE0" }}
          >
            {error.message}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="mt-5 rounded-full px-5 py-2 text-[11px] tracking-[0.3em]"
            style={{
              background: "rgba(230,197,142,0.18)",
              color: "#FFE2B3",
              borderTop: "1px solid rgba(245,237,224,0.12)",
            }}
          >
            다시 시도
          </button>
        </>
      ) : (
        <>
          <p
            className="text-[11px] tracking-[0.4em]"
            style={{ color: "rgba(230,197,142,0.85)" }}
          >
            {showSlowMessage ? "별의 배치를 읽는 중…" : "데이터 분석 중"}
          </p>
          <div className="mx-auto mt-3 flex justify-center gap-1.5">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="h-1 w-1 animate-pulse rounded-full"
                style={{ background: "#E6C58E", animationDelay: `${d}ms` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
