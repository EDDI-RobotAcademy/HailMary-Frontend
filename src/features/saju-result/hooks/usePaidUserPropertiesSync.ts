"use client";

// 유료 결과 p0 진입 시 1회만 Amplitude identify 호출.
// 백엔드 PaidReportResponse.user (PII 가공값) 가 단일 입력 소스.
// 응답 snake_case 그대로 전송 (Amplitude property key 도 snake_case 권장).
//
// ⚠️ setUserId 호출 금지 (HMDA-46 후속): DB users.id는 사주 1회 제출마다 새로 생겨
// 사람 단위 고정 식별자가 아니다. 이 값을 Amplitude user_id로 심으면(usr_607→usr_609)
// 같은 device의 흐름이 별개 유저로 분리된다. 익명 유저의 단일 식별자는 device_id —
// user_id는 로그인 계정(accounts.id) 같은 사람 단위 고정값이 생길 때만 설정한다.
// DB 조인용 users.id는 user property `user_db_id`로만 보존.

import { useEffect, useRef } from "react";
import { setUserProperties } from "@/shared/utils/analytics";

export interface PaidUserProperties {
  user_id: string;
  user_nickname: string | null;
  user_name_initial: string;
  user_email_domain: string;
  user_email_hash: string;
  birth_year: number;
  age_group: string;
  birth_branch: string | null;
  gender: string;
}

interface Args {
  user: PaidUserProperties | null | undefined;
  active: boolean;  // p0 가 현재 활성 페이지일 때만 동작
}

export function usePaidUserPropertiesSync({ user, active }: Args): void {
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) return;
    if (!user) return;
    if (syncedRef.current === user.user_id) return;

    setUserProperties({
      user_db_id: user.user_id,
      user_nickname: user.user_nickname,
      user_name_initial: user.user_name_initial,
      user_email_domain: user.user_email_domain,
      user_email_hash: user.user_email_hash,
      birth_year: user.birth_year,
      age_group: user.age_group,
      birth_branch: user.birth_branch,
      gender: user.gender,
    });

    syncedRef.current = user.user_id;
  }, [active, user]);
}
