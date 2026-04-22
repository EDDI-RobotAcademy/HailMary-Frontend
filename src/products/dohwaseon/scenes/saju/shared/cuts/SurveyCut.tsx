"use client";

// 서베이 컷 (step 1, 2, 3) 공용 디스패처.
// step 1/2 는 다중선택, step 3 는 자유 서술.

import SurveyMultiSelect from "../components/SurveyMultiSelect";
import SurveyFreeText from "../components/SurveyFreeText";
import type {
  SurveyMultiStep,
  SurveyTextStep,
} from "../types";

type SurveyCutProps =
  | {
      step: 1 | 2;
      config: SurveyMultiStep;
      onAnswer: (answers: string[]) => void;
    }
  | {
      step: 3;
      config: SurveyTextStep;
      onAnswer: (text: string) => void;
    };

export default function SurveyCut(props: SurveyCutProps) {
  if (props.step === 3) {
    return <SurveyFreeText step={props.config} onNext={props.onAnswer} />;
  }
  return <SurveyMultiSelect step={props.config} onNext={props.onAnswer} />;
}
