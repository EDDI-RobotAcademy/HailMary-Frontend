"use client";

import Image from "next/image";
import { useIntroScene } from "../hooks/useIntroScene";
import { STEPS } from "../domain/introSteps";
import { SceneProgressBar } from "@/components/SceneProgressBar";
import { FadeOverlay } from "@/components/FadeOverlay";
import { DialogueCut } from "./components/DialogueCut";
import { ButtonCut } from "./components/ButtonCut";
import { VideoCut } from "./components/VideoCut";
import { DoorCut } from "./components/DoorCut";
import { PhoneCut } from "./components/PhoneCut";
import { FlashSequenceCut } from "./components/FlashSequenceCut";

export function IntroScene() {
  const {
    step, stepIndex, bgImage,
    displayedText, isComplete, showDialogue,
    fading, crossFading, flashWhite,
    muted, showSoundHint,
    visibleNotifs, phonePhase,
    flashSeqIndex, flashSeqWhite,
    handleTap, handleVideoEnd, handleDoorClick, handleButtonClick, toggleMute,
    jumpToStep, videoRef,
  } = useIntroScene();

  return (
    <div className="relative flex flex-1 flex-col animate-[fadeIn_0.8s_ease-in]" onClick={handleTap}>
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

      <SceneProgressBar stepIndex={stepIndex} totalSteps={STEPS.length}
        onPrev={jumpToStep(-1)} onNext={jumpToStep(1)} />

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
                  crossFading={crossFading} flashWhite={flashWhite} onToggleMute={toggleMute} />
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
    </div>
  );
}
