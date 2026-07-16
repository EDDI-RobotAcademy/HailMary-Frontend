import { formatKrw, type CheckoutProduct } from "../../domain/checkoutProducts";

interface PriceSummaryProps {
  product: CheckoutProduct;
  /** 쿠폰 적용 시 최종 0원 표시. */
  freeWithCoupon?: boolean;
  /** 카드사 심사용 테스트 계정 — 최종 0원 + "테스트 계정 무료" 표시. */
  testFree?: boolean;
}

export function PriceSummary({
  product,
  freeWithCoupon = false,
  testFree = false,
}: PriceSummaryProps) {
  const salePrice = formatKrw(product.priceKrw);
  const originalPrice = formatKrw(product.originalPriceKrw);
  const discountAmount = product.originalPriceKrw - product.priceKrw;
  // 정가 대비 할인율 — 과대표시 방지 위해 내림 처리.
  const discountRate = Math.floor((discountAmount / product.originalPriceKrw) * 100);
  // 쿠폰 또는 테스트 계정이면 최종 0원.
  const isFree = freeWithCoupon || testFree;

  return (
    <section className="space-y-3">
      <h2 className="text-[15px] font-semibold text-neutral-900">결제 금액</h2>
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-5">
        {/* 상품명 + 정가(취소선) */}
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-neutral-700">{product.productLabel}</span>
          <span className="text-neutral-400 line-through">{originalPrice}</span>
        </div>

        {/* 할인 배지 + 할인액 */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {discountRate}% 할인
            </span>
            <span className="text-[12px] font-medium text-rose-500">
              오픈 기념 특가
            </span>
          </span>
          <span className="text-[13px] font-medium text-rose-500">
            -{formatKrw(discountAmount)}
          </span>
        </div>

        {freeWithCoupon && !testFree && (
          <div className="flex items-center justify-between text-[13px] text-emerald-600">
            <span>쿠폰 할인</span>
            <span>-{salePrice}</span>
          </div>
        )}

        {testFree && (
          <div className="flex items-center justify-between text-[13px] text-emerald-600">
            <span>테스트 계정 무료</span>
            <span>-{salePrice}</span>
          </div>
        )}

        <div className="border-t border-neutral-200" />
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-neutral-900">
            최종 결제금액
          </span>
          <span className="text-[18px] font-extrabold text-rose-600">
            {isFree ? formatKrw(0) : salePrice}
          </span>
        </div>
      </div>
    </section>
  );
}
