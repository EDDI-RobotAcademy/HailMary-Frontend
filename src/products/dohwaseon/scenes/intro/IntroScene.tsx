"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* ── 씬 데이터 ── */
type CutStep =
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

const STEPS: CutStep[] = [
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
  // 선택 전 플래시 시퀀스 (이후 /select 로 라우팅)
  {
    type: "flash-sequence",
    images: [
      { src: "/flash-yeonwoo.png", duration: 1000 },
      { src: "/flash-doyoon.png", duration: 1000 },
      { src: "/flash-both.png", duration: 1000 },
    ],
  },
];

const CHAR_DELAY = 35;

// 이전 스텝과 "이어지는 장면"으로 처리할 스텝 인덱스 — 블랙 페이드 대신 크로스페이드 진입
const CROSSFADE_ENTER_STEPS = new Set<number>([4, 9, 12, 15, 16]);

// 이 스텝에서 나갈 때 더 느린 페이드 아웃(1200ms)으로 감정 여운 주는 컷
const FADEOUT_EXIT_STEPS = new Set<number>([12]);

const IS_DEV = process.env.NODE_ENV !== "production";

/* ── 효과음 재생 헬퍼 ── */
function playSfx(src: string, muted: boolean) {
  if (muted) return;
  const sfx = new Audio(src);
  sfx.volume = 0.7;
  sfx.play().catch(() => {});
}

export default function IntroScene() {
  const router = useRouter();
  const [started, setStarted] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showSoundHint, setShowSoundHint] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fading, setFading] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);

  // phone 스텝 전용 상태
  const [visibleNotifs, setVisibleNotifs] = useState<number>(0);
  const [phonePhase, setPhonePhase] = useState<
    "animating" | "dialogue"
  >("animating");

  // flash-sequence 전용 상태
  const [flashSeqIndex, setFlashSeqIndex] = useState(0);
  const [flashSeqWhite, setFlashSeqWhite] = useState(false);

  // 이어지는 장면으로 진입할 때 사용하는 크로스페이드 상태
  const [crossFading, setCrossFading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // goToStep 내부에서 stale closure 없이 현재 stepIndex 접근하기 위한 ref
  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;

  const step = STEPS[stepIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 사운드 안내 3초 후 사라짐
  useEffect(() => {
    const t = setTimeout(() => setShowSoundHint(false), 10000);
    return () => clearTimeout(t);
  }, []);

  // BGM 초기화
  useEffect(() => {
    const audio = new Audio("/intro-bgm.m4a");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 타이핑 효과 — dialogue / sfx-dialogue / dramatic-dialogue / phone(dialogue phase)
  const hasDialogue =
    step.type === "dialogue" ||
    step.type === "sfx-dialogue" ||
    step.type === "dramatic-dialogue" ||
    (step.type === "phone" && phonePhase === "dialogue");

  const fullText = hasDialogue
    ? (step as { lines: string[] }).lines[lineIndex] ?? ""
    : "";

  useEffect(() => {
    if (!started || !hasDialogue) return;
    if (displayedCount < fullText.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedCount((c) => c + 1);
      }, CHAR_DELAY);
    } else {
      setIsComplete(true);
    }
    return clearTimer;
  }, [displayedCount, fullText, clearTimer, started, hasDialogue]);

  // 컷5(복도, stepIndex 7)부터 BGM 정지
  useEffect(() => {
    if (stepIndex >= 7 && audioRef.current) {
      audioRef.current.pause();
    }
  }, [stepIndex]);

  // sfx-dialogue: 스텝 진입 시 효과음 재생
  useEffect(() => {
    if (!started) return;
    if (step.type === "sfx-dialogue") {
      playSfx(step.sfx, muted);
    }
  }, [stepIndex, started, step.type, muted]);

  // phone: 진입 시 상태 리셋 (이후 진행은 탭으로)
  useEffect(() => {
    if (!started || step.type !== "phone") return;
    setVisibleNotifs(0);
    setPhonePhase("animating");
  }, [stepIndex, started, step.type]);

  // dramatic-dialogue: 화이트 플래시 + 효과음
  useEffect(() => {
    if (!started || step.type !== "dramatic-dialogue") return;
    setFlashWhite(true);
    if (step.sfx) {
      playSfx(step.sfx, muted);
    }
    const t = setTimeout(() => setFlashWhite(false), 300);
    return () => clearTimeout(t);
  }, [stepIndex, started, step.type, muted]);

  // 페이드 전환으로 다음 스텝 이동
  const goToStep = useCallback((next: number) => {
    const nextStep = STEPS[next];
    // 이어지는 장면: 크로스페이드 진입
    if (CROSSFADE_ENTER_STEPS.has(next)) {
      videoRef.current?.pause();
      setCrossFading(true);
      setTimeout(() => {
        setStepIndex(next);
        setLineIndex(0);
        setDisplayedCount(0);
        setIsComplete(false);
        setCrossFading(false);
      }, 400);
      return;
    }
    // 즉시 전환 타입들
    if (
      nextStep?.type === "video" ||
      nextStep?.type === "button" ||
      nextStep?.type === "door" ||
      nextStep?.type === "flash-sequence"
    ) {
      setStepIndex(next);
      setLineIndex(0);
      setDisplayedCount(0);
      setIsComplete(false);
      return;
    }
    // sfx-dialogue는 같은 배경이므로 페이드 없이
    if (nextStep?.type === "sfx-dialogue") {
      setStepIndex(next);
      setLineIndex(0);
      setDisplayedCount(0);
      setIsComplete(false);
      return;
    }
    // dramatic-dialogue는 플래시로 전환
    if (nextStep?.type === "dramatic-dialogue") {
      setStepIndex(next);
      setLineIndex(0);
      setDisplayedCount(0);
      setIsComplete(false);
      return;
    }
    // 감정 여운용 긴 페이드 아웃
    const duration = FADEOUT_EXIT_STEPS.has(stepIndexRef.current) ? 1200 : 300;
    // 기본: 페이드 투 블랙
    setFading(true);
    setTimeout(() => {
      setStepIndex(next);
      setLineIndex(0);
      setDisplayedCount(0);
      setIsComplete(false);
      setFading(false);
    }, duration);
  }, []);

  // flash-sequence: 자동 이미지 시퀀스
  useEffect(() => {
    if (!started || step.type !== "flash-sequence") return;
    setFlashSeqIndex(0);
    setFlashSeqWhite(true);

    const images = step.images;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    images.forEach((img, i) => {
      timers.push(
        setTimeout(() => {
          setFlashSeqWhite(true);
          setFlashSeqIndex(i);
        }, elapsed),
      );
      timers.push(
        setTimeout(() => {
          setFlashSeqWhite(false);
        }, elapsed + 200),
      );
      elapsed += img.duration;
    });

    timers.push(
      setTimeout(() => {
        router.push("/select");
      }, elapsed),
    );

    return () => timers.forEach(clearTimeout);
  }, [stepIndex, started, step.type, router]);

  // 사운드 활성화 (첫 탭 시)
  const enableSound = () => {
    if (!muted) return;
    setMuted(false);
    setShowSoundHint(false);
    const audio = audioRef.current;
    if (audio && stepIndex < 7) {
      audio.muted = false;
      audio.play().catch(() => {});
    }
  };

  // 스피커 토글
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.muted = false;
      // BGM은 내부 복도(stepIndex 7) 이전에서만 재생
      if (stepIndex < 7) {
        audio.play().catch(() => {});
      }
    } else {
      audio.muted = true;
    }
    setMuted(!muted);
  };

  // 대사 탭
  const handleTap = () => {
    // 크로스페이드 중에는 중복 전환 방지
    if (crossFading) return;

    // 첫 탭 시 사운드 활성화
    if (muted) {
      enableSound();
    }

    // phone animating 중 탭 → 알림 한 개씩 노출, 다 보이면 대사 단계로
    if (step.type === "phone" && phonePhase === "animating") {
      const total = step.notifications.length;
      if (visibleNotifs < total) {
        playSfx(step.sfx, muted);
        setVisibleNotifs(visibleNotifs + 1);
      } else {
        setPhonePhase("dialogue");
      }
      return;
    }

    if (!hasDialogue) return;

    const lines = (step as { lines: string[] }).lines;

    if (!isComplete) {
      clearTimer();
      setDisplayedCount(fullText.length);
      setIsComplete(true);
    } else if (lineIndex < lines.length - 1) {
      setLineIndex(lineIndex + 1);
      setDisplayedCount(0);
      setIsComplete(false);
    } else {
      goToStep(stepIndex + 1);
    }
  };

  // 비디오 종료 — 다음 스텝이 CROSSFADE_ENTER_STEPS에 있으면 크로스페이드
  const handleVideoEnd = () => {
    goToStep(stepIndex + 1);
  };

  // 문 클릭
  const handleDoorClick = () => {
    goToStep(stepIndex + 1);
  };

  // 개발용 씬 점프 — 전환 효과 없이 바로 이동, 주요 상태 리셋
  const jumpToStep = (delta: -1 | 1) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = Math.max(0, Math.min(STEPS.length - 1, stepIndex + delta));
    if (next === stepIndex) return;
    clearTimer();
    setStepIndex(next);
    setLineIndex(0);
    setDisplayedCount(0);
    setIsComplete(false);
    setFading(false);
    setCrossFading(false);
    setFlashWhite(false);
    setVisibleNotifs(0);
    setPhonePhase("animating");
    setFlashSeqIndex(0);
    setFlashSeqWhite(false);
  };

  /* ── 배경 이미지 결정 ── */
  const bgImage = (() => {
    if ("bg" in step) return (step as { bg: string }).bg;
    if (step.type === "button") {
      const prev = STEPS[stepIndex - 1];
      return prev && "bg" in prev ? (prev as { bg: string }).bg : "";
    }
    return "";
  })();

  /* ── 대사 표시 여부 ── */
  const showDialogue =
    started &&
    !fading &&
    !crossFading &&
    (step.type === "dialogue" ||
      step.type === "sfx-dialogue" ||
      step.type === "dramatic-dialogue" ||
      (step.type === "phone" && phonePhase === "dialogue"));

  return (
    <div
      className="relative flex flex-1 flex-col animate-[fadeIn_0.8s_ease-in]"
      onClick={handleTap}
    >
      {/* 배경 이미지 */}
      {step.type !== "video" && bgImage && (
        <Image
          src={bgImage}
          alt=""
          fill
          priority
          className="object-cover object-center"
          style={{
            opacity: fading ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        />
      )}

      {/* 비디오 */}
      {step.type === "video" && (
        <video
          ref={videoRef}
          src={step.src}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          playsInline
          muted={muted}
          onEnded={handleVideoEnd}
        />
      )}

      {/* 이어지는 장면 크로스페이드 — 다음 스텝의 배경을 위에 올리며 페이드인 */}
      {crossFading && (() => {
        const nextStep = STEPS[stepIndex + 1];
        if (!nextStep || !("bg" in nextStep)) return null;
        return (
          <Image
            src={(nextStep as { bg: string }).bg}
            alt=""
            fill
            priority
            className="absolute inset-0 object-cover object-center animate-[fadeIn_0.4s_ease-out]"
          />
        );
      })()}

      {/* 개발용 씬 네비 */}
      {IS_DEV && (
        <div className="absolute left-3 top-3 z-50 flex items-center gap-1.5">
          <button
            onClick={jumpToStep(-1)}
            disabled={stepIndex === 0}
            className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur-md transition-opacity active:opacity-80 disabled:opacity-25"
          >
            이전
          </button>
          <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] tabular-nums text-white backdrop-blur-md">
            {stepIndex + 1} / {STEPS.length}
          </span>
          <button
            onClick={jumpToStep(1)}
            disabled={stepIndex === STEPS.length - 1}
            className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur-md transition-opacity active:opacity-80 disabled:opacity-25"
          >
            다음
          </button>
        </div>
      )}

      {/* 사운드 안내 메시지 */}
      {showSoundHint && muted && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/70 to-transparent px-6 pb-16 pt-[100px] text-center">
          <p className="animate-pulse text-base font-medium text-white">
            소리를 재생하시려면 화면을 눌러주세요
          </p>
        </div>
      )}

      {/* 핸드폰 알림 팝업 — 새 알림이 위로, 기존 알림은 뒤로 밀려 그림자처럼 */}
      {started && step.type === "phone" && !fading && (
        <div className="pointer-events-none absolute inset-0 z-30">
          {step.notifications.map((src, i) => {
            const isVisible = i < visibleNotifs;
            const depth = Math.max(0, visibleNotifs - 1 - i);
            const yOffset = depth * 14;
            const scale = 1 - depth * 0.05;
            const opacity = isVisible ? Math.max(0.35, 1 - depth * 0.45) : 0;
            return (
              <div
                key={src}
                className="absolute left-1/2 w-[92%]"
                style={{
                  top: "38%",
                  zIndex: 50 - depth,
                  opacity,
                  transform: isVisible
                    ? `translate(-50%, ${yOffset}px) scale(${scale})`
                    : `translate(-50%, 0) scale(0.94)`,
                  transition:
                    "opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <Image
                  src={src}
                  alt="알림"
                  width={400}
                  height={80}
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 대사 박스 */}
      {showDialogue && (
        <div className="relative z-10 mb-20 mt-auto px-4">
          <div className="mb-2 flex justify-end">
            <button
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/40 backdrop-blur-md transition-colors active:bg-white/60"
            >
              <span className="text-lg">{muted ? "🔇" : "🔊"}</span>
            </button>
          </div>
          {/* 이름 라벨 */}
          {(() => {
            const s = step as { speaker?: string };
            const name = s.speaker ?? "나";
            return (
              <span
                className="ml-1 inline-block rounded-md px-3 py-1 text-[11px] font-semibold tracking-[0.15em]"
                style={{
                  background: "rgba(40,38,34,0.75)",
                  backdropFilter: "blur(10px)",
                  color: "#E6C58E",
                  borderTop: "1px solid rgba(245,237,224,0.12)",
                }}
              >
                {name}
              </span>
            );
          })()}
          <div className="relative h-[126px] overflow-hidden border border-white/30 bg-gray-800/80 backdrop-blur-md">
            {/* 장식 라인 */}
            <div className="pointer-events-none absolute inset-2">
              <Image
                src="/dialogue-deco.png"
                alt=""
                fill
                className="object-fill opacity-40"
              />
            </div>
            <p className="relative flex h-full items-center px-7 py-4 text-[14px] leading-relaxed text-white">
              &ldquo;{fullText.slice(0, displayedCount)}&rdquo;
              {isComplete && (
                <span className="ml-1 inline-block shrink-0 animate-pulse align-middle text-xs">
                  ▼
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      {started && step.type === "button" && !fading && (
        <div className="relative z-10 mb-20 mt-auto px-8">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToStep(stepIndex + 1);
            }}
            className="w-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-orange-500 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-red-900/40 transition-opacity hover:opacity-90 active:opacity-80"
          >
            {step.label}
          </button>
        </div>
      )}

      {/* 문 인터랙션 */}
      {started && step.type === "door" && !fading && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDoorClick();
            }}
            className="absolute left-1/2 top-[72%] z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full animate-[doorGlow_2s_ease-in-out_infinite]"
          />
          <p className="absolute bottom-24 left-0 right-0 z-20 animate-pulse text-center text-base font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
            문을 눌러 안으로 입장합니다
          </p>
        </>
      )}

      {/* 플래시 시퀀스 */}
      {started && step.type === "flash-sequence" && (
        <div className="absolute inset-0 z-20 bg-black">
          <Image
            src={step.images[flashSeqIndex].src}
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-white"
            style={{
              opacity: flashSeqWhite ? 1 : 0,
              transition: "opacity 0.2s ease-out",
            }}
          />
        </div>
      )}

      {/* 페이드 투 블랙 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0 z-40 bg-black"
        style={{
          opacity: fading ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      />

      {/* 화이트 플래시 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0 z-40 bg-white"
        style={{
          opacity: flashWhite ? 1 : 0,
          transition: "opacity 0.15s ease-out",
        }}
      />
    </div>
  );
}
