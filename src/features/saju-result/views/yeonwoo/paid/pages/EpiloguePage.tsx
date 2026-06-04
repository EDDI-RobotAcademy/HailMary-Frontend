"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/shared/utils/analytics";
import PageHead from "../components/PageHead";
import { Sec } from "../components/Section";

// HTML 명세 (line 2756~2790) 정밀 포팅.
// 終 에필로그: AI 슬롯 0개 (강연우 하드코딩 멘트)
//   - SD yw_cg_c (sz-240) + thread_corner 외곽 wrapper
//   - 강연우 버블 (4줄 하드코딩 멘트, 15px / line-height 1.9)
//   - dancheong-divider
//   - epilog-seal (緣 인장, motif_seal_yeon)

// HTML 원본 4줄 멘트 (line 2779).
const EPILOGUE_LINES: ReadonlyArray<string> = [
  "다 읽었어? 네 팔자에 뭐가 걸려 있는지 이제 알겠지.",
  "매듭은 풀라고 있는 거야. 끌어안고 사는 게 아니라.",
  "너 정도면 충분히 잘 살아. 아직 안 보이는 것뿐이야.",
  "... 가봐.",
];

// URL에서 orderId 추출 — PaidLoadingClient와 동일 패턴
function extractOrderIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  const m = window.location.pathname.match(/\/saju\/paid\/([^/]+)/);
  const id = m?.[1] ?? "";
  return id === "_placeholder" ? "" : id;
}

export default function EpiloguePage() {
  const router = useRouter();
  const handleClosingCta = () => {
    // dev/full 등 orderId가 없는 환경에서는 placeholder로 fallback
    const orderId = extractOrderIdFromUrl() || "test-order-id";
    trackEvent("paidclosing_enter_click", {
      character_id: "yeonwoo",
      order_id: orderId,
    });
    router.push(`/saju/paid/${encodeURIComponent(orderId)}/closing`);
  };
  return (
    <section
      data-page-idx="11"
      className="text-[#d8d6d0]"
      style={{ fontFamily: "var(--font-pretendard)" }}
    >
      <PageHead
        chHanja="終"
        chCode="EPILOG"
        title="에필로그"
        sub=""
        iconAsset="/yeonwoo/motif/motif_seal_jeom.svg"
        iconOpacity={0.35}
      />

      <Sec>
        {/* SD yw_cg_c (sz-240) + thread_corner 외곽 wrapper (size-frame 110px) */}
        <div className="relative my-4 flex justify-center">
          <span
            aria-hidden
            className="absolute -top-3 -left-3 w-[60px] h-[60px] bg-no-repeat bg-contain pointer-events-none opacity-65 z-10"
            style={{ backgroundImage: "url(/yeonwoo/thread/thread_corner.png)" }}
          />
          <span
            aria-hidden
            className="absolute -bottom-3 -right-3 w-[60px] h-[60px] bg-no-repeat bg-contain pointer-events-none opacity-65 z-10"
            style={{
              backgroundImage: "url(/yeonwoo/thread/thread_corner.png)",
              transform: "scale(-1,-1)",
            }}
          />
          <div className="relative w-[240px] h-[240px]">
            <Image
              src="/yeonwoo/sd_yw/yw_cg_c.png"
              alt="강연우 — 클로징"
              fill
              sizes="240px"
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 0 18px rgba(232,201,160,0.40))",
              }}
            />
          </div>
        </div>

        {/* 강연우 버블 (HTML 원본 4줄 하드코딩, 15px / line-height 1.9 / padding 14px) */}
        <div
          className="rounded-[10px] my-2 italic"
          style={{
            background: "#1e1e1c",
            color: "#d8d4cc",
            border: "0.5px solid #333",
            padding: "14px",
            fontSize: "15px",
            lineHeight: 1.9,
            letterSpacing: "-0.01em",
            wordBreak: "keep-all",
          }}
        >
          <div
            className="not-italic mb-1 tracking-[0.05em]"
            style={{ fontSize: "12px", color: "#E8C9A0" }}
          >
            강연우
          </div>
          {EPILOGUE_LINES.map((line, i) => (
            <span key={i}>
              {line}
              {i < EPILOGUE_LINES.length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* 단청 디바이더 */}
        <div
          aria-hidden
          className="my-6 h-6 bg-no-repeat bg-center bg-contain opacity-80"
          style={{
            backgroundImage: "url(/yeonwoo/motif/motif_dancheong.svg)",
          }}
        />

        {/* 緣(seal_yeon) 작은 인장 — 마지막 줄 */}
        <div className="flex flex-col items-center my-4 gap-2">
          <div
            aria-hidden
            className="w-16 h-16 bg-no-repeat bg-center bg-contain"
            style={{
              backgroundImage: "url(/yeonwoo/motif/motif_seal_yeon.svg)",
              filter: "drop-shadow(0 0 14px rgba(232,201,160,0.45))",
            }}
          />
          <span
            className="text-[12px] text-center"
            style={{
              color: "#888780",
              letterSpacing: "0.1em",
              wordBreak: "keep-all",
            }}
          >
            緣 — 이 결이 너를 어디로 데려갈지, 그건 시간이 답해.
          </span>
        </div>

        {/* 클로징 씬 진입 CTA — 강연우 멘트 톤 */}
        <div className="mt-10 mb-2">
          <div
            className="rounded-[14px] p-5"
            style={{
              background: "rgba(232,201,160,0.04)",
              border: "0.5px solid rgba(232,201,160,0.22)",
            }}
          >
            <p
              className="text-[14px] mb-4 italic"
              style={{
                color: "#d8d4cc",
                lineHeight: 1.7,
                letterSpacing: "-0.01em",
                wordBreak: "keep-all",
              }}
            >
              <span
                className="not-italic mr-2 text-[12px]"
                style={{ color: "#E8C9A0", letterSpacing: "0.05em" }}
              >
                강연우
              </span>
              <br />
              ...아직 안 끝났어. 한마디만 더 듣고 가.
            </p>
            <button
              type="button"
              onClick={handleClosingCta}
              className="w-full rounded-md py-3.5 text-[14px] font-semibold tracking-[0.05em] text-[#1a1612] cursor-pointer transition-opacity hover:opacity-90 active:opacity-80"
              style={{
                background: "linear-gradient(180deg, #E6C58E 0%, #C9A56B 100%)",
                boxShadow: "0 4px 14px rgba(201,165,107,0.30)",
              }}
            >
              마지막 한마디 들으러 가기 →
            </button>
          </div>
        </div>
      </Sec>
    </section>
  );
}
