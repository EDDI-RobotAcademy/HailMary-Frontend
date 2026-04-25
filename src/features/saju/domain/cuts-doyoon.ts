export type Cut =
  | { type: "dialogue"; bg: string; speaker: "도윤" | "내레이션"; lines: string[] }
  | { type: "dialogue-closeup"; bg: string; speaker: "도윤"; lines: string[] }
  | { type: "aside"; bg: string; speaker: "강연우"; lines: string[] }
  | { type: "tablet-handoff"; bg: string }
  | { type: "info-form"; bg: string }
  | { type: "survey"; step: 1 | 2 | 3 }
  | { type: "final-leanin"; bg: string; bgZoomed: string; speaker: "도윤"; lines: string[] };

const ASSET = (n: string) => `/saju/doyoon/cut-${n}.png`;

export const DOYOON_CUTS: Cut[] = [
  {
    type: "dialogue",
    bg: ASSET("1"),
    speaker: "도윤",
    lines: [
      "안쪽의 까칠한 선생님 대신 저를 찾아오셨네요. 탁월한 선택입니다.",
      "상처만 후벼 파는 무서운 말보다는, 제 논리적이고 예쁜 해답을 듣는 게 손님께도 훨씬 어울리니까요. 이쪽으로 오시겠어요?",
    ],
  },
  {
    type: "aside",
    bg: ASSET("2"),
    speaker: "강연우",
    lines: ["하-….", "굳이 살풀이 대신 저놈의 말장난에 넘어가겠다?"],
  },
  {
    type: "dialogue",
    bg: ASSET("3"),
    speaker: "도윤",
    lines: [
      "저쪽 선생님의 거친 협박은 잊고 이제 긴장 푸세요.",
      "따뜻한 차 한 잔 드시면서 천천히 시작하죠. 손님의 그 꼬인 연애 패턴을, 제 데이터 리포트가 어떻게 재설계해 드릴지.",
    ],
  },
  {
    type: "dialogue",
    bg: ASSET("4"),
    speaker: "도윤",
    lines: [
      "미세하게 떨리는 눈매, 방어적으로 굳어있는 어깨…",
      "제 통계와 심리 분석이 맞다면, 지금 꽤 피곤한 연애 문제로 스트레스를 받고 계시군요?",
    ],
  },
  {
    type: "dialogue-closeup",
    bg: ASSET("5"),
    speaker: "도윤",
    lines: ["손님의 예쁜 마음에 자꾸만 스크래치를 내는 그가 누군지, 제게만 살짝 말씀해 주시겠어요?"],
  },
  { type: "tablet-handoff", bg: ASSET("6") },
  {
    type: "dialogue",
    bg: ASSET("7"),
    speaker: "도윤",
    lines: [
      "손님 탓이 아닙니다. 애초에 맞물릴 수 없는 톱니바퀴를 억지로 끼워 맞춘 통계적 오류일 뿐이에요.",
      "제가 손님만의 완벽한 '운명 알고리즘'을 분석해 드릴게요. 귀신이나 저주 같은 미신 말고, 확실한 명리학적 통계 데이터를 위해 생년월일을 알려주시겠어요?",
    ],
  },
  { type: "info-form", bg: ASSET("8") },
  { type: "survey", step: 1 },
  { type: "survey", step: 2 },
  { type: "survey", step: 3 },
  {
    type: "final-leanin",
    bg: ASSET("13"),
    bgZoomed: ASSET("13-zoom"),
    speaker: "도윤",
    lines: [
      "좋습니다. 나쁜 사주라는 건 없어요. 나쁜 선택을 하도록 유도하는 변수만 있을 뿐이죠.",
      "제가 그 변수를 완벽하게 통제해 드릴 테니, 지금부터 제가 짚어드리는 해답에만 집중하세요. 딴눈 팔지 말고.",
    ],
  },
];
