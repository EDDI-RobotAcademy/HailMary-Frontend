"use client";

import { useEffect } from "react";
import { initAmplitude } from "@/shared/utils/analytics";

export default function AmplitudeProvider() {
  useEffect(() => {
    initAmplitude();
  }, []);

  return null;
}
