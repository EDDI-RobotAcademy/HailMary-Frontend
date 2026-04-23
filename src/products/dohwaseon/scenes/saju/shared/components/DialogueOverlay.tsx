"use client";

import Image from "next/image";

type Props = {
  speaker: string;
  text: string;
  isComplete: boolean;
  position?: "bottom" | "center";
};

export default function DialogueOverlay({
  speaker,
  text,
  isComplete,
  position = "bottom",
}: Props) {
  const positionClass =
    position === "bottom" ? "mb-16 mt-auto" : "my-auto";

  return (
    <div className={`relative z-10 ${positionClass} px-5`}>
      <span
        className="ml-1 inline-block rounded-md px-3 py-1 text-[11px] font-semibold tracking-[0.15em]"
        style={{
          background: "rgba(40,38,34,0.75)",
          backdropFilter: "blur(10px)",
          color: "#E6C58E",
          borderTop: "1px solid rgba(245,237,224,0.12)",
        }}
      >
        {speaker}
      </span>
      <div className="relative mt-2 h-[126px] overflow-hidden border border-white/30 bg-gray-800/80 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-2">
          <Image
            src="/dialogue-deco.png"
            alt=""
            fill
            className="object-fill opacity-40"
          />
        </div>
        <p className="relative flex h-full items-center px-7 py-4 text-[14px] leading-relaxed text-white">
          &ldquo;{text}&rdquo;
          {isComplete && (
            <span className="ml-1 inline-block shrink-0 animate-pulse align-middle text-xs">
              ▼
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
