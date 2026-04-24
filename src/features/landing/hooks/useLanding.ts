"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import type { LandingState } from "../domain/state";

export function useLanding(): LandingState & { handleStart: () => void } {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    trackEvent("landing_enter");
  }, []);

  const handleStart = () => {
    trackEvent("intro_step_complete", { step: 1 });
    setFading(true);
    setTimeout(() => router.push("/intro"), 900);
  };

  return { fading, handleStart };
}
