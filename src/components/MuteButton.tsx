"use client";

import type { MouseEvent } from "react";

interface MuteButtonProps {
  muted: boolean;
  onToggle: (e: MouseEvent) => void;
}

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/40 backdrop-blur-md transition-colors active:bg-white/60"
    >
      <span className="text-lg">{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
