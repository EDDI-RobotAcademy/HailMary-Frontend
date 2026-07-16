import { authStore } from "./authStore";

/**
 * 계정 JWT의 `sub`(=account id)를 디코드해 반환. 토큰 없거나 파싱 실패 시 null.
 *
 * 포트원 결제 customData에 실어 보내면, 웹훅 발급 경로(JWT 없음)에서도 결제를
 * 계정에 귀속(보관함 노출)할 수 있다. (FE는 서명 검증 안 함 — 표시/귀속용 식별자일 뿐)
 */
export function getAccountIdFromToken(): number | null {
  const token = authStore.get();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const sub = Number(json.sub);
    return Number.isSafeInteger(sub) && sub > 0 ? sub : null;
  } catch {
    return null;
  }
}
