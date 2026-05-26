"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import type { LandingState } from "../domain/state";

export function useLanding(): LandingState & { handleStart: () => void } {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const SENT_KEY = "hm_landing_dohwaseon_sent";
    if (sessionStorage.getItem(SENT_KEY)) return;
    sessionStorage.setItem(SENT_KEY, "1");
    trackEvent("landing_dohwaseon");
  }, []);

  const handleStart = () => {
    trackEvent("landing_enter");
    trackEvent("intro_start_clicked", { step: 1 });
    setFading(true);
    setTimeout(() => router.push("/intro"), 900);
  };

  return { fading, handleStart };
}
