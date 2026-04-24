// Amplitude 연동 포인트 — SDK 설치 및 초기화는 DA팀 담당
// 이벤트 발화는 이 함수를 통해서만 수행한다

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  // TODO: amplitude.track(eventName, properties);
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, properties);
  }
}
