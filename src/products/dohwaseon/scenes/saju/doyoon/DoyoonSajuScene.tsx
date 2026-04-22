"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DOYOON_CUTS, type Cut } from "./data/cuts";
import DialogueOverlay from "../shared/components/DialogueOverlay";
import AsideComment from "../shared/components/AsideComment";
import InfoForm, { type SajuInfo } from "../shared/components/InfoForm";
import SajuChartCards from "../shared/components/SajuChartCards";
import SurveyMultiSelect from "../shared/components/SurveyMultiSelect";
import SurveyFreeText from "../shared/components/SurveyFreeText";
import { SURVEY_STEPS, type SurveyAnswers } from "./data/surveyOptions";
import { MOCK_SAJU } from "./data/mockSaju";
import { postSajuSurvey, useSajuCalculate } from "@/features/saju";
import { useCutProgression } from "../shared/hooks/useCutProgression";

const IS_DEV = process.env.NODE_ENV !== "production";
const SURFACE = "#141311";

// 이 인덱스의 컷으로 진입할 때 크로스페이드 (같은 도윤 표정/구도 변화)
const CROSSFADE_ENTER = new Set<number>([
  4, // cut 5: dialogue-closeup (도윤 클로즈업)
  9, // cut 10: analysis-result
]);

function getBg(c: Cut): string | null {
  return "bg" in c ? c.bg : null;
}

export default function DoyoonSajuScene() {
  const router = useRouter();
  const {
    cut,
    cutIndex,
    lineIndex,
    displayedCount,
    fullText,
    isComplete,
    fading,
    crossFading,
    leanInZoomed,
    ctaVisible,
    handleTap,
    goToCut,
    jumpTo,
  } = useCutProgression<Cut>(DOYOON_CUTS, {
    crossfadeOnEnter: CROSSFADE_ENTER,
  });

  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers>({
    step1: [],
    step2: [],
    step3: "",
  });
  const [loadingStartedAt, setLoadingStartedAt] = useState<number | null>(null);
  const [showSlowMsg, setShowSlowMsg] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const saju = useSajuCalculate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("doyoonSaju");
      if (!raw) return;
      const info = JSON.parse(raw) as { name?: string };
      if (info?.name) setUserName(info.name);
    } catch {}
  }, []);

  // analysis-loading: API 응답 + 최소 1.2초 노출 양쪽 충족 시 다음 컷으로
  useEffect(() => {
    if (cut.type !== "analysis-loading") return;
    if (saju.status !== "success" || loadingStartedAt === null) return;
    const elapsed = Date.now() - loadingStartedAt;
    const wait = Math.max(0, 1200 - elapsed);
    const t = setTimeout(() => goToCut(cutIndex + 1), wait);
    return () => clearTimeout(t);
  }, [cut.type, saju.status, loadingStartedAt, cutIndex, goToCut]);

  // 3초 초과 시 문구 전환
  useEffect(() => {
    if (cut.type !== "analysis-loading" || saju.status !== "loading") {
      setShowSlowMsg(false);
      return;
    }
    const t = setTimeout(() => setShowSlowMsg(true), 3000);
    return () => clearTimeout(t);
  }, [cut.type, saju.status]);

  // sajuRequestId 보관
  useEffect(() => {
    if (saju.status !== "success" || !saju.data) return;
    try {
      localStorage.setItem("doyoonSajuRequestId", saju.data.sajuRequestId);
    } catch {}
  }, [saju.status, saju.data]);

  // CTA 클릭
  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("[TODO] 결제 라우트로 이동");
    alert("결제 페이지는 준비 중입니다.");
  };

  const bgImage = getBg(cut);
  const nextCutForCrossfade = DOYOON_CUTS[cutIndex + 1];
  const nextBg = nextCutForCrossfade ? getBg(nextCutForCrossfade) : null;

  const isAside = cut.type === "aside";
  const isLeanIn = cut.type === "final-leanin";
  const leanInBgSrc =
    isLeanIn && leanInZoomed
      ? (cut as Extract<Cut, { type: "final-leanin" }>).bgZoomed
      : bgImage;

  return (
    <div
      className="relative flex flex-1 flex-col overflow-hidden"
      style={{ background: SURFACE }}
      onClick={handleTap}
    >
      {/* 배경 이미지 */}
      {bgImage && (
        <Image
          src={isLeanIn && leanInBgSrc ? leanInBgSrc : bgImage}
          alt=""
          fill
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover object-center"
          style={{
            opacity: fading ? 0 : 1,
            transition:
              "opacity 0.4s ease, transform 1.6s cubic-bezier(0.22,1,0.36,1)",
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
          sizes="(max-width: 448px) 100vw, 448px"
          className="absolute inset-0 object-cover object-center animate-[fadeIn_0.4s_ease-out]"
        />
      )}

      {/* aside 회색 오버레이 */}
      {isAside && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "rgba(20,19,17,0.55)" }}
        />
      )}

      {/* 다이얼로그 컷들 */}
      {!fading &&
        !crossFading &&
        (cut.type === "dialogue" ||
          cut.type === "dialogue-closeup" ||
          cut.type === "dialogue-after-result" ||
          cut.type === "final-leanin") && (
          <DialogueOverlay
            speaker={cut.speaker}
            text={fullText.slice(0, displayedCount)}
            isComplete={isComplete && !(isLeanIn && lineIndex === cut.lines.length - 1)}
          />
        )}

      {/* 연우 한숨 (aside) */}
      {!fading && !crossFading && cut.type === "aside" && (
        <AsideComment
          speaker={cut.speaker}
          text={fullText.slice(0, displayedCount)}
          isComplete={isComplete}
        />
      )}

      {/* 태블릿 핸드오프 가이드 */}
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

      {/* 분석 중 표시 (로딩 / 느린 응답 / 에러) */}
      {!fading && cut.type === "analysis-loading" && (
        <div className="relative z-10 my-auto px-6 text-center">
          {saju.status === "error" && saju.error ? (
            <>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "#F5EDE0" }}
              >
                {saju.error.message}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLoadingStartedAt(Date.now());
                  saju.retry();
                }}
                className="mt-5 rounded-full px-5 py-2 text-[11px] tracking-[0.3em]"
                style={{
                  background: "rgba(230,197,142,0.18)",
                  color: "#FFE2B3",
                  borderTop: "1px solid rgba(245,237,224,0.12)",
                }}
              >
                다시 시도
              </button>
            </>
          ) : (
            <>
              <p
                className="text-[11px] tracking-[0.4em]"
                style={{ color: "rgba(230,197,142,0.85)" }}
              >
                {showSlowMsg ? "별의 배치를 읽는 중…" : "데이터 분석 중"}
              </p>
              <div className="mx-auto mt-3 flex justify-center gap-1.5">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1 w-1 animate-pulse rounded-full"
                    style={{ background: "#E6C58E", animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 정보 입력 폼 (cut 8) */}
      {!fading && cut.type === "info-form" && (
        <InfoForm
          onSubmit={(info: SajuInfo) => {
            try {
              localStorage.setItem("doyoonSaju", JSON.stringify(info));
            } catch {}
            setLoadingStartedAt(Date.now());
            saju.submit({
              birth: info.birth.replace(/\./g, "-"),
              time: info.time,
              calendar: info.calendar,
              gender: info.gender,
            });
            goToCut(cutIndex + 1);
          }}
        />
      )}

      {/* 분석 결과 + 확장 리포트 (cut 10) */}
      {!fading && !crossFading && cut.type === "analysis-result" && (
        <SajuChartCards
          intro={cut.intro}
          data={saju.data ?? MOCK_SAJU}
          name={userName}
          onNext={() => goToCut(cutIndex + 1)}
        />
      )}

      {/* 설문 1/3, 2/3 — 다중선택 */}
      {!fading && cut.type === "survey" && cut.step === 1 && (
        <SurveyMultiSelect
          step={SURVEY_STEPS[1]}
          onNext={(answers) => {
            setSurveyAnswers((prev) => ({ ...prev, step1: answers }));
            goToCut(cutIndex + 1);
          }}
        />
      )}
      {!fading && cut.type === "survey" && cut.step === 2 && (
        <SurveyMultiSelect
          step={SURVEY_STEPS[2]}
          onNext={(answers) => {
            setSurveyAnswers((prev) => ({ ...prev, step2: answers }));
            goToCut(cutIndex + 1);
          }}
        />
      )}
      {/* 설문 3/3 — 자유 서술 */}
      {!fading && cut.type === "survey" && cut.step === 3 && (
        <SurveyFreeText
          step={SURVEY_STEPS[3]}
          onNext={(text) => {
            const finalAnswers = { ...surveyAnswers, step3: text };
            setSurveyAnswers(finalAnswers);
            try {
              localStorage.setItem(
                "doyoonSurvey",
                JSON.stringify(finalAnswers),
              );
            } catch {}
            const sajuRequestId =
              saju.data?.sajuRequestId ??
              (typeof window !== "undefined"
                ? localStorage.getItem("doyoonSajuRequestId")
                : null);
            if (sajuRequestId) {
              void postSajuSurvey({
                sajuRequestId,
                surveyVersion: "v1",
                step1: finalAnswers.step1,
                step2: finalAnswers.step2,
                step3: finalAnswers.step3.length > 0 ? finalAnswers.step3 : null,
              });
            }
            goToCut(cutIndex + 1);
          }}
        />
      )}

      {/* 마지막 컷 CTA */}
      {isLeanIn && ctaVisible && !fading && (
        <div
          className="absolute bottom-10 left-0 right-0 z-20 px-6 animate-[fadeIn_0.6s_ease-out]"
        >
          <button
            onClick={handleCta}
            className="w-full rounded-2xl py-4 text-sm font-bold tracking-[0.3em] transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FFE2B3, #E6C58E)",
              color: "#412d04",
              boxShadow: "0 0 32px rgba(230,197,142,0.25)",
            }}
          >
            결제하고 풀스토리 보기 →
          </button>
        </div>
      )}

      {/* 우상단: 상담사 변경 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push("/select");
        }}
        className="absolute right-3 top-3 z-50 rounded-md px-2.5 py-1 text-[10px] tracking-[0.25em] backdrop-blur transition-opacity active:opacity-80"
        style={{
          background: "rgba(40,38,34,0.65)",
          color: "rgba(208,197,182,0.85)",
          borderTop: "1px solid rgba(245,237,224,0.1)",
        }}
      >
        ← 상담사 변경
      </button>

      {/* 개발용 네비 */}
      {IS_DEV && (
        <div className="absolute left-3 top-3 z-50 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              jumpTo(-1);
            }}
            disabled={cutIndex === 0}
            className="rounded-md px-2.5 py-1 text-[11px] backdrop-blur transition-opacity active:opacity-80 disabled:opacity-25"
            style={{ background: "rgba(0,0,0,0.6)", color: "white" }}
          >
            이전
          </button>
          <span
            className="rounded-md px-2 py-1 text-[11px] tabular-nums backdrop-blur"
            style={{ background: "rgba(0,0,0,0.6)", color: "white" }}
          >
            {cutIndex + 1} / {DOYOON_CUTS.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              jumpTo(1);
            }}
            disabled={cutIndex === DOYOON_CUTS.length - 1}
            className="rounded-md px-2.5 py-1 text-[11px] backdrop-blur transition-opacity active:opacity-80 disabled:opacity-25"
            style={{ background: "rgba(0,0,0,0.6)", color: "white" }}
          >
            다음
          </button>
        </div>
      )}

      {/* 페이드 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: SURFACE,
          opacity: fading ? 1 : 0,
          transition: "opacity 0.32s ease",
        }}
      />
    </div>
  );
}
