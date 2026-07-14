"use client";

interface KakaoPayButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** 카카오페이 결제 버튼 — 브랜드 컬러(#FEE500) + pay 워드마크 로고 + "결제하기". */
export function KakaoPayButton({ onClick, loading, disabled }: KakaoPayButtonProps) {
  const isDisabled = loading || disabled;
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#FEE500] text-[15px] font-semibold text-[#191600] shadow-sm transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        "결제창을 여는 중…"
      ) : (
        <>
          {/* 로고는 pay 워드마크(검정) — 노란 배경에 브랜드 규격 */}
          <img
            src="/kakaopay-logo.svg"
            alt="카카오페이"
            className="h-[17px] w-auto"
            draggable={false}
          />
          <span>결제하기</span>
        </>
      )}
    </button>
  );
}
