"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/shared/utils/analytics";
import { useDoyoonSajuData } from "../../hooks/useDoyoonSajuData";
import { useFirstName } from "../../hooks/useFirstName";
import {
  CHARM_TYPE_COPIES,
  CHARM_MANIFESTATION_COPIES,
  DOHWA_COPIES,
  pickDohwaCopyKey,
} from "../../domain/charmDialogues-doyoon";
import {
  ELEMENT_BLOCKING_COPIES,
  TEN_GOD_BLOCKING_COPIES,
  FALLBACK_COPIES,
} from "../../domain/blockingDialogues-doyoon";
import type { CharmCopyPool } from "../../domain/types";

import HeroSection from "./sections/HeroSection";
import TitleBannerSection from "./sections/TitleBannerSection";
import CharacterIntroSection from "./sections/CharacterIntroSection";
import TabletSection from "./sections/TabletSection";
import PortraitSection from "./sections/PortraitSection";
import PortraitArmsCrossedSection from "./sections/PortraitArmsCrossedSection";
import IncompatibleBannerSection from "./sections/IncompatibleBannerSection";
import BlockSection from "./sections/BlockSection";
import Section09Block from "./sections/Section09Block";
import BeigeBlockSection from "./sections/BeigeBlockSection";
import PortraitTabletSection from "./sections/PortraitTabletSection";
import PortraitNotebookSection from "./sections/PortraitNotebookSection";
import RomanceChaptersSection from "./sections/RomanceChaptersSection";
import AvoidPartnerInfoSection from "./sections/AvoidPartnerInfoSection";

import SajuChartSection from "../shared/SajuChartSection";
import WuxingChartSection from "../shared/WuxingChartSection";
import CharmCards from "../shared/CharmCards";
import BlockingSection from "../shared/BlockingSection";
import AvoidPartnerSection from "../shared/AvoidPartnerSection";
import DestinedPartnerSection from "../shared/DestinedPartnerSection";
import RomanceTimingSection from "../shared/RomanceTimingSection";
import RealReviewsSection from "../shared/RealReviewsSection";
import FullResultIndexSection from "../shared/FullResultIndexSection";
import StickyCheckoutCta from "../shared/StickyCheckoutCta";

import { DOYOON_REVIEWS } from "./reviews-doyoon";

const SURFACE = "#FDF5EA";
const SCROLL_DEPTH_MILESTONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export default function DoyoonResultScene() {
  const data = useDoyoonSajuData();
  const firstName = useFirstName("doyoon");
  const displayName = firstName ?? "당신";

  const containerRef = useRef<HTMLDivElement>(null);
  const [showCta, setShowCta] = useState(false);
  const reachedDepthsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    trackEvent("result_page_view", { character_id: "doyoon" });
  }, []);

  const charmCopies: CharmCopyPool = useMemo(
    () => ({
      charmType: CHARM_TYPE_COPIES,
      manifestation: CHARM_MANIFESTATION_COPIES,
      dohwa: DOHWA_COPIES,
      pickDohwaCopyKey,
    }),
    [],
  );

  const blockingDialogues = useMemo(
    () => ({
      elementCopies: ELEMENT_BLOCKING_COPIES,
      tenGodCopies: TEN_GOD_BLOCKING_COPIES,
      fallbackCopies: [...FALLBACK_COPIES],
    }),
    [],
  );

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
      const progress = measureProgress();
      setShowCta(progress >= 0.4);

      const percent = progress * 100;
      for (const milestone of SCROLL_DEPTH_MILESTONES) {
        if (percent >= milestone && !reachedDepthsRef.current.has(milestone)) {
          reachedDepthsRef.current.add(milestone);
          trackEvent("result_scroll_depth", {
            character_id: "doyoon",
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
        className="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{
          background: SURFACE,
          scrollbarWidth: "none",
          paddingBottom: "120px",
        }}
      >
        <HeroSection />
        <TitleBannerSection />
        <CharacterIntroSection displayName={displayName} />
        <div
          aria-hidden="true"
          style={{
            height: "50px",
            background: "linear-gradient(to bottom, #F9E3C8 0%, #FDF5EA 100%)",
          }}
        />
        <TabletSection displayName={displayName} />
        <SajuChartSection pillars={data.pillars} displayName={displayName} />
        <PortraitSection displayName={displayName} />
        <WuxingChartSection
          pillars={data.pillars}
          dayMaster={data.dayMaster}
          wuxing={data.wuxing}
        />
        <CharmCards
          charm={data.charm}
          sajuRequestId={data.sajuRequestId}
          copies={charmCopies}
          theme="beige"
        />
        <BlockSection />
        <PortraitArmsCrossedSection />
        <BlockingSection
          blocking={data.blocking}
          sajuRequestId={data.sajuRequestId}
          dialogues={blockingDialogues}
        />
        <IncompatibleBannerSection />
        <AvoidPartnerSection slotId={data.spouseAvoid?.slotId ?? null} />
        <AvoidPartnerInfoSection slotId={data.spouseAvoid?.slotId ?? null} />
        <Section09Block />
        <BeigeBlockSection />
        <PortraitTabletSection />
        <RomanceChaptersSection
          pillars={data.pillars}
          displayName={displayName}
        />
        <PortraitNotebookSection />
        <FullResultIndexSection displayName={displayName} />
        <DestinedPartnerSection
          spouseMatch={data.spouseMatch}
          displayName={displayName}
        />
        <RomanceTimingSection
          monthlyRomanceFlow={data.monthlyRomanceFlow}
        />
        <RealReviewsSection
          reviews={DOYOON_REVIEWS}
          versionBadgeLabel="한도윤 버전"
        />
      </div>
      <StickyCheckoutCta
        ctaLabel="결제하고 한도윤의 정밀 리포트 읽기"
        characterId="doyoon"
        visible={showCta}
      />
    </>
  );
}
