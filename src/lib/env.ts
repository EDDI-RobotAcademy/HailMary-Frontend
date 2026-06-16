export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
  // 소셜 로그인 인가 URL용 공개 클라이언트 ID (빌드 시 인라인됨). 미설정이면 빈 문자열 → 버튼 비활성.
  KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? "",
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  // 카드사 심사용 테스트 로그인 버튼 노출 (HM-FE-136). 심사 종료 후 "false"+재배포로 숨김.
  TEST_LOGIN_ENABLED: process.env.NEXT_PUBLIC_TEST_LOGIN_ENABLED === "true",
  // 포트원 카카오페이 결제 (HM-FE-137). enabled면 결제창 사용 가능.
  // for_all=false면 테스트 계정만 노출(심사 기간) → 통과 후 "true"로 전체 개방.
  PORTONE_ENABLED: process.env.NEXT_PUBLIC_PORTONE_ENABLED === "true",
  PORTONE_FOR_ALL: process.env.NEXT_PUBLIC_PORTONE_FOR_ALL === "true",
  PORTONE_STORE_ID: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? "",
  PORTONE_CHANNEL_KEY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "",
};
