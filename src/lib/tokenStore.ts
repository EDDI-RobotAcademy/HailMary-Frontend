// 세션 토큰 저장소.
// 백엔드 /api/saju/free 응답으로 받은 sessionToken을 localStorage에 보관하고,
// 이후 보호된 엔드포인트 호출 시 lib/api.ts가 Authorization 헤더로 자동 첨부한다.

const KEY = "dohwaseon.sessionToken";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY, token);
    } catch {
      // localStorage 접근 실패 시 무시 (사파리 프라이빗 모드 등)
    }
  },
  clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(KEY);
    } catch {
      // 무시
    }
  },
};
