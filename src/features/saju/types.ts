export type SajuCalendar = "solar" | "lunar";
export type SajuGender = "male" | "female";

export interface SajuFreeRequest {
  birth: string; // YYYY-MM-DD
  time: string; // HH:MM | "unknown"
  calendar: SajuCalendar;
  gender: SajuGender;
}

export type WuxingKey = "목" | "화" | "토" | "금" | "수";
export type WuxingJudgment = "결핍" | "적정" | "발달" | "과다";
export type YinYang = "양" | "음";
export type StrengthLevel =
  | "극약"
  | "태약"
  | "신약"
  | "중화"
  | "신강"
  | "태강"
  | "극왕";

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
  tenGod: {
    heaven: string;
    earth: string;
    heavenHanja: string;
    earthHanja: string;
  };
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

export interface SajuFreeResponse {
  pillars: Pillar[];
  highlight: string;
  wuxing: Wuxing;
  yongSin: YongSinView | null;
  dayMaster: DayMaster;
  daeUn: DaeUn;
  sajuRequestId: string;
}

export interface SajuSurveyRequest {
  sajuRequestId: string;
  surveyVersion: "v1";
  step1: string[];
  step2: string[];
  step3: string | null;
}

export type SajuErrorCode =
  | "BAD_REQUEST"
  | "CALCULATION_FAILED"
  | "TIMEOUT"
  | "NETWORK"
  | "UNKNOWN";

export interface SajuError {
  code: SajuErrorCode;
  message: string;
  fieldHints?: { field: string; message: string }[];
}
