"use client";

type Props = {
  onClick: (e: React.MouseEvent) => void;
  label?: string;
};

export default function CtaOverlay({ onClick, label = "사주결과 보기 →" }: Props) {
  return (
    <div className="absolute bottom-8 left-0 right-0 z-20 px-6 animate-[fadeIn_0.6s_ease-out]">
      <button
        onClick={onClick}
        className="w-full rounded-2xl py-4 text-sm font-bold tracking-[0.3em] transition-transform active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #FFE2B3, #E6C58E)",
          color: "#412d04",
          boxShadow: "0 0 32px rgba(230,197,142,0.25)",
        }}
      >
        {label}
      </button>
    </div>
  );
}
