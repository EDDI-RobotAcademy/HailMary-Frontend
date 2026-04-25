export interface SurveyAnswers {
  step1: string[];
  step2: string[];
  step3: string;
}

export interface SurveyMultiOption {
  id: string;
  label: string;
  icon: string;
}

export interface SurveyMultiStep {
  step: 1 | 2;
  type: "multi";
  title: string;
  subtitle: string;
  pageLabel: string;
  options: SurveyMultiOption[];
}

export interface SurveyTextStep {
  step: 3;
  type: "text";
  title: string;
  subtitle: string;
  pageLabel: string;
  maxLength: number;
  placeholder: string;
}

export type SurveyStep = SurveyMultiStep | SurveyTextStep;
