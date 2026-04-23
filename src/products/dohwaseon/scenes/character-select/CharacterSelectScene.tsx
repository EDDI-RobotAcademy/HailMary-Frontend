"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Side = "left" | "right" | null;
type Phase = "selecting" | "confirming";

const CHARACTER_INFO = {
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

type CharKey = keyof typeof CHARACTER_INFO;

export default function CharacterSelectScene() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Side>(null);
  const [selected, setSelected] = useState<Side>(null);
  const [phase, setPhase] = useState<Phase>("selecting");
  const [fading, setFading] = useState(false);

  const selectedKey: CharKey | null =
    selected === "left" ? "yeonwoo" : selected === "right" ? "doyoon" : null;
  const selectedInfo = selectedKey ? CHARACTER_INFO[selectedKey] : null;

  const getLeftClip = () => {
    if (selected === "left") return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
    if (selected === "right") return "polygon(0 0, 0 0, 0 100%, 0 100%)";
    if (hovered === "left") return "polygon(0 0, 100% 0, 35% 100%, 0 100%)";
    return "polygon(0 0, 0 0, 0 100%, 0 100%)";
  };

  const getRightClip = () => {
    if (selected === "right")
      return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
    if (selected === "left")
      return "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
    if (hovered === "right")
      return "polygon(65% 0, 100% 0, 100% 100%, 0 100%)";
    return "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
  };

  const handleSelect = useCallback(
    (side: Side) => {
      if (selected || !side) return;
      setSelected(side);
      setTimeout(() => setPhase("confirming"), 900);
    },
    [selected],
  );

  const handleHover = useCallback(
    (side: Side) => {
      if (selected) return;
      setHovered(side);
    },
    [selected],
  );

  const handleLeave = useCallback(() => {
    if (selected) return;
    setHovered(null);
  }, [selected]);

  const handleConfirm = useCallback(() => {
    if (!selectedKey) return;
    localStorage.setItem("selectedCharacter", selectedKey);
    setFading(true);
    setTimeout(() => {
      router.push(`/saju/${selectedKey}`);
    }, 600);
  }, [selectedKey, router]);

  const handleCancel = useCallback(() => {
    setPhase("selecting");
    setSelected(null);
    setHovered(null);
  }, []);

  const handleTouchStart = useCallback(
    (side: "left" | "right") => {
      if (selected) return;
      setHovered(side);
    },
    [selected],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const isLeft = i < 12;
        return {
          id: i,
          left: isLeft ? Math.random() * 45 : 55 + Math.random() * 45,
          size: Math.random() * 3 + 1,
          color: isLeft
            ? `rgba(255, ${150 + Math.random() * 80}, ${50 + Math.random() * 60}, 0.7)`
            : `rgba(255, ${200 + Math.random() * 40}, ${130 + Math.random() * 60}, 0.7)`,
          duration: 5 + Math.random() * 7,
          delay: Math.random() * 10,
        };
      }),
    [],
  );

  return (
    <div className="relative flex flex-1 flex-col">
      <style jsx global>{`
        .char-side {
          transition:
            clip-path 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            filter 0.6s ease,
            transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            opacity 0.9s ease;
          will-change: clip-path, filter, transform;
        }
        .char-side.char-selected {
          transition:
            clip-path 0.9s cubic-bezier(0.4, 0, 0.2, 1),
            filter 0.9s ease,
            opacity 0.9s ease,
            transform 0.9s ease;
        }
        @keyframes particle-float {
          0% {
            opacity: 0;
            transform: translateY(100%) scale(0);
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
            transform: translateY(-100vh) scale(1);
          }
        }
        .char-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: particle-float linear infinite;
          bottom: -10px;
        }
        .char-name-transition {
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .char-select-btn {
          transition: opacity 0.4s ease, transform 0.4s ease,
            background 0.3s ease, box-shadow 0.3s ease;
        }
      `}</style>

      <div className="absolute inset-0 z-30">
        <AnimatePresence mode="wait">
          {phase === "selecting" ? (
            <motion.div
              key="selecting"
              className="relative h-full w-full overflow-hidden bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Base: 합성 이미지 */}
              <div
                className={`char-side absolute inset-0 ${selected ? "char-selected" : ""}`}
                style={{
                  zIndex: 1,
                  filter:
                    hovered === "left" || hovered === "right"
                      ? "brightness(0.4) saturate(0.4)"
                      : "none",
                  opacity: selected ? 0 : 1,
                }}
              >
                <Image
                  src="/select-base.webp"
                  alt="선택"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Overlay: 연우 */}
              <div
                className={`char-side pointer-events-none absolute inset-0 ${selected ? "char-selected" : ""}`}
                style={{
                  clipPath: getLeftClip(),
                  zIndex: 2,
                  transformOrigin: "30% 30%",
                  transform:
                    hovered === "left" && !selected
                      ? "scale(1.05)"
                      : selected === "left"
                        ? "scale(1.08)"
                        : "scale(1)",
                  filter:
                    selected === "left"
                      ? "brightness(1.05)"
                      : hovered === "left"
                        ? "brightness(1.1) contrast(1.05) saturate(1.15)"
                        : "none",
                  opacity: selected === "right" ? 0 : 1,
                }}
              >
                <Image
                  src={CHARACTER_INFO.yeonwoo.selectImage}
                  alt="연우"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlay: 도윤 */}
              <div
                className={`char-side pointer-events-none absolute inset-0 ${selected ? "char-selected" : ""}`}
                style={{
                  clipPath: getRightClip(),
                  zIndex: 2,
                  transformOrigin: "70% 60%",
                  transform:
                    hovered === "right" && !selected
                      ? "scale(1.05)"
                      : selected === "right"
                        ? "scale(1.08)"
                        : "scale(1)",
                  filter:
                    selected === "right"
                      ? "brightness(1.05)"
                      : hovered === "right"
                        ? "brightness(1.1) contrast(1.05) saturate(1.15)"
                        : "none",
                  opacity: selected === "left" ? 0 : 1,
                }}
              >
                <Image
                  src={CHARACTER_INFO.doyoon.selectImage}
                  alt="도윤"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>

              {/* Glow: 연우 */}
              <div
                className="char-side pointer-events-none absolute inset-0"
                style={{
                  zIndex: 3,
                  background:
                    "radial-gradient(ellipse at 30% 40%, rgba(255,150,50,0.25) 0%, rgba(255,100,30,0.08) 40%, transparent 70%)",
                  opacity: hovered === "left" && !selected ? 1 : 0,
                  mixBlendMode: "screen",
                }}
              />

              {/* Glow: 도윤 */}
              <div
                className="char-side pointer-events-none absolute inset-0"
                style={{
                  zIndex: 3,
                  background:
                    "radial-gradient(ellipse at 70% 55%, rgba(255,230,150,0.25) 0%, rgba(255,210,130,0.08) 40%, transparent 70%)",
                  opacity: hovered === "right" && !selected ? 1 : 0,
                  mixBlendMode: "screen",
                }}
              />

              {/* Edge glow */}
              <div
                className="char-side pointer-events-none absolute inset-0"
                style={{
                  zIndex: 4,
                  opacity: hovered && !selected ? 1 : 0,
                  background:
                    hovered === "left"
                      ? "linear-gradient(to left, rgba(255,160,60,0.3) 0%, transparent 8%)"
                      : hovered === "right"
                        ? "linear-gradient(to right, rgba(255,220,140,0.3) 0%, transparent 8%)"
                        : "none",
                }}
              />

              {/* Particles */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ zIndex: 8 }}
              >
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="char-particle"
                    style={{
                      left: `${p.left}%`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      background: p.color,
                      animationDuration: `${p.duration}s`,
                      animationDelay: `${p.delay}s`,
                    }}
                  />
                ))}
              </div>

              {/* Vignette */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  zIndex: 9,
                  boxShadow: "inset 0 0 120px rgba(0,0,0,0.75)",
                }}
              />

              {/* Title */}
              <div
                className="pointer-events-none absolute top-[29px] w-full text-center transition-opacity duration-500"
                style={{ zIndex: 20, opacity: hovered ? 0 : 1 }}
              >
                <p
                  className="mb-2 font-bold"
                  style={{
                    fontSize: "26px",
                    color: "rgba(255,230,180,0.95)",
                    letterSpacing: "14px",
                    textShadow:
                      "0 2px 18px rgba(0,0,0,0.95), 0 0 25px rgba(255,200,100,0.35)",
                  }}
                >
                  桃 花 線
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.75)",
                    letterSpacing: "8px",
                    textShadow: "0 1px 12px rgba(0,0,0,0.95)",
                  }}
                >
                  상 담 사 를 &nbsp; 선 택 하 세 요
                </p>
              </div>

              {/* Name: 연우 */}
              <div
                className="char-name-transition pointer-events-none absolute"
                style={{
                  zIndex: 20,
                  top: "88px",
                  left: "32px",
                  opacity: hovered === "left" && !selected ? 1 : 0,
                  transform:
                    hovered === "left" && !selected
                      ? "translateX(0)"
                      : "translateX(-20px)",
                }}
              >
                <h2
                  className="font-black"
                  style={{
                    fontSize: "34px",
                    letterSpacing: "8px",
                    marginBottom: "10px",
                    color: "#ffd4a8",
                    textShadow:
                      "0 0 30px rgba(255,150,50,0.8), 2px 2px 12px rgba(0,0,0,0.95)",
                  }}
                >
                  강 연 우
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    letterSpacing: "3px",
                    color: "#eec89a",
                    opacity: 0.85,
                    textShadow: "1px 1px 8px rgba(0,0,0,0.95)",
                  }}
                >
                  전통 &middot; 직관 &middot; 영적 해석
                </p>
              </div>

              {/* Name: 도윤 */}
              <div
                className="char-name-transition pointer-events-none absolute"
                style={{
                  zIndex: 20,
                  bottom: "100px",
                  right: "32px",
                  textAlign: "right",
                  opacity: hovered === "right" && !selected ? 1 : 0,
                  transform:
                    hovered === "right" && !selected
                      ? "translateX(0)"
                      : "translateX(20px)",
                }}
              >
                <h2
                  className="font-black"
                  style={{
                    fontSize: "34px",
                    letterSpacing: "8px",
                    marginBottom: "10px",
                    color: "#fff5d6",
                    textShadow:
                      "0 0 30px rgba(255,230,150,0.8), 2px 2px 12px rgba(0,0,0,0.95)",
                  }}
                >
                  한 도 윤
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    letterSpacing: "3px",
                    color: "#e8d8a8",
                    opacity: 0.85,
                    textShadow: "1px 1px 8px rgba(0,0,0,0.95)",
                  }}
                >
                  현대 &middot; 분석 &middot; 데이터 해석
                </p>
              </div>

              {/* Hover zones (버튼 포함) */}
              {!selected && (
                <>
                  <div
                    className="absolute left-0 top-0 h-full cursor-pointer"
                    style={{ width: "50%", zIndex: 15 }}
                    onMouseEnter={() => handleHover("left")}
                    onMouseLeave={handleLeave}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleTouchStart("left");
                    }}
                  >
                    <button
                      className="char-select-btn absolute cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect("left");
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        handleSelect("left");
                      }}
                      style={{
                        zIndex: 20,
                        top: "185px",
                        left: "32px",
                        padding: "12px 36px",
                        borderRadius: "8px",
                        border: "1.5px solid rgba(255,180,100,0.65)",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)",
                        fontSize: "14px",
                        letterSpacing: "5px",
                        color: "#ffd4a8",
                        fontWeight: 500,
                        opacity: hovered === "left" ? 1 : 0,
                        pointerEvents: hovered === "left" ? "auto" : "none",
                        transform:
                          hovered === "left"
                            ? "translateY(0)"
                            : "translateY(10px)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,150,50,0.3)";
                        e.currentTarget.style.boxShadow =
                          "0 0 25px rgba(255,150,50,0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      선 택
                    </button>
                  </div>
                  <div
                    className="absolute right-0 top-0 h-full cursor-pointer"
                    style={{ width: "50%", zIndex: 15 }}
                    onMouseEnter={() => handleHover("right")}
                    onMouseLeave={handleLeave}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleTouchStart("right");
                    }}
                  >
                    <button
                      className="char-select-btn absolute cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect("right");
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        handleSelect("right");
                      }}
                      style={{
                        zIndex: 20,
                        bottom: "40px",
                        right: "32px",
                        padding: "12px 36px",
                        borderRadius: "8px",
                        border: "1.5px solid rgba(255,220,140,0.65)",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)",
                        fontSize: "14px",
                        letterSpacing: "5px",
                        color: "#fff5d6",
                        fontWeight: 500,
                        opacity: hovered === "right" ? 1 : 0,
                        pointerEvents: hovered === "right" ? "auto" : "none",
                        transform:
                          hovered === "right"
                            ? "translateY(0)"
                            : "translateY(10px)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,210,130,0.3)";
                        e.currentTarget.style.boxShadow =
                          "0 0 25px rgba(255,210,130,0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      선 택
                    </button>
                  </div>
                </>
              )}

              {/* Selected transition message */}
              <div
                className="pointer-events-none absolute w-full text-center"
                style={{
                  bottom: "70px",
                  zIndex: 25,
                  opacity: selected ? 1 : 0,
                  transition: "opacity 0.7s ease 0.3s",
                }}
              >
                <h3
                  className="font-bold text-white"
                  style={{
                    fontSize: "28px",
                    letterSpacing: "8px",
                    marginBottom: "12px",
                    textShadow:
                      "0 2px 25px rgba(0,0,0,0.9), 0 0 18px rgba(255,220,150,0.4)",
                  }}
                >
                  {selected === "left"
                    ? "강 연 우"
                    : selected === "right"
                      ? "한 도 윤"
                      : ""}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.7)",
                    letterSpacing: "3px",
                  }}
                >
                  당신의 사주를 풀어드리겠습니다
                </p>
              </div>
            </motion.div>
          ) : (
            /* ===== Confirming Phase ===== */
            <motion.div
              key="confirming"
              className="relative h-full w-full overflow-hidden bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {selectedInfo && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Image
                    src={selectedInfo.confirmImage}
                    alt={selectedInfo.fullName}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                </motion.div>
              )}

              {/* Vignette */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  zIndex: 5,
                  boxShadow: "inset 0 0 150px rgba(0,0,0,0.7)",
                }}
              />

              {/* Character info */}
              {selectedInfo && (
                <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-8">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <h2
                      className="mb-1 font-black"
                      style={{
                        fontSize: "36px",
                        letterSpacing: "10px",
                        color: selectedInfo.nameColor,
                        textShadow: `0 0 30px ${selectedInfo.accentColor}, 2px 2px 12px rgba(0,0,0,0.95)`,
                      }}
                    >
                      {selectedInfo.fullName}
                    </h2>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "15px",
                        letterSpacing: "4px",
                        color: selectedInfo.nameColor,
                        opacity: 0.9,
                        textShadow: "1px 1px 8px rgba(0,0,0,0.95)",
                      }}
                    >
                      {selectedInfo.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        letterSpacing: "2px",
                        color: "rgba(255,255,255,0.5)",
                        textShadow: "1px 1px 6px rgba(0,0,0,0.95)",
                      }}
                    >
                      {selectedInfo.subtitle}
                    </p>
                  </motion.div>

                  {/* Quote */}
                  <motion.div
                    className="mt-5 rounded-lg p-4"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(10px)",
                      borderLeft: `3px solid ${selectedInfo.borderColor}`,
                    }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <p
                      className="text-sm italic leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      &ldquo;{selectedInfo.quote}&rdquo;
                    </p>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    className="mt-6 flex gap-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <button
                      className="flex-1 cursor-pointer rounded-lg py-3.5 text-sm font-medium tracking-widest transition-all duration-300"
                      style={{
                        border: "1.5px solid rgba(255,255,255,0.2)",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)",
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "4px",
                      }}
                      onClick={handleCancel}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.1)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.4)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.2)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      }}
                    >
                      취소
                    </button>
                    <button
                      className="flex-[2] cursor-pointer rounded-lg py-3.5 text-sm font-bold tracking-widest transition-all duration-300"
                      style={{
                        border: `1.5px solid ${selectedInfo.borderColor}`,
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)",
                        color: selectedInfo.nameColor,
                        letterSpacing: "6px",
                      }}
                      onClick={handleConfirm}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${selectedInfo.glowColor}`;
                        e.currentTarget.style.boxShadow = `0 0 30px ${selectedInfo.glowColor}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      결정
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 페이드 투 블랙 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0 z-40 bg-black"
        style={{
          opacity: fading ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
    </div>
  );
}
