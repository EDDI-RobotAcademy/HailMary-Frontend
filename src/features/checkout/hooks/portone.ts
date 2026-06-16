"use client";

import PortOne from "@portone/browser-sdk/v2";
import { env } from "@/lib/env";

/**
 * 포트원(PortOne) V2 카카오페이 결제창 호출 래퍼 (HM-FE-137).
 *
 * 모바일은 redirect 방식이라 호출 즉시 결제사 페이지로 이동 → 완료 후 redirectUrl로
 * 복귀(쿼리에 paymentId/code 부착). 이 함수의 반환값은 PC return-value 방식 또는
 * 결제 시작 전 에러일 때만 의미가 있다.
 */

export interface PortonePaymentParams {
  /** 우리 주문번호(=포트원 paymentId). 결제 완료 검증 키. */
  paymentId: string;
  orderName: string;
  totalAmount: number;
  /** 결제 완료 검증에 필요한 컨텍스트 — BE가 customData에서 복원. */
  customData: Record<string, unknown>;
  /** 결제 완료 후 복귀 URL(모바일 필수). */
  redirectUrl: string;
}

export interface PortonePaymentResult {
  /** 결제 시작 성공(결제창 진입). 모바일 redirect면 이 코드까지 도달 못 할 수 있음. */
  ok: boolean;
  code?: string;
  message?: string;
}

function randomOrderId(): string {
  const words = crypto.getRandomValues(new Uint32Array(3));
  const hex = Array.from(words)
    .map((w) => w.toString(16).padStart(8, "0"))
    .join("");
  return `order_${hex}`;
}

/** 포트원 paymentId(=주문번호) 생성 — 매 결제 고유. */
export function makePortoneOrderId(): string {
  return randomOrderId();
}

export async function requestPortonePayment(
  params: PortonePaymentParams,
): Promise<PortonePaymentResult> {
  const response = await PortOne.requestPayment({
    storeId: env.PORTONE_STORE_ID,
    channelKey: env.PORTONE_CHANNEL_KEY,
    paymentId: params.paymentId,
    orderName: params.orderName,
    totalAmount: params.totalAmount,
    currency: "KRW",
    payMethod: "EASY_PAY",
    customData: params.customData,
    redirectUrl: params.redirectUrl,
  });
  // 모바일 redirect면 페이지가 이동해 여기 도달 안 함. PC return-value 또는 에러만 처리.
  if (response?.code !== undefined) {
    return { ok: false, code: response.code, message: response.message };
  }
  return { ok: true };
}
