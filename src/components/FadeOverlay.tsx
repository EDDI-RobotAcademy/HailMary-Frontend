"use client";

interface FadeOverlayProps {
  visible: boolean;
  color: "black" | "white";
  durationMs?: number;
  easing?: string;
}

export function FadeOverlay({ visible, color, durationMs = 300, easing = "ease" }: FadeOverlayProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-40 ${color === "black" ? "bg-black" : "bg-white"}`}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${durationMs}ms ${easing}`,
      }}
    />
  );
}
