// Amplitude SDK 초기화·연결은 데이터팀 담당
// 이 함수는 이벤트 발화만 담당한다

declare const amplitude:
  | { track: (name: string, props?: Record<string, unknown>) => void }
  | undefined;

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  const key = "hm_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "hm_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  const payload = {
    device_id: getDeviceId(),
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    ...properties,
  };

  if (typeof amplitude !== "undefined") {
    amplitude.track(eventName, payload);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, payload);
  }
}
