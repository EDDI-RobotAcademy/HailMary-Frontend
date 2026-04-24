"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import { CHARACTER_INFO } from "../domain/characters";
import type { Side, Phase, CharKey } from "../domain/characters";

export function useCharacterSelect() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Side>(null);
  const [selected, setSelected] = useState<Side>(null);
  const [phase, setPhase] = useState<Phase>("selecting");
  const [fading, setFading] = useState(false);

  const selectedKey: CharKey | null =
    selected === "left" ? "yeonwoo" : selected === "right" ? "doyoon" : null;
  const selectedInfo = selectedKey ? CHARACTER_INFO[selectedKey] : null;

  const getLeftClip = () => {
    if (selected === "left") return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
    if (selected === "right") return "polygon(0 0, 0 0, 0 100%, 0 100%)";
    if (hovered === "left") return "polygon(0 0, 100% 0, 35% 100%, 0 100%)";
    return "polygon(0 0, 0 0, 0 100%, 0 100%)";
  };

  const getRightClip = () => {
    if (selected === "right") return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
    if (selected === "left") return "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
    if (hovered === "right") return "polygon(65% 0, 100% 0, 100% 100%, 0 100%)";
    return "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
  };

  const handleSelect = useCallback(
    (side: Side) => {
      if (selected || !side) return;
      setSelected(side);
      setTimeout(() => setPhase("confirming"), 900);
    },
    [selected],
  );

  const handleHover = useCallback(
    (side: Side) => {
      if (selected) return;
      setHovered(side);
    },
    [selected],
  );

  const handleLeave = useCallback(() => {
    if (selected) return;
    setHovered(null);
  }, [selected]);

  const handleConfirm = useCallback(() => {
    if (!selectedKey) return;
    trackEvent("character_select", { character_id: selectedKey });
    localStorage.setItem("selectedCharacter", selectedKey);
    setFading(true);
    setTimeout(() => { router.push(`/saju/${selectedKey}`); }, 600);
  }, [selectedKey, router]);

  const handleCancel = useCallback(() => {
    setPhase("selecting");
    setSelected(null);
    setHovered(null);
  }, []);

  const handleTouchStart = useCallback(
    (side: "left" | "right") => {
      if (selected) return;
      setHovered(side);
    },
    [selected],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const isLeft = i < 12;
        return {
          id: i,
          left: isLeft ? Math.random() * 45 : 55 + Math.random() * 45,
          size: Math.random() * 3 + 1,
          color: isLeft
            ? `rgba(255, ${150 + Math.random() * 80}, ${50 + Math.random() * 60}, 0.7)`
            : `rgba(255, ${200 + Math.random() * 40}, ${130 + Math.random() * 60}, 0.7)`,
          duration: 5 + Math.random() * 7,
          delay: Math.random() * 10,
        };
      }),
    [],
  );

  return {
    hovered,
    selected,
    phase,
    fading,
    selectedKey,
    selectedInfo,
    particles,
    getLeftClip,
    getRightClip,
    handleSelect,
    handleHover,
    handleLeave,
    handleConfirm,
    handleCancel,
    handleTouchStart,
  };
}
