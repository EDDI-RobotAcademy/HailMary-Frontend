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
  목: "木", 화: "火", 토: "土", 금: "金", 수: "水",
};

export const SHENG_CYCLE: WuxingKey[] = ["목", "화", "토", "금", "수"];
export const KE_CYCLE: WuxingKey[] = ["목", "토", "수", "화", "금"];
export const GWIIN_SUFFIX = "_gwi_in";

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

export function toTableOrder<T>(pillars: T[]): T[] {
  return [...pillars].reverse();
}
