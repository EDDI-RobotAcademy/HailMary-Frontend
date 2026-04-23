import { api } from "@/lib/api";
import type {
  SajuError,
  SajuFreeRequest,
  SajuFreeResponse,
  SajuSurveyRequest,
} from "./types";

const FIELD_LABEL: Record<string, string> = {
  birth: "생년월일",
  time: "태어난 시간",
  calendar: "양/음력",
  gender: "성별",
};

const FIELD_MESSAGE: Record<string, string> = {
  birth: "생년월일을 확인해 주세요.",
  time: "태어난 시간을 확인해 주세요.",
  calendar: "양/음력 선택을 확인해 주세요.",
  gender: "성별 선택을 확인해 주세요.",
};

interface ZodIssueLike {
  path?: (string | number)[];
  message?: string;
}

function mapBadRequest(detail: unknown): SajuError {
  const issues = Array.isArray(detail) ? (detail as ZodIssueLike[]) : [];
  const hints = issues
    .map((i) => {
      const root = i.path?.[0];
      if (typeof root !== "string") return null;
      return {
        field: root,
        message: FIELD_MESSAGE[root] ?? `${FIELD_LABEL[root] ?? root} 값을 확인해 주세요.`,
      };
    })
    .filter((x): x is { field: string; message: string } => x !== null);

  return {
    code: "BAD_REQUEST",
    message: hints[0]?.message ?? "입력을 확인해 주세요.",
    fieldHints: hints,
  };
}

export async function postSajuFree(
  req: SajuFreeRequest,
): Promise<{ ok: true; data: SajuFreeResponse } | { ok: false; error: SajuError }> {
  const res = await api.post<SajuFreeResponse>("/api/saju/free", req);

  if (res.ok) return { ok: true, data: res.data };

  switch (res.error) {
    case "BAD_REQUEST":
      return { ok: false, error: mapBadRequest(res.detail) };
    case "TIMEOUT":
      return {
        ok: false,
        error: { code: "TIMEOUT", message: "연결이 늦어지고 있어요." },
      };
    case "CALCULATION_FAILED":
      return {
        ok: false,
        error: {
          code: "CALCULATION_FAILED",
          message: "잠시 후 다시 시도해 주세요.",
        },
      };
    case "NETWORK":
      return {
        ok: false,
        error: {
          code: "NETWORK",
          message: "네트워크 연결을 확인해 주세요.",
        },
      };
    default:
      return {
        ok: false,
        error: { code: "UNKNOWN", message: "알 수 없는 오류가 발생했어요." },
      };
  }
}

// 설문 저장은 fire-and-forget. 실패해도 씬 진행은 막지 않는다.
// 업서트라 재호출 안전.
export async function postSajuSurvey(
  req: SajuSurveyRequest,
): Promise<{ ok: true } | { ok: false; error: SajuError }> {
  const res = await api.post<unknown>("/api/saju/survey", req);
  if (res.ok) return { ok: true };
  return {
    ok: false,
    error: {
      code: res.error,
      message:
        res.error === "BAD_REQUEST"
          ? "설문 형식을 확인해 주세요."
          : "설문 저장에 실패했어요.",
    },
  };
}
