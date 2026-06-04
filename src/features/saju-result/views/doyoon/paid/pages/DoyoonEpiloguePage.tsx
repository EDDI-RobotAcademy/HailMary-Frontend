"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import type { PaidChapterP11Doyoon } from "../../../../domain/paidReport";
import { DoyoonPageHead } from "../components/DoyoonPageHead";
import {
  DoyoonSection,
} from "../components/DoyoonSection";
import { DOYOON_TOKENS } from "../components/doyoonTokens";

// P-11 EPILOG — 도윤의 마지막 말 (고정, AI 없음).
// 원본 도윤_final.html data-page-idx=11.
// data 우선 사용 (백엔드에서 user_name 치환된 텍스트), 없으면 userName fallback.

interface DoyoonEpiloguePageProps {
  data?: PaidChapterP11Doyoon;
  userName?: string;
}

const MOCK_CLOSING = (name: string) =>
  `다 읽으셨나요? 데이터가 할 수 있는 말은 여기까지입니다.\n` +
  `이제부터는 ${name}님의 선택이라는 변수가 결과값을 결정하겠죠.\n` +
  `데이터상으로 ${name}님의 조합은 오차 범위를 감안해도 기대값이 굉장히 높게 측정됩니다.\n` +
  `스스로를 의심하지 마세요. ${name}님은 이미 가장 완벽한 답안지를 갖고 계시니까요.`;

// URL에서 orderId 추출 (PaidLoadingClient / EpiloguePage 동일 패턴)
function extractOrderIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  const m = window.location.pathname.match(/\/saju\/paid\/([^/]+)/);
  const id = m?.[1] ?? "";
  return id === "_placeholder" ? "" : id;
}

export default function DoyoonEpiloguePage({ data, userName }: DoyoonEpiloguePageProps) {
  const router = useRouter();
  const name = userName ?? "홍길동";
  const closing = data?.closing_bubble ?? MOCK_CLOSING(name);
  const seal = data?.seal_text ?? "緣 · 당신의 인연은 여기에";

  const handleClosingCta = () => {
    const orderId = extractOrderIdFromUrl() || "test-order-id";
    trackEvent("paidclosing_enter_click", {
      character_id: "doyoon",
      order_id: orderId,
    });
    router.push(`/saju/paid/${encodeURIComponent(orderId)}/closing-doyoon`);
  };

  return (
    <section
      data-page-idx="11"
      style={{ background: DOYOON_TOKENS.bg, color: DOYOON_TOKENS.text }}
    >
      <DoyoonPageHead
        ch="ep"
        hanja="終"
        title="에필로그"
        sub="도윤의 마지막 말"
      />

      <DoyoonSection>
        <SdClosingDy09 />
        <ClosingBubble body={closing} />
        <EpilogSeal text={seal} />

        {/* 클로징 씬 진입 CTA — 도윤 분석가 톤 */}
        <div className="mt-8 mb-2">
          <div
            className="rounded-[12px] p-5"
            style={{
              background: "rgba(232,193,84,0.05)",
              border: "0.5px solid rgba(232,193,84,0.25)",
            }}
          >
            <p
              className="text-[14px] mb-4 italic"
              style={{
                color: DOYOON_TOKENS.text,
                lineHeight: 1.7,
                wordBreak: "keep-all",
              }}
            >
              <span
                className="not-italic mr-2 text-[12px] font-semibold"
                style={{ color: DOYOON_TOKENS.warmGold, letterSpacing: "0.05em" }}
              >
                한도윤
              </span>
              <br />
              리포트는 끝났지만, 한 가지만 더 말씀드릴게요.
            </p>
            <button
              type="button"
              onClick={handleClosingCta}
              className="w-full rounded-md py-3.5 text-[14px] font-semibold tracking-[0.05em] cursor-pointer transition-opacity hover:opacity-90 active:opacity-80"
              style={{
                background: "linear-gradient(180deg, #fff8ec 0%, #f4e6cf 100%)",
                color: DOYOON_TOKENS.warmGold,
                border: `0.5px solid ${DOYOON_TOKENS.goldSoft}`,
                boxShadow: "0 2px 10px rgba(139,105,20,0.12)",
              }}
            >
              한도윤의 마지막 말 →
            </button>
          </div>
        </div>
      </DoyoonSection>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// 인라인 컴포넌트
// ════════════════════════════════════════════════════════════════════

function SdClosingDy09() {
  return (
    <div className="relative mx-auto my-3" style={{ width: 260, height: 260 }}>
      <ThreadCorner pos="tl" />
      <ThreadCorner pos="br" />
      <div
        aria-label="한도윤 — 창가 노을 (클로징)"
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: "url(/doyoon/sd_dy/dy_09.png)",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(0 0 18px rgba(232,193,84,0.30))",
        }}
      />
    </div>
  );
}

function ThreadCorner({ pos }: { pos: "tl" | "br" }) {
  const map: Record<"tl" | "br", React.CSSProperties> = {
    tl: { top: -8, left: -8, transform: "rotate(-90deg)" },
    br: { bottom: -8, right: -8, transform: "rotate(90deg)" },
  };
  return (
    <span
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        ...map[pos],
        width: 110,
        height: 110,
        backgroundImage: "url(/doyoon/thread/thread_corner.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        opacity: 0.55,
        zIndex: 3,
      }}
    />
  );
}

function ClosingBubble({ body }: { body: string }) {
  return (
    <div
      className="my-3 rounded-[12px]"
      style={{
        background: "rgba(212,83,126,0.06)",
        border: "0.5px solid rgba(212,83,126,0.22)",
        padding: 14,
      }}
    >
      <div
        className="text-[12px] font-semibold mb-2"
        style={{ color: DOYOON_TOKENS.pink, letterSpacing: "0.03em" }}
      >
        한도윤
      </div>
      <div
        className="text-[12px] whitespace-pre-line"
        style={{ color: DOYOON_TOKENS.text, lineHeight: 1.9, wordBreak: "keep-all" }}
      >
        {body}
      </div>
    </div>
  );
}

function EpilogSeal({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center my-8">
      <div
        aria-hidden
        style={{
          width: 90,
          height: 90,
          backgroundImage: "url(/doyoon/motif/motif_seal_yeon.png)",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.85,
          marginBottom: 12,
        }}
      />
      <div
        className="text-[13px] text-center"
        style={{
          color: DOYOON_TOKENS.warmGold,
          letterSpacing: "0.15em",
          fontWeight: 600,
        }}
      >
        {text}
      </div>
    </div>
  );
}
