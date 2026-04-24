"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FadeOverlay } from "@/components/FadeOverlay";
import { CHARACTER_INFO } from "../domain/characters";
import { useCharacterSelect } from "../hooks/useCharacterSelect";

export function CharacterSelectScene() {
  const {
    hovered, selected, phase, fading,
    selectedInfo,
    particles,
    getLeftClip, getRightClip,
    handleSelect, handleHover, handleLeave,
    handleConfirm, handleCancel, handleTouchStart,
  } = useCharacterSelect();

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="absolute inset-0 z-30">
        <AnimatePresence mode="wait">
          {phase === "selecting" ? (
            <motion.div
              key="selecting"
              className="relative h-full w-full overflow-hidden bg-black"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Base */}
              <div className={`char-side absolute inset-0 ${selected ? "char-selected" : ""}`}
                style={{ zIndex: 1, filter: hovered ? "brightness(0.4) saturate(0.4)" : "none", opacity: selected ? 0 : 1 }}>
                <Image src="/select-base.webp" alt="선택" fill className="object-cover" priority />
              </div>

              {/* 연우 오버레이 */}
              <div className={`char-side pointer-events-none absolute inset-0 ${selected ? "char-selected" : ""}`}
                style={{ clipPath: getLeftClip(), zIndex: 2, transformOrigin: "30% 30%",
                  transform: hovered === "left" && !selected ? "scale(1.05)" : selected === "left" ? "scale(1.08)" : "scale(1)",
                  filter: selected === "left" ? "brightness(1.05)" : hovered === "left" ? "brightness(1.1) contrast(1.05) saturate(1.15)" : "none",
                  opacity: selected === "right" ? 0 : 1 }}>
                <Image src={CHARACTER_INFO.yeonwoo.selectImage} alt="연우" fill className="object-cover" />
              </div>

              {/* 도윤 오버레이 */}
              <div className={`char-side pointer-events-none absolute inset-0 ${selected ? "char-selected" : ""}`}
                style={{ clipPath: getRightClip(), zIndex: 2, transformOrigin: "70% 60%",
                  transform: hovered === "right" && !selected ? "scale(1.05)" : selected === "right" ? "scale(1.08)" : "scale(1)",
                  filter: selected === "right" ? "brightness(1.05)" : hovered === "right" ? "brightness(1.1) contrast(1.05) saturate(1.15)" : "none",
                  opacity: selected === "left" ? 0 : 1 }}>
                <Image src={CHARACTER_INFO.doyoon.selectImage} alt="도윤" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>

              {/* Glow 연우 */}
              <div className="char-side pointer-events-none absolute inset-0"
                style={{ zIndex: 3, background: "radial-gradient(ellipse at 30% 40%, rgba(255,150,50,0.25) 0%, rgba(255,100,30,0.08) 40%, transparent 70%)",
                  opacity: hovered === "left" && !selected ? 1 : 0, mixBlendMode: "screen" }} />

              {/* Glow 도윤 */}
              <div className="char-side pointer-events-none absolute inset-0"
                style={{ zIndex: 3, background: "radial-gradient(ellipse at 70% 55%, rgba(255,230,150,0.25) 0%, rgba(255,210,130,0.08) 40%, transparent 70%)",
                  opacity: hovered === "right" && !selected ? 1 : 0, mixBlendMode: "screen" }} />

              {/* Edge glow */}
              <div className="char-side pointer-events-none absolute inset-0"
                style={{ zIndex: 4, opacity: hovered && !selected ? 1 : 0,
                  background: hovered === "left"
                    ? "linear-gradient(to left, rgba(255,160,60,0.3) 0%, transparent 8%)"
                    : hovered === "right"
                      ? "linear-gradient(to right, rgba(255,220,140,0.3) 0%, transparent 8%)"
                      : "none" }} />

              {/* Particles */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 8 }}>
                {particles.map((p) => (
                  <div key={p.id} className="char-particle"
                    style={{ left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`,
                      background: p.color, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />
                ))}
              </div>

              {/* Vignette */}
              <div className="pointer-events-none absolute inset-0" style={{ zIndex: 9, boxShadow: "inset 0 0 120px rgba(0,0,0,0.75)" }} />

              {/* Title */}
              <div className="pointer-events-none absolute top-[29px] w-full text-center transition-opacity duration-500"
                style={{ zIndex: 20, opacity: hovered ? 0 : 1 }}>
                <p className="mb-2 font-bold"
                  style={{ fontSize: "26px", color: "rgba(255,230,180,0.95)", letterSpacing: "14px",
                    textShadow: "0 2px 18px rgba(0,0,0,0.95), 0 0 25px rgba(255,200,100,0.35)" }}>
                  桃 花 線
                </p>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", letterSpacing: "8px",
                  textShadow: "0 1px 12px rgba(0,0,0,0.95)" }}>
                  상 담 사 를 &nbsp; 선 택 하 세 요
                </p>
              </div>

              {/* Name: 연우 */}
              <div className="char-name-transition pointer-events-none absolute"
                style={{ zIndex: 20, top: "88px", left: "32px",
                  opacity: hovered === "left" && !selected ? 1 : 0,
                  transform: hovered === "left" && !selected ? "translateX(0)" : "translateX(-20px)" }}>
                <h2 className="font-black"
                  style={{ fontSize: "34px", letterSpacing: "8px", marginBottom: "10px", color: "#ffd4a8",
                    textShadow: "0 0 30px rgba(255,150,50,0.8), 2px 2px 12px rgba(0,0,0,0.95)" }}>
                  강 연 우
                </h2>
                <p style={{ fontSize: "13px", letterSpacing: "3px", color: "#eec89a", opacity: 0.85, textShadow: "1px 1px 8px rgba(0,0,0,0.95)" }}>
                  전통 &middot; 직관 &middot; 영적 해석
                </p>
              </div>

              {/* Name: 도윤 */}
              <div className="char-name-transition pointer-events-none absolute"
                style={{ zIndex: 20, bottom: "100px", right: "32px", textAlign: "right",
                  opacity: hovered === "right" && !selected ? 1 : 0,
                  transform: hovered === "right" && !selected ? "translateX(0)" : "translateX(20px)" }}>
                <h2 className="font-black"
                  style={{ fontSize: "34px", letterSpacing: "8px", marginBottom: "10px", color: "#fff5d6",
                    textShadow: "0 0 30px rgba(255,230,150,0.8), 2px 2px 12px rgba(0,0,0,0.95)" }}>
                  한 도 윤
                </h2>
                <p style={{ fontSize: "13px", letterSpacing: "3px", color: "#e8d8a8", opacity: 0.85, textShadow: "1px 1px 8px rgba(0,0,0,0.95)" }}>
                  현대 &middot; 분석 &middot; 데이터 해석
                </p>
              </div>

              {/* Hover zones */}
              {!selected && (
                <>
                  <div className="absolute left-0 top-0 h-full cursor-pointer" style={{ width: "50%", zIndex: 15 }}
                    onMouseEnter={() => handleHover("left")} onMouseLeave={handleLeave}
                    onTouchStart={(e) => { e.preventDefault(); handleTouchStart("left"); }}>
                    <button className="char-select-btn absolute cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleSelect("left"); }}
                      onTouchStart={(e) => { e.stopPropagation(); handleSelect("left"); }}
                      style={{ zIndex: 20, top: "185px", left: "32px", padding: "12px 36px", borderRadius: "8px",
                        border: "1.5px solid rgba(255,180,100,0.65)", background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)", fontSize: "14px", letterSpacing: "5px", color: "#ffd4a8",
                        fontWeight: 500, opacity: hovered === "left" ? 1 : 0,
                        pointerEvents: hovered === "left" ? "auto" : "none",
                        transform: hovered === "left" ? "translateY(0)" : "translateY(10px)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,150,50,0.3)"; e.currentTarget.style.boxShadow = "0 0 25px rgba(255,150,50,0.35)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.5)"; e.currentTarget.style.boxShadow = "none"; }}>
                      선 택
                    </button>
                  </div>
                  <div className="absolute right-0 top-0 h-full cursor-pointer" style={{ width: "50%", zIndex: 15 }}
                    onMouseEnter={() => handleHover("right")} onMouseLeave={handleLeave}
                    onTouchStart={(e) => { e.preventDefault(); handleTouchStart("right"); }}>
                    <button className="char-select-btn absolute cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleSelect("right"); }}
                      onTouchStart={(e) => { e.stopPropagation(); handleSelect("right"); }}
                      style={{ zIndex: 20, bottom: "40px", right: "32px", padding: "12px 36px", borderRadius: "8px",
                        border: "1.5px solid rgba(255,220,140,0.65)", background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)", fontSize: "14px", letterSpacing: "5px", color: "#fff5d6",
                        fontWeight: 500, opacity: hovered === "right" ? 1 : 0,
                        pointerEvents: hovered === "right" ? "auto" : "none",
                        transform: hovered === "right" ? "translateY(0)" : "translateY(10px)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,210,130,0.3)"; e.currentTarget.style.boxShadow = "0 0 25px rgba(255,210,130,0.35)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.5)"; e.currentTarget.style.boxShadow = "none"; }}>
                      선 택
                    </button>
                  </div>
                </>
              )}

              {/* Selected message */}
              <div className="pointer-events-none absolute w-full text-center"
                style={{ bottom: "70px", zIndex: 25, opacity: selected ? 1 : 0, transition: "opacity 0.7s ease 0.3s" }}>
                <h3 className="font-bold text-white"
                  style={{ fontSize: "28px", letterSpacing: "8px", marginBottom: "12px",
                    textShadow: "0 2px 25px rgba(0,0,0,0.9), 0 0 18px rgba(255,220,150,0.4)" }}>
                  {selected === "left" ? "강 연 우" : selected === "right" ? "한 도 윤" : ""}
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", letterSpacing: "3px" }}>
                  당신의 사주를 풀어드리겠습니다
                </p>
              </div>
            </motion.div>
          ) : (
            /* ===== Confirming Phase ===== */
            <motion.div
              key="confirming"
              className="relative h-full w-full overflow-hidden bg-black"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {selectedInfo && (
                <motion.div className="absolute inset-0"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}>
                  <Image src={selectedInfo.confirmImage} alt={selectedInfo.fullName} fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                </motion.div>
              )}

              <div className="pointer-events-none absolute inset-0"
                style={{ zIndex: 5, boxShadow: "inset 0 0 150px rgba(0,0,0,0.7)" }} />

              {selectedInfo && (
                <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-8">
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}>
                    <h2 className="mb-1 font-black"
                      style={{ fontSize: "36px", letterSpacing: "10px", color: selectedInfo.nameColor,
                        textShadow: `0 0 30px ${selectedInfo.accentColor}, 2px 2px 12px rgba(0,0,0,0.95)` }}>
                      {selectedInfo.fullName}
                    </h2>
                    <p className="mb-2"
                      style={{ fontSize: "15px", letterSpacing: "4px", color: selectedInfo.nameColor,
                        opacity: 0.9, textShadow: "1px 1px 8px rgba(0,0,0,0.95)" }}>
                      {selectedInfo.title}
                    </p>
                    <p style={{ fontSize: "12px", letterSpacing: "2px", color: "rgba(255,255,255,0.5)",
                      textShadow: "1px 1px 6px rgba(0,0,0,0.95)" }}>
                      {selectedInfo.subtitle}
                    </p>
                  </motion.div>

                  <motion.div className="mt-5 rounded-lg p-4"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
                      borderLeft: `3px solid ${selectedInfo.borderColor}` }}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}>
                    <p className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                      &ldquo;{selectedInfo.quote}&rdquo;
                    </p>
                  </motion.div>

                  <motion.div className="mt-6 flex gap-3"
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}>
                    <button
                      className="flex-1 cursor-pointer rounded-lg py-3.5 text-sm font-medium tracking-widest transition-all duration-300"
                      style={{ border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.6)", letterSpacing: "4px" }}
                      onClick={handleCancel}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                      취소
                    </button>
                    <button
                      className="flex-[2] cursor-pointer rounded-lg py-3.5 text-sm font-bold tracking-widest transition-all duration-300"
                      style={{ border: `1.5px solid ${selectedInfo.borderColor}`, background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)", color: selectedInfo.nameColor, letterSpacing: "6px" }}
                      onClick={handleConfirm}
                      onMouseEnter={(e) => { e.currentTarget.style.background = selectedInfo.glowColor; e.currentTarget.style.boxShadow = `0 0 30px ${selectedInfo.glowColor}`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.5)"; e.currentTarget.style.boxShadow = "none"; }}>
                      결정
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FadeOverlay visible={fading} color="black" durationMs={500} />
    </div>
  );
}
