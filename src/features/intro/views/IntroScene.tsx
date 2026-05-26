"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useIntroScene } from "../hooks/useIntroScene";
import { STEPS } from "../domain/introSteps";
import { trackEvent } from "@/shared/utils/analytics";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { SceneProgressBar } from "@/components/SceneProgressBar";
import { FadeOverlay } from "@/components/FadeOverlay";

type PendingNav = "home" | "skip" | null;

const NAV_PROMPT: Record<Exclude<PendingNav, null>, { message: string; confirmLabel: string; href: string }> = {
  home: { message: "메인 화면으로 돌아갈까요?\n진행 중인 인트로는 종료돼요", confirmLabel: "메인으로", href: "/" },
  skip: { message: "인트로를 건너뛰고\n캐릭터 선택으로 넘어갈까요?", confirmLabel: "건너뛰기", href: "/select" },
};
import { DialogueCut } from "./components/DialogueCut";
import { ButtonCut } from "./components/ButtonCut";
import { VideoCut } from "./components/VideoCut";
import { DoorCut } from "./components/DoorCut";
import { PhoneCut } from "./components/PhoneCut";
import { FlashSequenceCut } from "./components/FlashSequenceCut";

export function IntroScene() {
  const router = useRouter();
  const [pendingNav, setPendingNav] = useState<PendingNav>(null);
  const {
    step, stepIndex, bgImage,
    displayedText, isComplete, showDialogue,
    fading, crossFading, flashWhite,
    muted, showSoundHint,
    visibleNotifs, phonePhase,
    flashSeqIndex, flashSeqWhite,
    handleTap, handleVideoEnd, handleDoorClick, handleButtonClick, toggleMute,
    videoRef,
  } = useIntroScene();

  return (
    <div className="relative flex flex-1 flex-col animate-[fadeIn_0.8s_ease-in]" style={{ fontFamily: "var(--font-pretendard)" }} onClick={handleTap}>
      {/* 배경 이미지 */}
      {step.type !== "video" && bgImage && (
        <Image src={bgImage} alt="" fill priority className="object-cover object-center"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }} />
      )}

      {/* 이어지는 장면 크로스페이드 */}
      {crossFading && (() => {
        const nextStep = STEPS[stepIndex + 1];
        if (!nextStep || !("bg" in nextStep)) return null;
        return (
          <Image src={(nextStep as { bg: string }).bg} alt="" fill priority
            className="absolute inset-0 object-cover object-center animate-[fadeIn_0.4s_ease-out]" />
        );
      })()}

      <SceneProgressBar stepIndex={stepIndex} totalSteps={STEPS.length} />

      {/* 사운드 안내 — 모든 스텝에서 표시 */}
      {showSoundHint && muted && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/70 to-transparent px-6 pb-16 pt-[100px] text-center">
          <p className="animate-pulse text-base font-medium text-white">
            소리를 재생하시려면 화면을 눌러주세요
          </p>
        </div>
      )}

      {/* step.type 기준 Cut 컴포넌트 분기 */}
      {(() => {
        switch (step.type) {
          case "dialogue":
          case "sfx-dialogue":
          case "dramatic-dialogue":
            return showDialogue
              ? <DialogueCut step={step} displayedText={displayedText} isComplete={isComplete}
                  muted={muted} showSoundHint={false} fading={fading}
                  crossFading={crossFading} flashWhite={flashWhite} onToggleMute={toggleMute}
                  onGoHome={(e) => {
                    e.stopPropagation();
                    trackEvent("intro_home_click", {
                      chapter_index: stepIndex,
                      scene_label: `${stepIndex + 1}/${STEPS.length}`,
                    });
                    setPendingNav("home");
                  }}
                  onSkip={(e) => {
                    e.stopPropagation();
                    trackEvent("intro_skip_click", {
                      chapter_index: stepIndex,
                      scene_label: `${stepIndex + 1}/${STEPS.length}`,
                    });
                    setPendingNav("skip");
                  }} />
              : null;
          case "button":
            return <ButtonCut step={step} bgImage={bgImage} fading={fading} onNext={handleButtonClick} />;
          case "video":
            return <VideoCut step={step} muted={muted} videoRef={videoRef} onEnded={handleVideoEnd} />;
          case "door":
            return <DoorCut bgImage={bgImage} fading={fading} onDoorClick={handleDoorClick} />;
          case "phone":
            return <PhoneCut step={step} visibleNotifs={visibleNotifs} phonePhase={phonePhase}
              displayedText={displayedText} isComplete={isComplete} muted={muted}
              fading={fading} onToggleMute={toggleMute} />;
          case "flash-sequence":
            return <FlashSequenceCut step={step} flashSeqIndex={flashSeqIndex} flashSeqWhite={flashSeqWhite} />;
        }
      })()}

      <FadeOverlay visible={fading} color="black" durationMs={250} />
      <FadeOverlay visible={flashWhite} color="white" durationMs={150} easing="ease-out" />

      <ConfirmModal
        open={pendingNav !== null}
        message={pendingNav ? NAV_PROMPT[pendingNav].message : ""}
        confirmLabel={pendingNav ? NAV_PROMPT[pendingNav].confirmLabel : "확인"}
        cancelLabel="취소"
        onConfirm={() => {
          if (!pendingNav) return;
          trackEvent(
            pendingNav === "home" ? "intro_home_confirm" : "intro_skip_confirm",
            {
              chapter_index: stepIndex,
              scene_label: `${stepIndex + 1}/${STEPS.length}`,
              action: "confirm",
            },
          );
          const href = NAV_PROMPT[pendingNav].href;
          setPendingNav(null);
          router.push(href);
        }}
        onCancel={() => {
          if (pendingNav) {
            trackEvent(
              pendingNav === "home" ? "intro_home_confirm" : "intro_skip_confirm",
              {
                chapter_index: stepIndex,
                scene_label: `${stepIndex + 1}/${STEPS.length}`,
                action: "cancel",
              },
            );
          }
          setPendingNav(null);
        }}
      />
    </div>
  );
}
