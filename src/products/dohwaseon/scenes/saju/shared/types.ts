// 도화선 사주 씬 공용 타입.
// 서베이 옵션 타입은 도윤/연우 양쪽이 같은 구조를 쓰므로 여기서 한 번만 정의한다.
// id 는 백엔드 /api/saju/survey 에 그대로 전송되는 슬러그다(v1).
// 슬러그 목록은 docs/backend-integration.md §6 참조 — UI 라벨 변경 시에도 id 는 유지.

export type SurveyMultiOption = {
  id: string;
  label: string;
  icon: string;
};

export type SurveyMultiStep = {
  step: 1 | 2;
  type: "multi";
  title: string;
  subtitle: string;
  pageLabel: string;
  options: SurveyMultiOption[];
};

export type SurveyTextStep = {
  step: 3;
  type: "text";
  title: string;
  subtitle: string;
  pageLabel: string;
  maxLength: number;
  placeholder: string;
};

export type SurveyStep = SurveyMultiStep | SurveyTextStep;

export type SurveyAnswers = {
  step1: string[];
  step2: string[];
  step3: string;
};
