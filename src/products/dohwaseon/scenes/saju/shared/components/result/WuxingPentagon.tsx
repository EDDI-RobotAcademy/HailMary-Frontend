"use client";

import {
  KE_CYCLE,
  SHENG_CYCLE,
  WUXING_ELEMENTS,
  WUXING_HANJA,
  WUXING_HUES,
  type Wuxing,
  type WuxingKey,
} from "@/features/saju";

type Props = { wuxing: Wuxing };

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 100;

// 꼭짓점 좌표 (12시 기준 시계방향) — 목, 화, 토, 금, 수
const VERTEX: Record<WuxingKey, { x: number; y: number }> = (() => {
  const order: WuxingKey[] = ["목", "화", "토", "금", "수"];
  return order.reduce<Record<WuxingKey, { x: number; y: number }>>(
    (acc, el, idx) => {
      const angle = (-90 + idx * 72) * (Math.PI / 180);
      acc[el] = {
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
      };
      return acc;
    },
    {} as Record<WuxingKey, { x: number; y: number }>,
  );
})();

// 선 끝을 원 둘레까지 살짝 당겨서 화살표가 원 안으로 꽂히지 않게
function shrink(
  a: { x: number; y: number },
  b: { x: number; y: number },
  offset: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: a.x + ux * offset,
    y1: a.y + uy * offset,
    x2: b.x - ux * offset,
    y2: b.y - uy * offset,
  };
}

export default function WuxingPentagon({ wuxing }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-4 py-5"
      style={{
        background: "rgba(40,38,34,0.55)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(245,237,224,0.1)",
      }}
    >
      <p
        className="text-center text-[10px] tracking-[0.3em]"
        style={{ color: "#E6C58E" }}
      >
        오행 분포
      </p>
      <p
        className="mt-1 text-center text-[11px]"
        style={{ color: "#998f82" }}
      >
        겉으로 보이는 오행의 균형
      </p>

      <div className="mt-3 flex items-center gap-4 text-[10px]" style={{ color: "#D0C5B6" }}>
        <span className="flex items-center gap-1">
          <span style={{ color: "#6B8BB5" }}>→</span> 생(生)
        </span>
        <span className="flex items-center gap-1">
          <span style={{ color: "#E6A88E" }}>⇢</span> 극(克)
        </span>
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mt-2 h-auto w-full"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="sheng-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#6B8BB5" />
          </marker>
          <marker
            id="ke-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#E6A88E" />
          </marker>
        </defs>

        {/* 상생: 오각형 변 (인접 꼭짓점 연결, 시계방향) */}
        {SHENG_CYCLE.map((el, i) => {
          const next = SHENG_CYCLE[(i + 1) % SHENG_CYCLE.length];
          const line = shrink(VERTEX[el], VERTEX[next], 26);
          return (
            <line
              key={`s-${el}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#6B8BB5"
              strokeWidth="1.5"
              strokeOpacity="0.7"
              markerEnd="url(#sheng-arrow)"
            />
          );
        })}

        {/* 상극: 펜타그램 대각선 */}
        {KE_CYCLE.map((el, i) => {
          const next = KE_CYCLE[(i + 1) % KE_CYCLE.length];
          const line = shrink(VERTEX[el], VERTEX[next], 26);
          return (
            <line
              key={`k-${el}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#E6A88E"
              strokeWidth="1"
              strokeDasharray="4 3"
              strokeOpacity="0.6"
              markerEnd="url(#ke-arrow)"
            />
          );
        })}

        {/* 꼭짓점 원 + 한자 + 개수 */}
        {WUXING_ELEMENTS.map((el) => {
          const { x, y } = VERTEX[el];
          const hue = WUXING_HUES[el];
          const count = wuxing.counts[el];
          return (
            <g key={`v-${el}`}>
              <circle
                cx={x}
                cy={y}
                r="22"
                fill="rgba(20,19,17,0.85)"
                stroke={hue}
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={y + 7}
                textAnchor="middle"
                fontSize="22"
                fontWeight="900"
                fill={hue}
              >
                {WUXING_HANJA[el]}
              </text>
              <text
                x={x}
                y={y + 42}
                textAnchor="middle"
                fontSize="11"
                fill="#D0C5B6"
              >
                {count}개
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
