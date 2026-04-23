"use client";

type Props = {
  speaker: string;
  text: string;
  isComplete: boolean;
};

export default function AsideComment({ speaker, text, isComplete }: Props) {
  return (
    <div className="relative z-10 mt-auto mb-20 px-6">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(208,197,182,0.55)" }}
        >
          멀리서
        </span>
        <span
          className="text-[11px] tracking-[0.15em]"
          style={{ color: "rgba(208,197,182,0.7)" }}
        >
          {speaker}
        </span>
      </div>
      <p
        className="text-[14px] italic leading-relaxed"
        style={{
          color: "rgba(208,197,182,0.85)",
          textShadow: "0 1px 8px rgba(0,0,0,0.85)",
        }}
      >
        &ldquo;{text}&rdquo;
        {isComplete && (
          <span
            className="ml-1.5 inline-block animate-pulse text-[10px]"
            style={{ color: "rgba(208,197,182,0.55)" }}
          >
            ▼
          </span>
        )}
      </p>
    </div>
  );
}
