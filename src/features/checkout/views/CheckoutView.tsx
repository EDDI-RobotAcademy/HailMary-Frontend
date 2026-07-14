"use client";

import { useEffect } from "react";
import { LegalModal } from "@/shared/components/LegalModal";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { trackEvent } from "@/shared/utils/analytics";
import type { CheckoutCharacter } from "../domain/checkoutProducts";
import { isDevBypassEnabled, useCheckout } from "../hooks/useCheckout";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { EmailField } from "./components/EmailField";
import { PriceSummary } from "./components/PriceSummary";
import { CouponField } from "./components/CouponField";
import { CheckoutCta } from "./components/CheckoutCta";
import { KakaoPayButton } from "./components/KakaoPayButton";
import { ConsentRow } from "./components/ConsentRow";

interface CheckoutViewProps {
  character: CheckoutCharacter;
}

export function CheckoutView({ character }: CheckoutViewProps) {
  const {
    product,
    email,
    setEmail,
    emailError,
    handleEmailBlur,
    coupon,
    setCoupon,
    handleCouponBlur,
    couponApplied,
    isTestAccount,
    kakaopayAvailable,
    couponMessage,
    couponChecking,
    agreeDataUsage,
    handleAgreeDataUsage,
    agreePayment,
    handleAgreePayment,
    openConsent,
    setOpenConsent,
    handleConsentDetail,
    isProcessing,
    applyCoupon,
    handleBack,
    handleSubmit,
    devBypassPay,
  } = useCheckout(character);

  const devBypass = isDevBypassEnabled();

  useEffect(() => {
    const SENT_KEY = `hm_checkout_${character}_view_sent`;
    if (sessionStorage.getItem(SENT_KEY)) return;
    sessionStorage.setItem(SENT_KEY, "1");
    const sajuRequestId =
      localStorage.getItem(`${character}SajuRequestId`) ?? null;
    trackEvent("checkout_page_view", {
      character_id: character,
      saju_request_id: sajuRequestId,
      amount: product.priceKrw,
    });
  }, [character, product.priceKrw]);

  return (
    <div className="flex min-h-[100dvh] flex-1 flex-col bg-white text-neutral-900">
      <CheckoutHeader onBack={handleBack} />

      <main className="flex-1 space-y-6 px-6 py-8">
        {/* 카드사 심사용 테스트 계정 안내. */}
        {isTestAccount && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[13px] font-semibold text-emerald-700">
              테스트 계정으로 로그인됨
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-emerald-600">
              {kakaopayAvailable
                ? "아래 카카오페이 버튼을 누르면 테스트 결제창이 뜹니다. 테스트 모드라 실제 청구는 발생하지 않으며, 결제 완료 후 유료 결과가 발급됩니다."
                : "실제 결제 없이 유료 사주 결과를 무료로 확인할 수 있어요. 최종 결제금액은 0원이며, 아래 버튼을 누르면 바로 결과가 발급됩니다."}
            </p>
          </div>
        )}

        <EmailField
          value={email}
          onChange={setEmail}
          onBlur={handleEmailBlur}
          error={emailError}
        />

        <hr className="border-white/[0.06]" />

        {/* 카카오페이(포트원) 있으면 실제 결제라 0원 표시 X. 0원 무통과 폴백일 때만 testFree. */}
        <PriceSummary
          product={product}
          freeWithCoupon={couponApplied}
          testFree={isTestAccount && !kakaopayAvailable}
        />

        {/* 테스트 계정은 쿠폰이 무의미 — 혼동 방지 위해 쿠폰 입력 숨김. */}
        {!isTestAccount && (
          <CouponField
            value={coupon}
            onChange={setCoupon}
            onBlur={handleCouponBlur}
            onApply={applyCoupon}
            applied={couponApplied}
            message={couponMessage}
            checking={couponChecking}
          />
        )}

        {/* PayApp 결제: 인페이지 위젯 없음. 결제수단·약관은 PayApp 페이지가 처리.
            우리 페이지의 동의(ConsentRow)는 우리 서비스의 개인정보·결제진행 동의 별도. */}

        {couponApplied ? (
          // 쿠폰 무료발급 — 결제수단 무관 단일 버튼.
          <CheckoutCta
            onSubmit={() => handleSubmit()}
            loading={isProcessing}
            disabled={false}
            label="무료로 받기"
            loadingLabel="처리 중…"
          />
        ) : kakaopayAvailable ? (
          // 카카오페이(포트원) + PayApp(카드·간편결제) 공존.
          <div className="space-y-2">
            <KakaoPayButton
              onClick={() => handleSubmit("kakao")}
              loading={isProcessing}
            />
            <CheckoutCta
              onSubmit={() => handleSubmit("payapp")}
              loading={isProcessing}
              disabled={false}
              label="카드 · 간편결제"
              loadingLabel="결제창을 여는 중…"
            />
          </div>
        ) : (
          // 포트원 미개방 — PayApp 단일.
          <CheckoutCta
            onSubmit={() => handleSubmit("payapp")}
            loading={isProcessing}
            disabled={false}
            label="결제하기"
          />
        )}

        {/* 서비스 제공기간 명시 — 이용약관 제14조 4항. 카카오페이 입점 심사 요청(2026-07-02):
            결제 고객이 잘 인지할 수 있는 구좌에 이용기간 추가 표기. */}
        <p className="text-center text-[12px] text-neutral-500">
          * 유료 결과물의 이용기간은 결제 완료일로부터 30일까지입니다.
        </p>

        {/* ⚠️ staging/local 전용 — 운영 도메인에서는 노출 X (isDevBypassEnabled). */}
        {devBypass && (
          <button
            type="button"
            onClick={devBypassPay}
            disabled={isProcessing}
            className="w-full rounded-md border border-dashed border-rose-400 bg-rose-50 px-4 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-40 cursor-pointer"
          >
            🛠 결제 패스 (테스트용 · staging/local 전용)
          </button>
        )}

        <div className="space-y-3 pt-2">
          <ConsentRow
            id="agree-data-usage"
            label="개인정보 이용 동의"
            checked={agreeDataUsage}
            onChange={handleAgreeDataUsage}
            onDetail={() => handleConsentDetail("data-usage")}
          />
          <ConsentRow
            id="agree-payment"
            label="결제진행 동의"
            checked={agreePayment}
            onChange={handleAgreePayment}
            onDetail={() => handleConsentDetail("payment")}
          />
        </div>
      </main>

      <SiteFooter variant="light" />

      <LegalModal doc={openConsent} onClose={() => setOpenConsent(null)} />
    </div>
  );
}
