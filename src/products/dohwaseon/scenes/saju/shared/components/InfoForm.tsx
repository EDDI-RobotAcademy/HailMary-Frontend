"use client";

import { useState } from "react";

export type SajuInfo = {
  name: string;
  birth: string;
  calendar: "solar" | "lunar";
  time: string;
  gender: "female" | "male";
};

type Props = {
  onSubmit: (info: SajuInfo) => void;
  buttonLabel?: string;
};

export default function InfoForm({
  onSubmit,
  buttonLabel = "도윤에게 알려주기 →",
}: Props) {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [time, setTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<"female" | "male" | null>(null);

  const isValid =
    name.trim().length > 0 &&
    /^\d{4}\.\d{2}\.\d{2}$/.test(birth) &&
    (unknownTime || /^\d{2}:\d{2}$/.test(time)) &&
    gender !== null;

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValid || !gender) return;
    onSubmit({
      name: name.trim(),
      birth,
      calendar,
      time: unknownTime ? "unknown" : time,
      gender,
    });
  };

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,19,17,0.92) 0%, rgba(20,19,17,0.78) 50%, rgba(20,19,17,0.92) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-14">
        <div className="text-center">
          <p
            className="text-[10px] tracking-[0.4em]"
            style={{ color: "#E6C58E" }}
          >
            CELESTIAL ARCHIVE
          </p>
          <p
            className="mt-3 text-[15px] leading-relaxed"
            style={{ color: "#F5EDE0" }}
          >
            정확한 분석을 위해
            <br />
            사주 정보를 입력해 주세요.
          </p>
        </div>

        <div className="mt-9 flex-1 space-y-6">
          <Field label="이름">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full bg-transparent py-2 text-[15px] outline-none placeholder:text-[#998f82]"
              style={{
                color: "#F5EDE0",
                borderBottom: "1px solid rgba(245,237,224,0.15)",
              }}
            />
          </Field>

          <Field label="생년월일">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={birth}
                onChange={(e) => setBirth(formatBirth(e.target.value))}
                placeholder="YYYY.MM.DD"
                maxLength={10}
                inputMode="numeric"
                className="flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-[#998f82]"
                style={{
                  color: "#F5EDE0",
                  borderBottom: "1px solid rgba(245,237,224,0.15)",
                }}
              />
              <Chip
                selected={calendar === "solar"}
                onClick={() => setCalendar("solar")}
              >
                양력
              </Chip>
              <Chip
                selected={calendar === "lunar"}
                onClick={() => setCalendar("lunar")}
              >
                음력
              </Chip>
            </div>
          </Field>

          <Field label="태어난 시간">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(formatTime(e.target.value))}
                placeholder="HH:MM"
                maxLength={5}
                inputMode="numeric"
                disabled={unknownTime}
                className="flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-[#998f82] disabled:opacity-40"
                style={{
                  color: "#F5EDE0",
                  borderBottom: "1px solid rgba(245,237,224,0.15)",
                }}
              />
              <Chip
                selected={unknownTime}
                onClick={() => {
                  setUnknownTime(!unknownTime);
                  if (!unknownTime) setTime("");
                }}
              >
                모름
              </Chip>
            </div>
          </Field>

          <Field label="성별">
            <div className="flex gap-3">
              <Chip
                selected={gender === "female"}
                onClick={() => setGender("female")}
                wide
              >
                여성
              </Chip>
              <Chip
                selected={gender === "male"}
                onClick={() => setGender("male")}
                wide
              >
                남성
              </Chip>
            </div>
          </Field>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="mt-10 w-full rounded-2xl py-3.5 text-[13px] font-bold tracking-[0.3em] transition-all disabled:cursor-not-allowed"
          style={{
            background: isValid
              ? "linear-gradient(135deg, #FFE2B3, #E6C58E)"
              : "rgba(230,197,142,0.18)",
            color: isValid ? "#412d04" : "rgba(208,197,182,0.5)",
            boxShadow: isValid ? "0 0 28px rgba(230,197,142,0.2)" : "none",
          }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-[11px] tracking-[0.25em]"
        style={{ color: "#D0C5B6" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
  wide = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full text-[12px] tracking-[0.2em] transition-all ${
        wide ? "flex-1 py-2.5" : "px-4 py-1.5"
      }`}
      style={{
        background: selected ? "#E6C58E" : "rgba(40,38,34,0.6)",
        color: selected ? "#412d04" : "#D0C5B6",
        backdropFilter: "blur(10px)",
        fontWeight: selected ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}

function formatBirth(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

function formatTime(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
