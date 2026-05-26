"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { trackEvent } from "@/shared/utils/analytics";
import type { ContentCard } from "../domain/contentCards";

export function useMain() {
  const router = useRouter();

  useEffect(() => {
    const SENT_KEY = "hm_domain_page_sent";
    if (sessionStorage.getItem(SENT_KEY)) return;
    sessionStorage.setItem(SENT_KEY, "1");
    trackEvent("domain_page");
  }, []);

  const handleCardClick = useCallback(
    (card: ContentCard) => {
      if (card.variant === "coming-soon" || !card.route) return;
      router.push(card.route);
    },
    [router],
  );

  return { handleCardClick };
}
