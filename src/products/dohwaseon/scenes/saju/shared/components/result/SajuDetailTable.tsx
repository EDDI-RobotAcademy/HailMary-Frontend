"use client";

import {
  GWIIN_SUFFIX,
  WUXING_HUES,
  toTableOrder,
  type Pillar,
  type WuxingKey,
} from "@/features/saju";

type Props = { pillars: Pillar[] };

const COL_LABEL = ["時", "日", "月", "年"];
const DAY_COL_INDEX = 1;

function elementParts(element: string): [WuxingKey | null, WuxingKey | null] {
  const parts = element.split("/").map((s) => s.trim()) as WuxingKey[];
  return [parts[0] ?? null, parts[1] ?? null];
}

export default function SajuDetailTable({ pillars }: Props) {
  const cols = toTableOrder(pillars);

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
        명식(命式) 상세
      </p>

      <div className="mt-4 grid grid-cols-[44px_1fr_1fr_1fr_1fr]">
        <div />
        {COL_LABEL.map((h) => (
          <div
            key={h}
            className="py-2 text-center text-[13px] font-semibold"
            style={{ color: "#F5EDE0" }}
          >
            {h}
          </div>
        ))}

        <RowLabel>十星<small className="block opacity-70">(상)</small></RowLabel>
        {cols.map((p, i) => (
          <Cell key={`tstop-${p.label}`}>
            {p.unknown ? (
              <Dim>?</Dim>
            ) : i === DAY_COL_INDEX ? (
              <strong style={{ color: "#FFE2B3" }}>日干</strong>
            ) : (
              <>
                <span className="text-[13px]" style={{ color: "#F5EDE0" }}>
                  {p.tenGod.heavenHanja}
                </span>
                <small style={{ color: "#998f82" }}>({p.tenGod.heaven})</small>
              </>
            )}
          </Cell>
        ))}

        <RowLabel>天干</RowLabel>
        {cols.map((p) => (
          <StemCell key={`h-${p.label}`} pillar={p} slot="heaven" />
        ))}

        <RowLabel>地支</RowLabel>
        {cols.map((p) => (
          <StemCell key={`e-${p.label}`} pillar={p} slot="earth" />
        ))}

        <RowLabel>十星<small className="block opacity-70">(하)</small></RowLabel>
        {cols.map((p) => (
          <Cell key={`tsbot-${p.label}`}>
            {p.unknown ? (
              <Dim>?</Dim>
            ) : (
              <>
                <span className="text-[13px]" style={{ color: "#F5EDE0" }}>
                  {p.tenGod.earthHanja}
                </span>
                <small style={{ color: "#998f82" }}>({p.tenGod.earth})</small>
              </>
            )}
          </Cell>
        ))}

        <RowLabel>十二<small className="block opacity-70">運星</small></RowLabel>
        {cols.map((p) => (
          <Cell key={`tp-${p.label}`}>
            {p.unknown ? (
              <Dim>?</Dim>
            ) : (
              <>
                <span className="text-[13px]" style={{ color: "#F5EDE0" }}>
                  {p.twelvePhase.hanja}
                </span>
                <small style={{ color: "#998f82" }}>
                  ({p.twelvePhase.name})
                </small>
              </>
            )}
          </Cell>
        ))}

        <RowLabel>神殺</RowLabel>
        {cols.map((p) => {
          const sals = p.sinSals.filter(
            (s) => !s.slug.endsWith(GWIIN_SUFFIX),
          );
          return (
            <Cell key={`ss-${p.label}`}>
              {p.unknown || sals.length === 0 ? (
                <Dim>—</Dim>
              ) : (
                sals.map((s) => (
                  <span
                    key={s.slug}
                    className="text-[11px] leading-tight"
                    style={{ color: "#F5EDE0" }}
                  >
                    {s.label}
                  </span>
                ))
              )}
            </Cell>
          );
        })}

        <RowLabel>貴人</RowLabel>
        {cols.map((p) => {
          const gwiin = p.sinSals.filter((s) =>
            s.slug.endsWith(GWIIN_SUFFIX),
          );
          return (
            <Cell key={`gw-${p.label}`}>
              {p.unknown || gwiin.length === 0 ? (
                <Dim>—</Dim>
              ) : (
                gwiin.map((s) => (
                  <span
                    key={s.slug}
                    className="text-[11px] leading-tight"
                    style={{ color: "#FFE2B3" }}
                  >
                    {s.label}
                  </span>
                ))
              )}
            </Cell>
          );
        })}
      </div>
    </div>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-2 pr-1 text-[10px] tracking-[0.1em] leading-tight"
      style={{
        color: "#998f82",
        borderTop: "1px solid rgba(245,237,224,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-center"
      style={{ borderTop: "1px solid rgba(245,237,224,0.06)" }}
    >
      {children}
    </div>
  );
}

function Dim({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[13px]" style={{ color: "#998f82" }}>
      {children}
    </span>
  );
}

function StemCell({
  pillar,
  slot,
}: {
  pillar: Pillar;
  slot: "heaven" | "earth";
}) {
  if (pillar.unknown) {
    return (
      <Cell>
        <div
          className="my-1 flex h-10 w-10 items-center justify-center rounded-md text-[22px] font-black"
          style={{
            background: "rgba(120,110,100,0.2)",
            color: "#998f82",
            border: "1px solid rgba(245,237,224,0.12)",
          }}
        >
          ?
        </div>
      </Cell>
    );
  }

  const hanja = slot === "heaven" ? pillar.heaven : pillar.earth;
  const hangul = slot === "heaven" ? pillar.heavenHangul : pillar.earthHangul;
  const yy = pillar.yinYang[slot];
  const [e1, e2] = elementParts(pillar.element);
  const elemKey = slot === "heaven" ? e1 : e2;
  const hue = elemKey ? WUXING_HUES[elemKey] : pillar.hue;

  return (
    <Cell>
      <div
        className="text-[9px] tracking-[0.15em]"
        style={{ color: "#998f82" }}
      >
        {hangul}
      </div>
      <div
        className="my-0.5 flex h-10 w-10 items-center justify-center rounded-md text-[22px] font-black"
        style={{
          background: `${hue}26`,
          color: hue,
          border: `1px solid ${hue}55`,
        }}
      >
        {hanja}
      </div>
      <div
        className="text-[9px] tracking-[0.15em]"
        style={{ color: "#998f82" }}
      >
        {yy}
        {elemKey ? ` · ${elemKey}` : ""}
      </div>
    </Cell>
  );
}
