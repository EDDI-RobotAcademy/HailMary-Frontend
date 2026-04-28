# Amplitude — 도화선 분석 자산 인덱스

> 생성일: 2026-04-28 · 프로젝트: `dohwasun` (appId `808332`, org `phm-service`)

도화선 서비스의 16개 이벤트를 기반으로 차트 8종과 대시보드 8개를 Amplitude에 구축했다. 이 문서는 그 자산의 위치, 해석 가이드, 후속 액션을 한 곳에 모아둔 것이다.

---

## 1. 대시보드 (8개)

각 대시보드는 비공개(unpublished) 상태로 개인 스페이스에 생성되었다. 검토 후 팀 스페이스로 게시하면 된다.

| 대시보드 | 용도 | URL |
| --- | --- | --- |
| Funnel Analysis | 랜딩 → 결과 클릭 5단계 전환과 캐릭터별 분기 | <https://app.amplitude.com/analytics/phm-service/dashboard/hk38g9ap> |
| Feature Adoption | 16개 이벤트 전체의 기능별 사용량 | <https://app.amplitude.com/analytics/phm-service/dashboard/4nh5e2hg> |
| Getting Started KPIs (Web) | 신규 사용자 온보딩 구간 | <https://app.amplitude.com/analytics/phm-service/dashboard/v4g7ew2a> |
| Product KPIs | DAU·전환·유지율·고착도 종합 | <https://app.amplitude.com/analytics/phm-service/dashboard/ss1klq9s> |
| Session Engagement | 세션 길이·고착도 | <https://app.amplitude.com/analytics/phm-service/dashboard/bwnrkbwn> |
| Marketing Analytics | 유입·캐릭터 선호도·사용자 구성 | <https://app.amplitude.com/analytics/phm-service/dashboard/2cuhejza> |
| User Activity | 사용자 활동량·구성·재방문 | <https://app.amplitude.com/analytics/phm-service/dashboard/ef4hnhkt> |
| Data Health Assessment | 데이터 수집 품질 점검 체크리스트 | <https://app.amplitude.com/analytics/phm-service/dashboard/4n9tfcww> |

---

## 2. 차트 (8종)

| 유형 | 차트 이름 | URL |
| --- | --- | --- |
| 세분화 (eventsSegmentation) | 일별 활성 사용자 | <https://app.amplitude.com/analytics/phm-service/chart/r3l963rv> |
| 퍼널 (funnels) | 랜딩 → 결과 클릭 핵심 전환 | <https://app.amplitude.com/analytics/phm-service/chart/a2ccac5m> |
| 데이터 테이블 (eventsSegmentation·table view) | 16개 이벤트별 발생 회수 | <https://app.amplitude.com/analytics/phm-service/chart/gl5djv34> |
| 유지율 (retention) | 신규 사용자 N-day Retention | <https://app.amplitude.com/analytics/phm-service/chart/w6m1u4qy> |
| 여정 (funnels + byProp) | 캐릭터별 안내 수월 (연우 vs 도윤) | <https://app.amplitude.com/analytics/phm-service/chart/gwz7ick9> |
| 세션 (sessions) | 평균 세션 길이 추이 | <https://app.amplitude.com/analytics/phm-service/chart/po9o7p89> |
| 사용자 구성 (eventsSegmentation·group_by gender) | 정보 입력 사용자 성별 분포 | <https://app.amplitude.com/analytics/phm-service/chart/dtw84xrs> |
| ~~사용자 구성 (composition, deprecated)~~ | ~~정보 입력 사용자 성별 분포~~ | <https://app.amplitude.com/analytics/phm-service/chart/csc6q810> |
| 고착도 (stickiness) | 활성 사용자 주간 사용 빈도 | <https://app.amplitude.com/analytics/phm-service/chart/4g5gziwk> |

---

## 3. 검증된 16개 이벤트와 속성

모든 이벤트는 4월 25일경부터 수신되고 있고 `isActive=true`, `isQueryable=true`로 정상이다. 2026-04-28 트래킹 플랜 등록 완료 — `isInSchema=true`로 전환됨. (`isPlanned` API 필드는 새 Amplitude UI 흐름에서는 신뢰할 수 있는 지표가 아니므로 무시.)

| 이벤트 | 핵심 속성 | 비고 |
| --- | --- | --- |
| `landing_enter` | (없음) | |
| `intro_step_complete` | `step` | |
| `scenario_progress` | `chapter_index`, `scene_label` | |
| `character_select` | `character_id` (`yeonwoo`/`doyoon`) | |
| `info_form_view` | `character_id` | |
| `info_form_submit` | `character_id`, `birth_year`, `birth_month`, `calendar`, `gender`, `has_birth_time` | gender 값 정상 수집 확인됨 |
| `survey_step_view` | `character_id`, `step` | |
| `survey_step_submit` | `character_id`, `step` | |
| `survey_freetext_submit` | `character_id` | |
| `survey_freetext_skip` | `character_id` | |
| `loading_enter` | `character_id` | 코드 수정 완료 (구 데이터: `character`) |
| `loading_slot_change` | `character_id`, `slot_index`, `line_slug` | 코드 수정 완료 |
| `loading_done` | `character_id` | 코드 수정 완료 |
| `loading_result_clicked` | `character_id` | 코드 수정 완료 |
| `story_scene_start` | `character_id` | |
| `story_cut_view` | `character_id` | |

공통 속성: `device_id`, `session_id`, `timestamp` (모두 `analytics.ts`의 `trackEvent`에서 자동 첨부).

---

## 4. 데이터에서 즉시 보이는 인사이트 (4/25 ~ 4/28)

- **서비스 가동 4일차.** landing_enter 누적 19, character_select 14, info_form_submit 16, loading_result_clicked 2.
- **캐릭터 편향**: 도윤 5명 vs 연우 1명. 도윤만 결제 유도 단계까지 도달, 연우는 character_select → info_form 단계에서 100% 이탈. 표본이 작아 결론은 보류하되 5월 중순 다시 확인 권장.
- **연우 이탈 가설**: ① 캐릭터 매력 격차 ② 연우 플로우의 UI 이슈 ③ 단순 표본 부족. `survey_step_view` × `character_id` 분기 카드를 추가하면 단계별 이탈 지점을 잡을 수 있다.
- **세션 길이 5860초 → 1206초 → 106초**로 급감. 4/26은 외부 trafic spike(사용자 한 명이 1시간 머무름) 가능성, 4/28은 일상적인 한 사이클(2분)으로 보임. 표본 누적 후 재해석 필요.

---

## 5. Data Health 액션 항목 (우선순위 순)

1. ~~**`gender` 속성 미수집 검증**~~ — **해결됨 (2026-04-28).** 데이터는 정상 수집되고 있었다 (4/27 female 10, male 5; 4/28 female 1). 문제는 차트 쿼리였다. `composition` 차트는 본래 user property 전용이라 event property를 넣으면 (none)으로 잡힌다. `eventsSegmentation + group_by gender`로 차트 교체 완료 (chartId `dtw84xrs`). Marketing Analytics, User Activity 대시보드에 반영됨.
2. ~~**`character_id` vs `character` 속성 키 통일**~~ — **해결됨 (2026-04-28).** `SajuLoadingView.tsx`의 `loading_*` 4개 이벤트(`loading_enter`, `loading_slot_change`, `loading_done`, `loading_result_clicked`)에서 `character` 키를 `character_id`로 변경. 다음 배포 이후 데이터에서는 단일 키로 통일된다.
   - **주의**: 배포 직후 일정 기간은 옛 데이터(`character`)와 새 데이터(`character_id`)가 혼재. 차트 분기 시 OR 조건으로 둘 다 잡거나, 이행 기간(예: 7일) 후 `character_id`로 단일화.
3. ~~**트래킹 플랜 등록**~~ — **해결됨 (2026-04-28).** 16개 이벤트 모두 스키마 등록 완료(`isInSchema: true`)이며 Description도 명세대로 입력됨. Amplitude UI가 변경되면서 "Approve & Publish" 단계가 사라지고 UI 편집이 자동으로 라이브 반영되는 구조로 바뀌었다. 즉 `isPlanned` 필드는 새 UI 흐름에서는 신뢰할 수 있는 지표가 아니며, 현재 트래킹 플랜은 정상 라이브 상태다.
4. **자동 수집 속성 정리 판단** — `[Amplitude] Page *` 속성이 자동으로 들어오는데 `analytics.ts`는 `defaultTracking: false`로 설정되어 있다. 어딘가에서 default tracking이 켜진 SDK가 추가 초기화되지 않았는지 확인 필요. 안 쓸 거면 끄고, 쓸 거면 그대로 두기.

---

## 6. 결제 이벤트 (placeholder)

현재 코드와 Amplitude 모두 결제 이벤트가 없다. 추가 시 권장 스펙:

| 이벤트 | 시점 | 권장 속성 |
| --- | --- | --- |
| `payment_cta_view` | 결제 유도 화면 노출 | `character_id`, `cta_position` |
| `payment_initiate` | 결제 위젯 진입 | `character_id`, `amount`, `payment_method` |
| `payment_success` | 결제 완료 콜백 | `character_id`, `amount`, `payment_method`, `order_id` |
| `payment_fail` | 결제 실패 콜백 | `character_id`, `payment_method`, `failure_reason` |

추가 후 교체할 자리:
- **Funnel Analysis** 대시보드의 5단계 퍼널에서 마지막 `loading_result_clicked` → `payment_initiate` (또는 `payment_success`)
- **Product KPIs** 대시보드 상단에 `paid_users / GMV / ARPPU` headline 차트 추가
- **Marketing Analytics**에 `payment_method` 분포 composition 차트 추가

---

## 7. 후속 차트 추천

지금은 만들지 않았지만 데이터 누적 후 다음 차트가 유용할 것이다.

- 단계별 이탈 사용자의 `survey_step_submit.step` 분포 — UX 보강 우선순위 산정
- `info_form_submit.calendar` (양력/음력) × `has_birth_time` 분포 — 사주 계산 정밀도와 사용자 입력 패턴
- `scenario_progress.chapter_index` × `character_id` heatmap — 어느 챕터에서 이탈이 많은지
- 시간대별 landing_enter 분포 — 마케팅 타이밍 최적화

---

## 부록: 작업 실행 환경

- Amplitude MCP 사용 (직접 차트/대시보드 생성, 데이터 검증)
- 모든 차트는 unpublished 상태 — 검토 후 게시 권장
- chartId/dashboardId는 영구 식별자이므로 위 URL은 안정적
