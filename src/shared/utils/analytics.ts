// =============================================================================
// [DA팀 연동 가이드] Amplitude SDK 연결 방법
// =============================================================================
//
// 1. SDK 설치:
//    npm install @amplitude/analytics-browser
//
// 2. 초기화 위치: src/app/layout.tsx 또는 별도 providers 파일에 추가
//    import * as amplitude from "@amplitude/analytics-browser";
//    amplitude.init("YOUR_API_KEY", { defaultTracking: false });
//
// 3. 이 파일에서 수정할 부분:
//    - 아래 `declare const amplitude` 블록 삭제
//    - 상단에 `import * as amplitude from "@amplitude/analytics-browser"` 추가
//    - trackEvent 내부의 `amplitude.track(eventName, payload)` 호출은 그대로 유지
//
// 4. device_id / session_id:
//    현재는 F/E에서 직접 생성해서 payload에 포함.
//    Amplitude SDK 자체 device_id를 쓰려면 getDeviceId/getSessionId 제거 후
//    amplitude.getDeviceId() / amplitude.getSessionId() 로 교체.
//
// =============================================================================

import * as amplitude from "@amplitude/analytics-browser";

export function initAmplitude(): void {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;
  amplitude.init(apiKey, { defaultTracking: false });
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  const key = "hm_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function getSessionId(): string {
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

  // ▼ DA팀: SDK 연결 후 이 블록은 그대로 유지 (amplitude import만 변경)
  amplitude.track(eventName, payload);
  // ▲ 유지

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, payload);
  }
}

/**
 * Amplitude user property 설정.
 * 한 번 호출하면 같은 device_id의 후속 모든 이벤트에 자동 첨부된다.
 * info_form_submit 시점에 호출하여 결제/스크롤 등 후속 이벤트의 세그먼트 분석을
 * 가능하게 함.
 */
export function setUserProperties(
  properties: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  const identify = new amplitude.Identify();
  Object.entries(properties).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    identify.set(key, value as string | number | boolean);
  });
  amplitude.identify(identify);

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] setUserProperties", properties);
  }
}
