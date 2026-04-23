import type { SajuFreeResponse } from "@/features/saju";

export type MockSaju = Omit<SajuFreeResponse, "sajuRequestId">;

// 개발용 fallback — 씬을 개발 네비게이션으로 직진입했을 때 화면이 깨지지 않도록.
// 실 사용자 플로에선 백엔드 응답이 이 값을 대체한다.
export const MOCK_SAJU: MockSaju = {
  pillars: [
    {
      label: "년주",
      heaven: "丙",
      earth: "子",
      heavenHangul: "병",
      earthHangul: "자",
      element: "화 / 수",
      hue: "#E6A88E",
      yinYang: { heaven: "양", earth: "양" },
      tenGod: {
        heaven: "비견",
        earth: "정관",
        heavenHanja: "比肩",
        earthHanja: "正官",
      },
      twelvePhase: { name: "태", hanja: "胎" },
      sinSals: [{ slug: "gong_mang", label: "공망", hanja: "空亡" }],
      unknown: false,
    },
    {
      label: "월주",
      heaven: "癸",
      earth: "巳",
      heavenHangul: "계",
      earthHangul: "사",
      element: "수 / 화",
      hue: "#6B8BB5",
      yinYang: { heaven: "음", earth: "음" },
      tenGod: {
        heaven: "정관",
        earth: "비견",
        heavenHanja: "正官",
        earthHanja: "比肩",
      },
      twelvePhase: { name: "건록", hanja: "建祿" },
      sinSals: [
        { slug: "gwi_mun_gwan_sal", label: "귀문관살", hanja: "鬼門關殺" },
      ],
      unknown: false,
    },
    {
      label: "일주",
      heaven: "丙",
      earth: "寅",
      heavenHangul: "병",
      earthHangul: "인",
      element: "화 / 목",
      hue: "#E6A88E",
      yinYang: { heaven: "양", earth: "양" },
      tenGod: {
        heaven: "비견",
        earth: "편인",
        heavenHanja: "比肩",
        earthHanja: "偏印",
      },
      twelvePhase: { name: "장생", hanja: "長生" },
      sinSals: [
        { slug: "yeok_ma_sal", label: "역마살", hanja: "驛馬殺" },
        { slug: "cheon_eul_gwi_in", label: "천을귀인", hanja: "天乙貴人" },
      ],
      unknown: false,
    },
    {
      label: "시주",
      heaven: "丙",
      earth: "申",
      heavenHangul: "병",
      earthHangul: "신",
      element: "화 / 금",
      hue: "#E6A88E",
      yinYang: { heaven: "양", earth: "양" },
      tenGod: {
        heaven: "비견",
        earth: "편재",
        heavenHanja: "比肩",
        earthHanja: "偏財",
      },
      twelvePhase: { name: "병", hanja: "病" },
      sinSals: [{ slug: "do_hwa_sal", label: "도화살", hanja: "桃花殺" }],
      unknown: false,
    },
  ],
  highlight: "도화살(桃花殺) — 일지(日支)에 위치",
  wuxing: {
    counts: { 목: 1, 화: 4, 토: 0, 금: 1, 수: 2 },
    ratios: { 목: 12.5, 화: 50, 토: 0, 금: 12.5, 수: 25 },
    judgments: {
      목: "적정",
      화: "과다",
      토: "결핍",
      금: "적정",
      수: "발달",
    },
  },
  yongSin: {
    primary: { element: "토", hanja: "土", role: "용신" },
    secondary: { element: "금", hanja: "金", role: "희신" },
    opposing: { element: "화", hanja: "火", role: "기신" },
  },
  dayMaster: {
    stem: "병",
    stemHanja: "丙",
    strengthLevel: "태강",
    strengthScale: 7,
    strengthPosition: 6,
  },
  daeUn: {
    startAge: 2,
    direction: "forward",
    periods: [
      { age: 2, startYear: 1998, stem: "갑", branch: "오", stemHanja: "甲", branchHanja: "午", element: "목 / 화", hue: "#9CC8B0" },
      { age: 12, startYear: 2008, stem: "을", branch: "미", stemHanja: "乙", branchHanja: "未", element: "목 / 토", hue: "#9CC8B0" },
      { age: 22, startYear: 2018, stem: "병", branch: "신", stemHanja: "丙", branchHanja: "申", element: "화 / 금", hue: "#E6A88E" },
      { age: 32, startYear: 2028, stem: "정", branch: "유", stemHanja: "丁", branchHanja: "酉", element: "화 / 금", hue: "#E6A88E" },
      { age: 42, startYear: 2038, stem: "무", branch: "술", stemHanja: "戊", branchHanja: "戌", element: "토 / 토", hue: "#E6C58E" },
      { age: 52, startYear: 2048, stem: "기", branch: "해", stemHanja: "己", branchHanja: "亥", element: "토 / 수", hue: "#E6C58E" },
      { age: 62, startYear: 2058, stem: "경", branch: "자", stemHanja: "庚", branchHanja: "子", element: "금 / 수", hue: "#C5CAD4" },
    ],
  },
};
