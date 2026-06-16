"use client";

import { useEffect, useState } from "react";
import { env } from "@/lib/env";
import { trackEvent } from "@/shared/utils/analytics";
import { useAuth } from "../hooks/useAuth";
import type { AuthProvider } from "../domain/types";

interface LoginPromptModalProps {
  open: boolean;
  /** '나중에 하기' 또는 배경 탭 — 팝업만 닫고 원래 플로 계속. */
  onClose: () => void;
  /** 로그인 왕복 후 복귀할 경로. 미지정 시 현재 경로. */
  returnTo?: string;
  /** 어디서 띄웠는지 (kkebi/yeonwoo/doyoon) — 트래킹/문구 분기용. */
  source?: string;
  /** 깨비 기본 멘트 대신 쓸 문구 (캐릭터별 미세 조정 여지). 미지정 시 헤딩 없음. */
  title?: string;
  description?: string;
}

const KKEBI_IMG = "/kkebi/images/corner-m2.png";

// 깨비 말투 — 사주정보 저장 가치 제안 (부담 줄이는 가벼운 톤). 헤딩 없이 멘트만.
// 줄바꿈은 max-xs 폭(280px)에서 단어가 안 잘리도록 의도적으로 끊음.
const DEFAULT_DESC =
  "로그인해두면 깨비가 네 이름이랑\n태어난 날을 기억해뒀다가,\n다음엔 알아서 꺼내줄게.\n받은 결과지도 보관함에 모아둘게.";

export function LoginPromptModal({
  open,
  onClose,
  returnTo,
  source,
  title,
  description,
}: LoginPromptModalProps) {
  const { startLogin, testLogin, isAuthenticated } = useAuth();

  // 카드사 심사용 테스트 로그인 — 인라인 ID/PW 폼 토글 상태(심사 기간 한정, env 플래그로 노출).
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [testUsername, setTestUsername] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [testError, setTestError] = useState<string | null>(null);
  const [testSubmitting, setTestSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    trackEvent("login_prompt_view", { source: source ?? null });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, source]);

  // 로그인된 상태면 노출 안 함 — bfcache 복원으로 stale-open 되는 경우 자동 숨김(OAuth 뒤로가기 루프 차단).
  if (!open || isAuthenticated) return null;

  const handleLogin = (provider: AuthProvider) => {
    startLogin(provider, returnTo);
  };

  const handleDismiss = () => {
    trackEvent("login_dismiss", { source: source ?? null });
    onClose();
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testSubmitting) return;
    setTestError(null);
    setTestSubmitting(true);
    try {
      await testLogin(testUsername.trim(), testPassword);
      // 로그인 성공 → 토큰/프로필 저장됨. 팝업 닫고 원래 플로(결제) 계속.
      onClose();
    } catch {
      setTestError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setTestSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6"
      // 배경(딤) 클릭으로는 닫지 않는다 — 권유 팝업이 실수 탭으로 사라지면(닫힘=통과 처리)
      // 로그인 유도 취지가 무력화됨. 닫기는 '나중에 하기' 버튼으로만(명시적 의사).
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-xs rounded-2xl bg-white px-5 pb-6 pt-[76px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 깨비 — 카드 상단에 살짝 걸치게 (크기 키우되 넘침 비율 유지) */}
        <img
          src={KKEBI_IMG}
          alt="깨비"
          className="pointer-events-none absolute -top-[72px] left-1/2 h-36 w-36 -translate-x-1/2 select-none drop-shadow-md"
          draggable={false}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          {title && (
            <h2 className="text-[16px] font-bold text-neutral-900">{title}</h2>
          )}
          <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-neutral-700">
            {description ?? DEFAULT_DESC}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {/* 카카오 — 브랜드 노란색 + 다크 텍스트 */}
          <button
            type="button"
            onClick={() => handleLogin("kakao")}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[14px] font-semibold text-[#191600] transition-opacity hover:opacity-90"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M9 1.5C4.86 1.5 1.5 4.13 1.5 7.36c0 2.08 1.4 3.9 3.5 4.93-.15.53-.55 1.96-.63 2.27-.1.38.14.38.3.27.12-.08 1.92-1.3 2.7-1.84.37.05.74.08 1.13.08 4.14 0 7.5-2.62 7.5-5.86S13.14 1.5 9 1.5Z"
                fill="#191600"
              />
            </svg>
            카카오로 시작하기
          </button>

          {/* 구글 — 흰 배경 + 보더 + 멀티컬러 G */}
          <button
            type="button"
            onClick={() => handleLogin("google")}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white text-[14px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5Z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44Z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2c-.4.4 6.6-4.8 6.6-14.6 0-1.3-.1-2.3-.4-3.5Z" />
            </svg>
            Google로 시작하기
          </button>

          {/* 카드사 심사용 테스트 로그인 — env 플래그 ON일 때만 노출. 심사 종료 후 플래그 OFF로 숨김. */}
          {env.TEST_LOGIN_ENABLED &&
            (testFormOpen ? (
              <form
                onSubmit={handleTestSubmit}
                className="mt-1 flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <input
                  type="text"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  placeholder="아이디"
                  autoComplete="username"
                  className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-[13px] text-neutral-800 outline-none focus:border-neutral-500"
                />
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-[13px] text-neutral-800 outline-none focus:border-neutral-500"
                />
                {testError && (
                  <p className="text-[12px] text-red-500">{testError}</p>
                )}
                <button
                  type="submit"
                  disabled={testSubmitting}
                  className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-neutral-800 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {testSubmitting ? "확인 중…" : "테스트 계정으로 로그인"}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setTestFormOpen(true)}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white text-[14px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
              >
                테스트 계정으로 시작하기
              </button>
            ))}

          <button
            type="button"
            onClick={handleDismiss}
            className="mt-1 cursor-pointer py-1 text-[13px] text-neutral-400 transition-colors hover:text-neutral-600"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
