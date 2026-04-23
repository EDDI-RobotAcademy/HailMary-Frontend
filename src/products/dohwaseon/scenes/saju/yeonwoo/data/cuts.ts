export type Cut =
  | {
      type: "dialogue";
      bg: string;
      speaker: "강연우" | "내레이션";
      lines: string[];
    }
  | {
      type: "dialogue-closeup";
      bg: string;
      speaker: "강연우";
      lines: string[];
    }
  | { type: "aside"; bg: string; speaker: "도윤"; lines: string[] }
  | { type: "tablet-handoff"; bg: string }
  | { type: "info-form"; bg: string }
  | { type: "analysis-loading"; bg: string }
  | { type: "analysis-result"; bg: string; intro: string }
  | { type: "dialogue-after-result"; bg: string; speaker: "강연우"; lines: string[] }
  | { type: "survey"; step: 1 | 2 | 3 }
  | {
      type: "final-leanin";
      bg: string;
      bgZoomed: string;
      speaker: "강연우";
      lines: string[];
    };

const ASSET = (n: string) => `/saju/yeonwoo/cut-${n}.png`;

export const YEONWOO_CUTS: Cut[] = [
  // 1컷: 연우 등장 + 미간 찌푸림
  {
    type: "dialogue",
    bg: ASSET("1"),
    speaker: "강연우",
    lines: [
      "하... 또 귀찮은 게 들어왔네.",
      "네 꼬라지 보니까 연애운 물어보러 온 거 맞지? 따라와.",
    ],
  },
  // 2컷: 도윤 여유 미소 (옆에서)
  {
    type: "aside",
    bg: ASSET("2"),
    speaker: "도윤",
    lines: [
      "난 네가 무식하게 깎아 먹는 기력을 아껴주려고 합리적인 데이터를 제공하는 것뿐인데.",
      "아쉽네.",
    ],
  },
  // 3컷: 문 탁 열림 + 시선 전환
  {
    type: "dialogue",
    bg: ASSET("3"),
    speaker: "강연우",
    lines: [
      "왜, 저기 양복 빼입은 놈한테 가고 싶어?",
      "가. 가서 통계니 심리학이니 번지르르한 말장난에 돈이나 뜯겨보든가.",
    ],
  },
  // 4컷: 방 전환 (자동 페이드)
  { type: "tablet-handoff", bg: ASSET("4") },
  // 5컷: 신안 클로즈업 (자동 페이드)
  { type: "tablet-handoff", bg: ASSET("5") },
  // 6컷: 클로즈업 + 시꺼먼 실
  {
    type: "dialogue-closeup",
    bg: ASSET("6"),
    speaker: "강연우",
    lines: [
      "내 눈엔 지금 네 주변에 시꺼먼 실들이 덕지덕지 엉킨 게 보이거든.",
    ],
  },
  // 7컷: 견적 + 질문
  {
    type: "dialogue",
    bg: ASSET("7"),
    speaker: "강연우",
    lines: [
      "딱 보니까 견적 나오는데.",
      "지금 널 제일 갉아먹고 있는 게 뭐야? 솔직하게 말해.",
    ],
  },
  // 8컷: 설문 1/3 (중간 설문)
  { type: "survey", step: 1 },
  // 9컷: 혀 차며 만세력 펼침
  {
    type: "dialogue",
    bg: ASSET("9"),
    speaker: "강연우",
    lines: [
      "어휴, 답답해.",
      "양손에 쓰레기를 쥐고 있는데 새 인연이 어떻게 들어오냐?",
    ],
  },
  // 10컷: 썩은 동아줄
  {
    type: "dialogue",
    bg: ASSET("10"),
    speaker: "강연우",
    lines: [
      "됐고. 내가 그 썩은 동아줄 끊어내고 길 터줄 테니까, 사주나 똑바로 불러봐.",
      "네 명줄의 좌표가 있어야 뭘 하든 말든 할 거 아냐.",
    ],
  },
  // 11컷: 사주 정보 입력 폼 (bg: cut-11)
  { type: "info-form", bg: ASSET("11") },
  // 12컷: 분석 중
  { type: "analysis-loading", bg: ASSET("12") },
  // 13컷: 분석 결과 + 4기둥
  {
    type: "analysis-result",
    bg: ASSET("13"),
    intro: "좌표 확인했어. 네 명줄, 내 눈에 다 들어왔다.",
  },
  // 14컷: 결과 직후 연우 대사
  {
    type: "dialogue-after-result",
    bg: ASSET("13"),
    speaker: "강연우",
    lines: [
      "마지막으로 묻는다.",
      "나한테서 제일 듣고 싶은 게 뭔데. 쓸데없는 기력 낭비 안 하게 하나만 확실하게 해.",
    ],
  },
  // 15컷: 설문 2/3
  { type: "survey", step: 2 },
  // 16컷: 설문 3/3
  { type: "survey", step: 3 },
  // 17컷: 마무리 + CTA (cut-14 한 장으로 CSS scale 줌)
  {
    type: "final-leanin",
    bg: ASSET("14"),
    bgZoomed: ASSET("14"),
    speaker: "강연우",
    lines: [
      "네 붉은 실 한 가닥, 내가 직접 쥐었어.",
      "딴 데 기웃거리지 말고, 내가 짚어주는 길만 봐. 그게 네가 살 수 있는 유일한 방법이야.",
    ],
  },
];
