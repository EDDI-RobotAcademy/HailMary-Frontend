// 도윤 씬 서베이 실제 데이터. 타입은 shared/types.ts 로 승격됨.
import type {
  SurveyMultiStep,
  SurveyTextStep,
} from "../../shared/types";

export type {
  SurveyMultiOption,
  SurveyMultiStep,
  SurveyTextStep,
  SurveyStep,
  SurveyAnswers,
} from "../../shared/types";

export const SURVEY_STEP_1: SurveyMultiStep = {
  step: 1,
  type: "multi",
  title: "다음 중 본인의 상황과\n가장 가까운 것을 선택하세요.",
  subtitle: "복수선택 가능",
  pageLabel: "1 / 3",
  options: [
    { id: "waiting_new", label: "새로운 인연을 기다려요", icon: "+" },
    { id: "crushing", label: "썸 타는 중이에요", icon: "♥" },
    { id: "in_relationship", label: "연애 중이에요", icon: "♥" },
    { id: "missing_ex", label: "헤어진 연인이 그리워요", icon: "↻" },
  ],
};

export const SURVEY_STEP_2: SurveyMultiStep = {
  step: 2,
  type: "multi",
  title: "이번 분석에서 가장\n알고 싶은 것은 무엇인가요?",
  subtitle: "복수선택 가능",
  pageLabel: "2 / 3",
  options: [
    { id: "soulmate", label: "내 운명의 상대", icon: "★" },
    { id: "timing", label: "다음 인연의 시기", icon: "◷" },
    { id: "compatibility", label: "현재 인연과의 궁합", icon: "∞" },
    { id: "patterns", label: "내 연애 패턴의 본질", icon: "◇" },
  ],
};

export const SURVEY_STEP_3: SurveyTextStep = {
  step: 3,
  type: "text",
  title: "요즘 밤잠을 설치게 하는\n가장 큰 고민은 무엇인가요?",
  subtitle: "솔직하게 적어주세요.",
  pageLabel: "3 / 3",
  maxLength: 100,
  placeholder: "헤어진 연인이 그리워요. 다시 연락해도 될까요?",
};

export const SURVEY_STEPS = {
  1: SURVEY_STEP_1,
  2: SURVEY_STEP_2,
  3: SURVEY_STEP_3,
} as const;
