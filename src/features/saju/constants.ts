import type { WuxingKey } from "./types";

export const WUXING_ELEMENTS: WuxingKey[] = ["목", "화", "토", "금", "수"];

export const WUXING_HUES: Record<WuxingKey, string> = {
  목: "#9CC8B0",
  화: "#E6A88E",
  토: "#E6C58E",
  금: "#C5CAD4",
  수: "#6B8BB5",
};

export const WUXING_HANJA: Record<WuxingKey, string> = {
  목: "木",
  화: "火",
  토: "土",
  금: "金",
  수: "水",
};

// 상생 순환: 목 → 화 → 토 → 금 → 수 → 목
export const SHENG_CYCLE: WuxingKey[] = ["목", "화", "토", "금", "수"];

// 상극 순환: 목 → 토 → 수 → 화 → 금 → 목
export const KE_CYCLE: WuxingKey[] = ["목", "토", "수", "화", "금"];

// 귀인 슬러그는 `_gwi_in` 접미어로 판정 (상세표 귀인 행 분리용)
export const GWIIN_SUFFIX = "_gwi_in";

// 신살 전체 카탈로그 — 응답 label 이 비어있을 때 fallback
// 실방출 7 + 미방출 8 = 15종 (핸드오프 §2 참조)
export const SINSAL_LABEL: Record<string, string> = {
  cheon_eul_gwi_in: "천을귀인",
  cheon_deok_gwi_in: "천덕귀인",
  wol_deok_gwi_in: "월덕귀인",
  mun_chang_gwi_in: "문창귀인",
  hak_dang_gwi_in: "학당귀인",
  do_hwa_sal: "도화살",
  yeok_ma_sal: "역마살",
  hwa_gae_sal: "화개살",
  gong_mang: "공망",
  won_jin_sal: "원진살",
  gwi_mun_gwan_sal: "귀문관살",
  geum_yeo_rok: "금여록",
  yang_in_sal: "양인살",
  baek_ho_sal: "백호살",
  gwa_suk_sal: "과숙살",
};

// UI 표시 순서 — 응답 pillars 는 [년,월,일,시] 이지만 명식 상세표는 [시,일,월,년]
export function toTableOrder<T>(pillars: T[]): T[] {
  return [...pillars].reverse();
}
