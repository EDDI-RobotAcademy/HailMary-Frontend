import { env } from "./env";
import { tokenStore } from "./tokenStore";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "CALCULATION_FAILED"
  | "TIMEOUT"
  | "NETWORK"
  | "UNKNOWN";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorCode; detail?: unknown; status?: number };

const TIMEOUT_MS = 5000;

function buildHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {};
  if (extra) {
    new Headers(extra).forEach((v, k) => {
      headers[k] = v;
    });
  }
  const token = tokenStore.get();
  if (token && !("Authorization" in headers) && !("authorization" in headers)) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${env.API_URL}${path}`, {
      ...init,
      headers: buildHeaders(init?.headers),
      signal: ctrl.signal,
    });

    const body = await res.json().catch(() => null);

    if (res.ok) return { ok: true, data: body as T };

    if (res.status === 400) {
      return { ok: false, error: "BAD_REQUEST", detail: body?.detail ?? body, status: 400 };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: "UNAUTHORIZED", detail: body, status: res.status };
    }
    if (res.status >= 500) {
      return { ok: false, error: "CALCULATION_FAILED", detail: body, status: res.status };
    }
    return { ok: false, error: "UNKNOWN", detail: body, status: res.status };
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      return { ok: false, error: "TIMEOUT" };
    }
    return { ok: false, error: "NETWORK", detail: (e as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
