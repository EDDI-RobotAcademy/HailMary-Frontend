# 이벤트 트래킹 명세

원본 문서: https://benjamin-swan.github.io/dohwasun/

---

## 구조 개요

```
F/E 이벤트 발생
  → GTM (클라이언트 중계, 12개)
    → Amplitude (행동 분석용)

결제 완료
  → B/E (Next.js API) → Amplitude (보안 직접 전송, 1개)
  → AWS / DB (운영 데이터 저장)
```

- **Amplitude**: 익명 행동 데이터만. 이름·전화번호 절대 포함 금지.
- **payment_complete**: 해킹 방지를 위해 F/E가 아닌 B/E 서버에서 직접 전송.

---

## 이벤트 목록 (총 13개)

| # | 이벤트명 | 처리 | 설명 |
|---|---------|------|------|
| 1 | `landing_enter` | F/E | 유입 채널 UTM 파라미터 포함 |
| 2 | `intro_step_complete` | F/E | 인트로 단계별 완료 (이탈률 파악) |
| 3 | `enter_character_select` | F/E | 캐릭터 선택 화면 최초 진입 시각 |
| 4 | `character_select` | F/E | 선택 캐릭터 + 고민 소요 시간 |
| 5 | `user_info_submit` | F/E | 개인정보 제외, 캐릭터 식별 정보만 |
| 6 | `result_received` | F/E | 무료 결과 수신 완료 |
| 7 | `unselected_character_shown` | F/E | 미선택 캐릭터 결과 유도 버튼 노출 |
| 8 | `unselected_character_click` | F/E | 미선택 캐릭터 유도 버튼 클릭 |
| 9 | `payment_click` | F/E | 결제 의도 (결제창 오픈) |
| 10 | `paid_version_enter` | F/E | 유료 결과 페이지 진입 |
| 11 | `paid_version_complete_read` | F/E | 유료 결과 완독 (스크롤 끝) |
| 12 | `share_click` | F/E | 공유 버튼 클릭 |
| 13 | `payment_complete` | **B/E** | 결제 완료 (백엔드 Webhook 수신 후 Amplitude 직접 전송) |

---

## GTM 연동 규칙

- F/E 코드에서 `dataLayer.push({ event: '이벤트명', ...속성 })` 형식으로 전달
- GTM이 수집 후 Amplitude로 포워딩
- 추적 규칙 변경 시 개발자 없이 GTM 화면에서 직접 수정 가능

---

## B/E API 엔드포인트

| 메서드 | 경로 | 역할 |
|-------|------|------|
| POST | `/api/payment/request` | PayApp에 결제창 요청 |
| POST | `/api/payment/callback` | PayApp Webhook 수신 (`state=1` = 성공) → Amplitude에 `payment_complete` 전송 |

---

## HMDA 백로그 매핑

| 백로그 | 목적 | 관련 이벤트 |
|--------|------|-------------|
| **HMDA-1** Activation | 초기 유입 → 캐릭터 선택까지 이탈률·소요시간 | `landing_enter`, `intro_step_complete`, `enter_character_select`, `character_select` |
| **HMDA-2** Transition | UTM 채널별 결과 페이지 도달률 | `landing_enter`(UTM), `character_select`, `result_received` |
| **HMDA-3** Retention | 무료→유료 전환율 + 미선택 캐릭터 상호작용 | `result_received`, `payment_click`, `payment_complete`, `share_click`, `unselected_character_shown`, `unselected_character_click` |
| **HMDA-4** Time | 유료 결과 완독 소요 시간 | `paid_version_enter`, `paid_version_complete_read` |
| **HMDA-5** Loop | 공유 링크를 통한 신규 유입 추적 | `share_click`, `landing_enter`(Referral) |
| **HMDA-6** Policy | UTM 파라미터 작성 규칙 (개발 무관, DA/마케터 담당) | — |
