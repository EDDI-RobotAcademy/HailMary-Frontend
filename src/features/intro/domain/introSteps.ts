export type CutStep =
  | { type: "dialogue"; bg: string; speaker?: string; lines: string[] }
  | { type: "sfx-dialogue"; bg: string; sfx: string; speaker?: string; lines: string[] }
  | {
      type: "phone";
      bg: string;
      sfx: string;
      notifications: string[];
      speaker?: string;
      lines: string[];
    }
  | { type: "dramatic-dialogue"; bg: string; sfx?: string; speaker?: string; lines: string[] }
  | { type: "button"; label: string }
  | { type: "video"; src: string }
  | { type: "door"; bg: string }
  | { type: "flash-sequence"; images: { src: string; duration: number }[] };

export const STEPS: CutStep[] = [
  // 컷1: 골목길
  {
    type: "dialogue",
    bg: "/intro-1.jpeg",
    lines: [
      "하루가 또 그렇게, 붉게 저물어갔다. 지독한 연애 실패 끝에, 지친 몸과 마음으로 도망치듯 들어온 낯선 골목.",
      "분명 처음 보는 골목인데, 왜 이렇게 이끌릴까. 누군가 보이지 않는 끈으로 내 옷깃을 안쪽으로, 자꾸만 안쪽으로 잡아당기는 것만 같다.",
    ],
  },
  // 컷2: 한옥 골목
  {
    type: "dialogue",
    bg: "/intro-2.png",
    lines: [
      "하... 내 연애는 왜 항상 이 모양일까. 답답해서 무작정 걷다 보니 처음 보는 골목까지 와버렸네…",
      "저 붉은 등불은 뭐지?",
    ],
  },
  { type: "button", label: "붉은 등불로 향한다" },
  // 영상
  { type: "video", src: "/intro-enter.mp4" },
  // 컷3: 문 확대
  {
    type: "dialogue",
    bg: "/intro-3.png",
    lines: [
      "홀린 듯이 걸어오긴 했는데... 도화선? 점집인가?",
      "평소 같으면 절대 안 쳐다볼 텐데... 이상하게 오늘따라 누군가 내 옷깃을 안으로 잡아끄는 것 같은 기분이 들어.",
    ],
  },
  // 문 인터랙션
  { type: "door", bg: "/intro-3.png" },
  // 컷4: 내부
  {
    type: "dialogue",
    bg: "/intro-4.png",
    lines: [
      "이상해. 분명 처음 온 곳인데, 꼭 보이지 않는 끈에 목줄이 묶여서 여기까지 끌려온 것 같아.",
    ],
  },
  // 컷5: 복도
  {
    type: "dialogue",
    bg: "/intro-5.png",
    lines: [
      "저기요? 아무도 안계신가요?",
      "아무도 안 계신가..? 그냥 돌아가야겠다.",
    ],
  },
  // 효과음 + 대사
  {
    type: "sfx-dialogue",
    bg: "/intro-5.png",
    sfx: "/vibrate.mp3",
    lines: ["하… 또 시작이네…"],
  },
  // 핸드폰 장면
  {
    type: "phone",
    bg: "/intro-6.png",
    sfx: "/vibrate.mp3",
    notifications: ["/notif-1.png", "/notif-2.png"],
    lines: ["어떻게 해야하지.."],
  },
  // 극적 전환 + 핸드폰 뺏김
  {
    type: "dramatic-dialogue",
    bg: "/intro-7.png",
    lines: ["어...? 내 핸드폰을... 누구지?"],
  },
  // 컷: 캐릭터 등장 (핸드폰 들고) — 극적 전환
  {
    type: "dramatic-dialogue",
    bg: "/intro-8.png",
    speaker: "강연우",
    lines: [
      "하... 너 눈은 장식이야?",
      "사주에 도화(桃花)가 꼈으면 뭐 해.",
    ],
  },
  // 컷: 캐릭터 클로즈업
  {
    type: "dialogue",
    bg: "/intro-9.png",
    speaker: "강연우",
    lines: [
      "꼬이는 새끼들이 다 네 기운 파먹는 거머리들인데. 미련 갖지 말고 당장 차단해.",
    ],
  },
  // 컷: 팔목 잡기 — 극적 전환 + 효과음
  {
    type: "dramatic-dialogue",
    bg: "/intro-10.png",
    sfx: "/grab-wrist.m4a",
    speaker: "???",
    lines: ["거기까지 해, 연우야."],
  },
  // 컷: 한도윤 등장 (핸드폰 들고)
  {
    type: "dialogue",
    bg: "/intro-11.png",
    speaker: "한도윤",
    lines: [
      "놀라셨죠? 저희 연우가 입이 좀 험해서요.",
      "제가 대신 사과드립니다.",
    ],
  },
  // 컷: 한도윤 클로즈업
  {
    type: "dialogue",
    bg: "/intro-12.png",
    speaker: "한도윤",
    lines: ["사주에 도화(桃花)가 있는 건 사실이지만"],
  },
  // 컷: 한도윤 손짓
  {
    type: "dialogue",
    bg: "/intro-13.png",
    speaker: "한도윤",
    lines: [
      "아프게 살을 찢고 억지로 끊어내는 건 너무 거칠잖아요. 저한테 오세요.",
    ],
  },
  // 컷: 둘이 대치
  {
    type: "dialogue",
    bg: "/intro-14.png",
    lines: [
      "둘은 서로 추호도 양보하지 않겠다는 듯 서로를 마주 보기 시작했다.",
    ],
  },
  // 컷: 강연우 팔짱
  {
    type: "dialogue",
    bg: "/intro-15.png",
    speaker: "강연우",
    lines: [
      "딴 눈 팔지 말고 내 앞에 앉아. 답도 없는 네 연애운, 내가 썩은 줄 다 끊어내고 네 '진짜 붉은 실'만 손에 쥐여줄 테니까.",
    ],
  },
  // 컷: 한도윤 팔짱
  {
    type: "dialogue",
    bg: "/intro-16.png",
    speaker: "한도윤",
    lines: [
      "수만 건의 행동 심리 데이터와 알고리즘으로, 당신의 연애 패턴이 왜 망했는지 '수치'로 증명하고 완벽하게 재설계해 드릴 테니까요.",
    ],
  },
  // 선택 전 플래시 시퀀스
  {
    type: "flash-sequence",
    images: [
      { src: "/flash-yeonwoo.png", duration: 1000 },
      { src: "/flash-doyoon.png", duration: 1000 },
      { src: "/flash-both.png", duration: 1000 },
    ],
  },
];

export const CHAR_DELAY = 35;

// 이전 스텝과 "이어지는 장면"으로 처리할 스텝 인덱스 — 블랙 페이드 대신 크로스페이드 진입
export const CROSSFADE_ENTER_STEPS = new Set<number>([4, 9, 12, 15, 16]);

// 이 스텝에서 나갈 때 더 느린 페이드 아웃(1200ms)으로 감정 여운 주는 컷
export const FADEOUT_EXIT_STEPS = new Set<number>([12]);

export function playSfx(src: string, muted: boolean): void {
  if (muted) return;
  const sfx = new Audio(src);
  sfx.volume = 0.7;
  sfx.play().catch(() => {});
}
