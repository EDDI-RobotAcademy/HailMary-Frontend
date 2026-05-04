export type SajuCalendar = "solar" | "lunar";
export type SajuGender = "male" | "female";

export interface SajuFreeRequest {
  name: string;
  birth: string;
  time: string;
  calendar: SajuCalendar;
  gender: SajuGender;
}

export type WuxingKey = "목" | "화" | "토" | "금" | "수";
export type WuxingJudgment = "결핍" | "적정" | "발달" | "과다";
export type YinYang = "양" | "음";
export type StrengthLevel =
  | "극약" | "태약" | "신약" | "중화" | "신강" | "태강" | "극왕";

export interface PillarSinSal {
  slug: string;
  label: string;
  hanja: string;
}

export interface Pillar {
  label: "년주" | "월주" | "일주" | "시주";
  heaven: string;
  earth: string;
  heavenHangul: string;
  earthHangul: string;
  element: string;
  hue: string;
  yinYang: { heaven: YinYang; earth: YinYang };
  tenGod: { heaven: string; earth: string; heavenHanja: string; earthHanja: string };
  twelvePhase: { name: string; hanja: string };
  sinSals: PillarSinSal[];
  unknown: boolean;
}

export interface Wuxing {
  counts: Record<WuxingKey, number>;
  ratios: Record<WuxingKey, number>;
  judgments: Record<WuxingKey, WuxingJudgment>;
}

export interface YongSinSlot {
  element: string;
  hanja: string;
  role: "용신" | "희신" | "기신";
}

export interface YongSinView {
  primary: YongSinSlot;
  secondary: YongSinSlot | null;
  opposing: YongSinSlot;
}

export interface DayMaster {
  stem: string;
  stemHanja: string;
  strengthLevel: StrengthLevel;
  strengthScale: 7;
  strengthPosition: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export interface DaeUnPeriod {
  age: number;
  startYear: number;
  stem: string;
  branch: string;
  stemHanja: string;
  branchHanja: string;
  element: string;
  hue: string;
}

export interface DaeUn {
  startAge: number;
  direction: "forward" | "reverse";
  periods: DaeUnPeriod[];
}

// 백엔드 /api/saju/free 응답 (sajuData는 FortuneTeller raw 출력).
// charm/blocking/spouseAvoid/spouseMatch/monthlyRomanceFlow는 최상위 분석 필드.
// sessionToken: 보호된 엔드포인트(/api/saju/survey 등) 호출 시 Authorization 헤더로 사용.
//   기존에는 sequential int sajuRequestId를 쓰던 자리. 이제 32+자 무작위 토큰.
export interface SajuFreeResponse {
  sessionToken: string;
  // FortuneTeller raw output (pillars 등은 sajuData 안에 중첩 or 없을 수 있음)
  sajuData?: {
    pillars?: Pillar[];
    highlight?: string;
    wuxing?: Wuxing;
    yongSin?: YongSinView | null;
    dayMaster?: DayMaster;
    daeUn?: DaeUn;
    [key: string]: unknown;
  };
  // 기존 flat 형식 호환 (레거시)
  pillars?: Pillar[];
  highlight?: string;
  wuxing?: Wuxing;
  yongSin?: YongSinView | null;
  dayMaster?: DayMaster;
  daeUn?: DaeUn;
  // 분석 필드 (backend-saju 팀이 추가)
  charm?: import("@/features/saju-result/domain/types").CharmView;
  blocking?: import("@/features/saju-result/domain/types").BlockingView;
  spouseAvoid?: import("@/features/saju-result/domain/types").SpouseAvoidView;
  spouseMatch?: import("@/features/saju-result/domain/types").SpouseMatchView;
  monthlyRomanceFlow?: import("@/features/saju-result/domain/types").MonthlyRomanceFlowView;
}

// 인증은 Authorization: Bearer <sessionToken> 헤더로 전달됨. body에는 사용자 식별자 없음.
export interface SajuSurveyRequest {
  surveyVersion: "v1";
  step1: string[];
  step2: string[];
  step3: string | null;
}

export type SajuErrorCode =
  | "BAD_REQUEST" | "UNAUTHORIZED" | "CALCULATION_FAILED" | "TIMEOUT" | "NETWORK" | "UNKNOWN";

export interface SajuError {
  code: SajuErrorCode;
  message: string;
  fieldHints?: { field: string; message: string }[];
}
