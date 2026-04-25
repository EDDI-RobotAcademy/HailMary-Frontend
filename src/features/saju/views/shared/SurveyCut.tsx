"use client";

import SurveyMultiSelect from "./SurveyMultiSelect";
import SurveyFreeText from "./SurveyFreeText";
import type { SurveyMultiStep, SurveyTextStep } from "@/features/saju/domain/types";

type SurveyCutProps =
  | { step: 1 | 2; config: SurveyMultiStep; onAnswer: (answers: string[]) => void; characterId?: string }
  | { step: 3; config: SurveyTextStep; onAnswer: (text: string) => void; buttonLabel?: string; characterId?: string };

export default function SurveyCut(props: SurveyCutProps) {
  if (props.step === 3) {
    return (
      <SurveyFreeText
        step={props.config}
        onNext={props.onAnswer}
        buttonLabel={props.buttonLabel}
        characterId={props.characterId}
      />
    );
  }
  return <SurveyMultiSelect step={props.config} onNext={props.onAnswer} characterId={props.characterId} />;
}
