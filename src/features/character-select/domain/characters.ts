export type Side = "left" | "right" | null;
export type Phase = "selecting" | "confirming";
export type CharKey = "yeonwoo" | "doyoon";

export const CHARACTER_INFO = {
  yeonwoo: {
    fullName: "강 연 우",
    title: "직관적 명리학자",
    subtitle: "전통 · 직관 · 영적 해석",
    quote:
      "답도 없는 네 연애운, 내가 썩은 줄 다 끊어내고 네 진짜 붉은 실만 손에 쥐여줄 테니까.",
    nameColor: "#ffd4a8",
    accentColor: "rgba(255,150,50,0.8)",
    borderColor: "rgba(255,180,100,0.65)",
    glowColor: "rgba(255,150,50,0.35)",
    selectImage: "/select-yeonwoo.webp",
    confirmImage: "/confirm-yeonwoo.png",
  },
  doyoon: {
    fullName: "한 도 윤",
    title: "이성적 연애 분석가",
    subtitle: "현대 · 분석 · 데이터 해석",
    quote:
      "수만 건의 행동 심리 데이터와 알고리즘으로, 당신의 연애 패턴을 완벽하게 재설계해 드릴 테니까요.",
    nameColor: "#fff5d6",
    accentColor: "rgba(255,230,150,0.8)",
    borderColor: "rgba(255,220,140,0.65)",
    glowColor: "rgba(255,210,130,0.35)",
    selectImage: "/select-doyoon.webp",
    confirmImage: "/confirm-doyoon.png",
  },
} as const;
