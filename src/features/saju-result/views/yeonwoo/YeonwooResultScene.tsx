"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/shared/utils/analytics";
import { useYeonwooSajuData } from "../../hooks/useYeonwooSajuData";
import { HeroSection } from "./sections/HeroSection";
import { SceneOpeningSection } from "./sections/SceneOpeningSection";
import { DialogueBubbleSection } from "./sections/DialogueBubbleSection";
import { HandsOnBookSection } from "./sections/HandsOnBookSection";
import { BlackSpacer } from "./sections/BlackSpacer";
import { SajuChartSection } from "./sections/SajuChartSection";
import { YeonwooPortraitSection } from "./sections/YeonwooPortraitSection";
import { WuxingChartSection } from "./sections/WuxingChartSection";
import { KijilSection } from "./sections/KijilSection";
import { CharmCardsSection } from "./sections/CharmCardsSection";
import { ClosingPromptSection } from "./sections/ClosingPromptSection";
import { ClosingPortraitSection } from "./sections/ClosingPortraitSection";
import { BlockingSection } from "./sections/BlockingSection";
import { AvoidPartnerSection } from "./sections/AvoidPartnerSection";
import { BubblesDaBoYeoSection } from "./sections/BubblesDaBoYeoSection";
import { YeonwooBookSection } from "./sections/YeonwooBookSection";
import { ClosingDialogueSection } from "./sections/ClosingDialogueSection";
import { RomanceChaptersSection } from "./sections/RomanceChaptersSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { FullResultIndexSection } from "./sections/FullResultIndexSection";
import { DestinedPartnerSection } from "./sections/DestinedPartnerSection";
import { RomanceTimingSection } from "./sections/RomanceTimingSection";
import { RealReviewsSection } from "./sections/RealReviewsSection";
import { StickyCheckoutCta } from "./sections/StickyCheckoutCta";

const SURFACE = "#141311";
const SCROLL_DEPTH_MILESTONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export default function YeonwooResultScene() {
  const data = useYeonwooSajuData();

  const containerRef = useRef<HTMLDivElement>(null);
  const reachedDepthsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    trackEvent("result_page_view", { character_id: "yeonwoo" });
  }, []);

  useEffect(() => {
    const el = containerRef.current;

    const measureProgress = (): number => {
      if (el && el.scrollHeight > el.clientHeight) {
        const max = el.scrollHeight - el.clientHeight;
        return max > 0 ? el.scrollTop / max : 0;
      }
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const max =
        (document.documentElement.scrollHeight ||
          document.body.scrollHeight) - window.innerHeight;
      return max > 0 ? scrollTop / max : 0;
    };

    const handleScroll = () => {
      const percent = measureProgress() * 100;
      for (const milestone of SCROLL_DEPTH_MILESTONES) {
        if (percent >= milestone && !reachedDepthsRef.current.has(milestone)) {
          reachedDepthsRef.current.add(milestone);
          trackEvent("result_scroll_depth", {
            character_id: "yeonwoo",
            depth_percent: milestone,
          });
        }
      }
    };

    el?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      el?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-y-auto"
        style={{ background: SURFACE, paddingBottom: "120px" }}
      >
        <HeroSection />
        <SceneOpeningSection />
        <DialogueBubbleSection />
        <HandsOnBookSection />
        <BlackSpacer />
        <SajuChartSection pillars={data.pillars} />
        <BlackSpacer height={100} color="#050404" />
        <YeonwooPortraitSection pillars={data.pillars} />
        <WuxingChartSection
          wuxing={data.wuxing}
          dayMaster={data.dayMaster}
          pillars={data.pillars}
        />
        <KijilSection />
        <CharmCardsSection charm={data.charm} sajuRequestId={data.sajuRequestId} />
        <ClosingPromptSection />
        <BlackSpacer color="#080806" />
        <ClosingPortraitSection />
        <BlockingSection blocking={data.blocking} sajuRequestId={data.sajuRequestId} />
        <AvoidPartnerSection spouseAvoid={data.spouseAvoid} />
        <BubblesDaBoYeoSection pillars={data.pillars} />
        <YeonwooBookSection />
        <ClosingDialogueSection />
        <RomanceChaptersSection pillars={data.pillars} />
        <FinalCtaSection />
        <FullResultIndexSection />
        <DestinedPartnerSection spouseMatch={data.spouseMatch} />
        <RomanceTimingSection flow={data.monthlyRomanceFlow} />
        <RealReviewsSection />
      </div>
      <StickyCheckoutCta />
    </>
  );
}
