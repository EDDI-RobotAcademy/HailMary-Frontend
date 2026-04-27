"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { YEONWOO_CUTS, type Cut } from "@/features/saju/domain/cuts-yeonwoo";
import { SURVEY_STEPS } from "@/features/saju/domain/surveyOptions";
import { useCutProgression } from "@/features/saju/hooks/useCutProgression";
import { useCharacterSajuFlow } from "@/features/saju/hooks/useCharacterSajuFlow";
import { trackEvent } from "@/shared/utils/analytics";
import { DialogueBox } from "@/components/DialogueBox";
import AsideComment from "@/features/saju/views/shared/AsideComment";
import InfoForm from "@/features/saju/views/shared/InfoForm";
import SurveyCut from "@/features/saju/views/shared/SurveyCut";
import CtaOverlay from "@/features/saju/views/shared/CtaOverlay";
import { FadeOverlay } from "@/components/FadeOverlay";
import { SceneProgressBar } from "@/components/SceneProgressBar";

const CROSSFADE_ENTER = new Set<number>([5]);
const SURFACE = "#141311";

function getBg(c: Cut): string | null {
  return "bg" in c ? c.bg : null;
}

export default function YeonwooSajuScene() {
  const router = useRouter();
  const { surveyAnswers, setSurveyAnswers, submitInfo, finalizeSurvey } =
    useCharacterSajuFlow({ storageKeyPrefix: "yeonwoo" });

  const {
    cut, cutIndex, lineIndex, displayedCount, fullText,
    isComplete, fading, crossFading, leanInZoomed, ctaVisible,
    handleTap, goToCut, jumpTo,
  } = useCutProgression<Cut>(YEONWOO_CUTS, { crossfadeOnEnter: CROSSFADE_ENTER });

  useEffect(() => {
    trackEvent("story_scene_start", { character_id: "yeonwoo" });
  }, []);

  useEffect(() => {
    trackEvent("story_cut_view", {
      character_id: "yeonwoo",
      cut_index: cutIndex,
      cut_type: cut.type,
      scene_label: `${cutIndex + 1}/${YEONWOO_CUTS.length}`,
    });
  }, [cutIndex]);

  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/saju/loading?character=yeonwoo");
  };

  const isAside = cut.type === "aside";
  const isLeanIn = cut.type === "final-leanin";
  const bgImage = getBg(cut);
  const nextCut = YEONWOO_CUTS[cutIndex + 1];
  const nextBg = nextCut ? getBg(nextCut) : null;
  const leanInBg = isLeanIn && leanInZoomed
    ? (cut as Extract<Cut, { type: "final-leanin" }>).bgZoomed
    : bgImage;

  return (
    <div
      className="relative flex flex-col h-dvh w-full overflow-hidden select-none"
      style={{ background: SURFACE }}
      onClick={handleTap}
    >
      {/* 배경 이미지 */}
      {bgImage && (
        <Image
          src={isLeanIn && leanInBg ? leanInBg : bgImage}
          alt=""
          fill
          priority
          className="object-cover object-center"
          style={{
            opacity: fading ? 0 : 1,
            transition: "opacity 0.4s ease, transform 1.6s cubic-bezier(0.22,1,0.36,1)",
            transform: isLeanIn && leanInZoomed ? "scale(1.06)" : "scale(1)",
            filter: isAside ? "saturate(0.35) brightness(0.65)" : "none",
          }}
        />
      )}

      {/* 크로스페이드 다음 배경 */}
      {crossFading && nextBg && (
        <Image
          src={nextBg}
          alt=""
          fill
          priority
          className="absolute inset-0 object-cover object-center animate-[fadeIn_0.4s_ease-out]"
        />
      )}

      {/* aside 어두운 오버레이 */}
      {isAside && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "rgba(20,19,17,0.55)" }}
        />
      )}

      {/* 대사 */}
      {!fading && !crossFading &&
        (cut.type === "dialogue" || cut.type === "dialogue-closeup" || isLeanIn) && (
          <div className={`relative z-10 mt-auto px-5 ${isLeanIn ? "mb-24" : cut.type === "dialogue-closeup" ? "mb-20" : "mb-16"}`}>
            <DialogueBox
              speaker={cut.speaker}
              text={fullText.slice(0, displayedCount)}
              isComplete={isComplete && !(isLeanIn && lineIndex === (cut as Extract<Cut, { type: "final-leanin" }>).lines.length - 1)}
            />
          </div>
        )}

      {/* 도윤 방백 */}
      {!fading && !crossFading && isAside && (
        <AsideComment
          speaker={cut.speaker}
          text={fullText.slice(0, displayedCount)}
          isComplete={isComplete}
        />
      )}

      {/* 태블릿 핸드오프 */}
      {!fading && cut.type === "tablet-handoff" && (
        <div className="relative z-10 mt-auto mb-24 px-6 text-center">
          <p
            className="animate-pulse text-[11px] tracking-[0.4em]"
            style={{ color: "rgba(208,197,182,0.7)" }}
          >
            태블릿을 받아드는 중…
          </p>
        </div>
      )}

      {/* scene-pause — 자동 진행 (useCutProgression에서 처리), 배경만 표시 */}
      {cut.type === "scene-pause" && null}

      {/* 정보 입력 폼 */}
      {!fading && cut.type === "info-form" && (
        <InfoForm
          onSubmit={(info) => { submitInfo(info); goToCut(cutIndex + 1); }}
          buttonLabel="연우에게 알려주기 →"
          characterId="yeonwoo"
        />
      )}

      {/* 설문 1/3 */}
      {!fading && cut.type === "survey" && cut.step === 1 && (
        <SurveyCut
          step={1}
          config={SURVEY_STEPS[1]}
          characterId="yeonwoo"
          onAnswer={(answers) => {
            setSurveyAnswers((prev) => ({ ...prev, step1: answers }));
            goToCut(cutIndex + 1);
          }}
        />
      )}

      {/* 설문 2/3 */}
      {!fading && cut.type === "survey" && cut.step === 2 && (
        <SurveyCut
          step={2}
          config={SURVEY_STEPS[2]}
          characterId="yeonwoo"
          onAnswer={(answers) => {
            setSurveyAnswers((prev) => ({ ...prev, step2: answers }));
            goToCut(cutIndex + 1);
          }}
        />
      )}

      {/* 설문 3/3 */}
      {!fading && cut.type === "survey" && cut.step === 3 && (
        <SurveyCut
          step={3}
          config={SURVEY_STEPS[3]}
          buttonLabel="연우에게 알려주기 →"
          characterId="yeonwoo"
          onAnswer={(text) => {
            finalizeSurvey({ ...surveyAnswers, step3: text });
            goToCut(cutIndex + 1);
          }}
        />
      )}

      {/* CTA */}
      {isLeanIn && ctaVisible && !fading && <CtaOverlay onClick={handleCta} />}

      {/* 상담사 변경 */}
      <button
        className="absolute right-4 top-6 z-[60] rounded-full px-3 py-1.5 text-[11px] tracking-[0.15em]"
        style={{
          background: "rgba(20,19,17,0.7)",
          backdropFilter: "blur(8px)",
          color: "white",
          border: "1px solid rgba(245,237,224,0.12)",
        }}
        onClick={(e) => { e.stopPropagation(); router.push("/select"); }}
      >
        상담사 변경
      </button>

      <FadeOverlay visible={fading || crossFading} color="black" durationMs={380} />

      <SceneProgressBar
        stepIndex={cutIndex}
        totalSteps={YEONWOO_CUTS.length}
        onPrev={(e: React.MouseEvent) => { e.stopPropagation(); jumpTo(-1); }}
        onNext={(e: React.MouseEvent) => { e.stopPropagation(); jumpTo(1); }}
      />
    </div>
  );
}
