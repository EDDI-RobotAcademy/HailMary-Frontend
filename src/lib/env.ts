export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
  // 소셜 로그인 인가 URL용 공개 클라이언트 ID (빌드 시 인라인됨). 미설정이면 빈 문자열 → 버튼 비활성.
  KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? "",
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  // 카드사 심사용 테스트 로그인 버튼 노출 (HM-FE-136). 심사 종료 후 "false"+재배포로 숨김.
  TEST_LOGIN_ENABLED: process.env.NEXT_PUBLIC_TEST_LOGIN_ENABLED === "true",
};
