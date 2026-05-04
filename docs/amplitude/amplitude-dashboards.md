# Amplitude — 도화선 분석 자산 인덱스

> 프로젝트: `dohwasun` (appId `808332`, org `phm-service`)
> 마지막 갱신: 2026-05-01 — v3 (무료 결과 페이지 이벤트 + user property 자동 첨부 도입)

도화선 서비스의 19개 이벤트를 기반으로 차트 10개와 대시보드 4개를 운용 중이다. v3에서 무료 결과 페이지 분석 이벤트(`result_*`, `paid_report_cta_clicked`)와 Amplitude `identify()` 기반 user property 자동 첨부가 추가됐다.

---

## 0. 운용 리듬

| 리듬 | 보는 시점 | 대시보드 | 핵심 질문 |
| --- | --- | --- | --- |
| **데일리** | 매일 오후 3시 5분 | D-1 일일 모니터링 (통합) | 어제 15단계 어디서 빠졌는가? 누가 들어왔는가? 결과 페이지를 어디까지 봤는가? |
| **주 1~2회 깊게** | 주 1~2회 30~60분 | D-3 콘텐츠 분석 | scene 단계별 도달은? 자유서술 활용도는? |
| **주 1회** | 주 1회 30분 | D-5 사용자 정보 | 인구통계 분포 추세 — 마케팅 페르소나 |
| **수시 점검** | 이슈/QA 시 | D-4 Data Health | 데이터 수집 품질 |

> D-2 주간 리뷰는 v2 재구성에서 폐지 (Retention·Stickiness 차트 삭제로 잔여 차트 0).

---

## 1. 대시보드 (4개)

| # | 대시보드 | 차트 수 | URL |
| --- | --- | --- | --- |
| D-1 | **일일 모니터링 (통합)** | 8 | <https://app.amplitude.com/analytics/phm-service/dashboard/s8dzaqka> |
| D-3 | **콘텐츠 분석** | 2 | <https://app.amplitude.com/analytics/phm-service/dashboard/q2raaehz> |
| D-4 | **Data Health Assessment** | 0 (rich_text only) | <https://app.amplitude.com/analytics/phm-service/dashboard/4n9tfcww> |
| D-5 | **사용자 정보** | 2 | <https://app.amplitude.com/analytics/phm-service/dashboard/pqsr439y> |

> archive 처리됨: `hk38g9ap`, `4nh5e2hg`, `v4g7ew2a`, `ss1klq9s`, `bwnrkbwn`, `2cuhejza`, `ef4hnhkt`, `h8a9cbfp`.

### D-1 일일 모니터링 — 차트 배치 (사용자 직접 구성)

| 위치 | chartId | 이름 | 폭 |
| --- | --- | --- | --- |
| Row 2 | `dig0nibm` | **단순 퍼널 (15단계)** | full |
| Row 3 좌 | `r3l963rv` | DAU | half |
| Row 3 우 | `67cgv3qe` | 주간 신규 vs 활성 | half |
| Row 4 좌 | `9g1tmhas` | 사용자 성별 비중 (D-5와 공유) | half |
| Row 4 우 | `nsgw8iwq` | 사용자 연령대 분포 (D-5와 공유) | half |
| Row 5 좌 | `bzx6afk3` | 캐릭터 선택 비중 | half |
| Row 5 우 | `pll6v8c6` | 성별 × 캐릭터 분포 | half |
| Row 6 | `ioamfdh9` | **결과페이지 스크롤 깊이 분포** | full |

---

## 2. 차트 (10개 — 슬롯 한도 정확히 사용)

| chartId | 이름 | 유형 | 위치 | 비고 |
| --- | --- | --- | --- | --- |
| `dig0nibm` | 사용자 단순 퍼널 (**15단계**) | funnels | D-1 | v3에서 13→15단계 확장 |
| `r3l963rv` | 일별 활성 사용자 (DAU) | eventsSegmentation | D-1 | |
| `bzx6afk3` | 캐릭터 선택 비중 | eventsSegmentation | D-1 | |
| `pll6v8c6` | 성별 × 캐릭터 분포 | eventsSegmentation | D-1 | |
| `67cgv3qe` | 주간 신규 vs 활성 사용자 추이 | eventsSegmentation | D-1 | |
| `9g1tmhas` | 사용자 성별 비중 | eventsSegmentation | D-1, D-5 공유 | |
| `nsgw8iwq` | 사용자 연령대 분포 (birth_year raw) | eventsSegmentation | D-1, D-5 공유 | |
| `d85fh9bw` | scene별 도달률 (scenario_progress + story_cut_view) | eventsSegmentation | D-3 | |
| `nv0y0ku2` | 자유서술 submit vs skip 비율 | eventsSegmentation | D-3 | |
| `ioamfdh9` | **결과페이지 스크롤 깊이 분포** | eventsSegmentation | D-1 | v3 신규 |

---

## 3. 단순 퍼널(`dig0nibm`) **15단계** — 실제 사용자 동선

```
1.  landing_enter             → 진입
2.  intro_step_complete       → 인트로 완주
3.  scenario_progress         → 시나리오 진행 (인트로 21단계)
4.  character_select          → 캐릭터 결정
5.  story_scene_start         → 스토리 시작 (캐릭터 선택 직후)
6.  story_cut_view            → 첫 컷
7.  info_form_view            → 정보 폼 노출 (스토리 도중 임베드)
8.  info_form_submit          → 정보 제출
9.  survey_step_view          → 설문 진입
10. survey_step_submit        → 설문 제출
11. loading_enter             → 로딩 진입
12. loading_done              → 로딩 완료
13. loading_result_clicked    → "결과 보기" 클릭 (무료 결과 페이지로)
14. result_page_view          → 무료 결과 페이지 마운트  ⭐ v3 추가
15. paid_report_cta_clicked   → 결제 CTA 클릭 (최종 KPI)  ⭐ v3 추가
```

**자유서술(`survey_freetext_submit` / `survey_freetext_skip`)은 funnel에서 제외.** ordered funnel 구조상 옵셔널 단계라 skip 사용자가 그 단계 미통과로 잡혀 이후 단계가 0으로 떨어지는 한계 때문. 자유서술 활용도는 D-3의 `nv0y0ku2` 차트로 별도 추적.

### 단계간 이탈 점검 가이드

- 1→2 (50% 미만) → 인트로 길거나 답답함
- 4→5 (낮음) → 캐릭터 매력·섬네일 부족
- 7→8 (80% 미만) → 정보 입력 부담
- 9→10 (낮음) → 설문 길이 부담
- 12→13 (30% 미만) → 콘텐츠가 결제 유도까지 도달 못함
- **13→14**: 결과 페이지 진입 — 거의 100%여야 정상 (페이지 이동 즉시 발화)
- **14→15**: 결과 페이지 본 사람 중 결제 의향 — **핵심 전환율 KPI**

---

## 4. 검증된 19개 이벤트와 속성

모든 이벤트 `isActive: true`, `isQueryable: true`. 신규 3개는 v3에서 추가됨.

### 4.1 진입 / 흐름 (16개 — v2 그대로)

| 이벤트 | 핵심 속성 |
| --- | --- |
| `landing_enter` | (없음) |
| `intro_step_complete` | `step` |
| `scenario_progress` | `chapter_index`, `scene_label` (1/21 ~ 21/21) |
| `character_select` | `character_id` |
| `info_form_view` | `character_id` |
| `info_form_submit` | `character_id`, `birth_year`, `birth_month`, `calendar`, `gender`, `has_birth_time` |
| `survey_step_view` | `character_id`, `step` |
| `survey_step_submit` | `character_id`, `step` |
| `survey_freetext_submit` | `character_id` |
| `survey_freetext_skip` | `character_id` |
| `loading_enter` | `character_id` |
| `loading_slot_change` | `character_id`, `slot_index`, `line_slug` |
| `loading_done` | `character_id` |
| `loading_result_clicked` | `character_id` |
| `story_scene_start` | `character_id` |
| `story_cut_view` | `character_id`, `cut_index`, `cut_type`, `scene_label` |

### 4.2 무료 결과 페이지 (3개 — v3 신규) ⭐

| 이벤트 | 핵심 속성 | 설명 |
| --- | --- | --- |
| `result_page_view` | `character_id` | 무료 결과 페이지 마운트 시 1회 |
| `result_scroll_depth` | `character_id`, `depth_percent` (10/20/.../100) | 10% 단위 스크롤 깊이 도달 시. 한 사용자당 각 depth 1회 (useRef Set 중복 방지) |
| `paid_report_cta_clicked` | `character_id`, `cta_position` ("sticky") | 결제 CTA 버튼 클릭 |

공통 속성: `device_id`, `session_id`, `timestamp`.

---

## 5. User Property 자동 첨부 (v3 신규 도입) ⭐

### 메커니즘

`info_form_submit` 시점에 `setUserProperties()`(analytics.ts) 호출 → Amplitude의 `identify()`로 user 프로필 등록 → 같은 device_id의 모든 후속 이벤트에 user property가 자동 첨부됨.

전송되는 user properties:
- `character_id`
- `gender`
- `birth_year`
- `birth_month`
- `calendar`
- `has_birth_time`

### 어디서 보이는가 (중요 — 혼란 주의)

| 위치 | user property 보임? |
| --- | --- |
| 개발자도구 콘솔 `[Analytics] result_page_view {...}` | ❌ **안 보임** (정상) — payload에 미포함 |
| 개발자도구 콘솔 `[Analytics] setUserProperties {...}` | ✅ info_form_submit 직후 1회만 보임 |
| Amplitude 이벤트 스트림 → 이벤트 상세 → User Properties 섹션 | ✅ 보임 |
| Amplitude User Lookup | ✅ 보임 |
| Amplitude 차트의 group_by / segment (User Property로 선택) | ✅ 보임 |

**이유**: amplitude SDK는 두 채널로 분리됨 — `track()`은 event payload, `identify()`는 user 프로필. 조회 시점에 Amplitude가 결합. 그래서 payload는 가볍고, user 프로필은 한 번만 등록하면 영구 따라간다.

### 활용 예시 (차트에서 segment만 추가)

`ioamfdh9`(스크롤 깊이) 차트 → 좌측 패널 **+ Add Segment** → `User Property: gender = female` → 여성의 스크롤 패턴이 즉석 도출. 신규 차트 슬롯 소비 없음.

---

## 6. 데이터에서 즉시 보이는 인사이트 (4/25 ~ 5/1)

### v3 신규 신호 (5/1)

- **단순 퍼널 15단계 첫 데이터**: 12명 시작 → 1명 완주 (8.3%). result_page_view 2명 도달, paid_report_cta_clicked 1명. **결제 의향 사용자 첫 등장**.
- **스크롤 깊이 분포**: doyoon 사용자 1명이 10/20/30/40/50/60/70/80/90/**100% 모두 도달** — 결과 페이지 100% 완주. 표본 1명이지만 콘텐츠가 사용자를 끝까지 끌고 갈 수 있다는 첫 신호.

### 누적 신호 (4/27~)

- **Apr 28·30 단순 퍼널 100% 완주** (2명, 1명) — 13단계 흐름 작동 검증.
- **Apr 27 단순 퍼널 14% 완주** — 핵심 병목은 `survey_step_view → survey_step_submit` (5→4) 그리고 `survey_step_submit → loading_enter` (4→1). 설문 단계.
- **자유서술 활용도 변동** — Apr 27: submit 3 vs skip 4 (43%). Apr 28: 100% (표본 작아 노이즈).
- **연령대 분포** — Apr 27 `1997`/`1999` 각 3명 (20대 후반 메인). 1964·1988·1995·2001·2005도 각 1명. `(none)` 2명 — Data Health 점검 항목.
- **성별 비중** — 균등(~50:50).
- **female-yeonwoo 0** — 누적 0 유지. **마케팅 타겟팅 재검토 신호.**

---

## 7. Data Health 액션 항목

1. ~~`gender` 속성 미수집~~ — **해결됨**
2. ~~`character_id` vs `character` 키 통일~~ — **해결됨**
3. ~~트래킹 플랜 등록~~ — **해결됨** (라이브)
4. ~~user property 자동 첨부 미작동~~ — **해결됨** (v3, `setUserProperties` 도입)
5. **신규 3개 이벤트 트래킹 플랜 등록** — `result_page_view`, `result_scroll_depth`, `paid_report_cta_clicked` 등록 필요 (Amplitude UI에서 `Data → Tracking Plans`).
6. **결제 이벤트 부재** — 미해결. 결제 페이지 구현 시 `payment_initiate`, `payment_success`, `payment_fail` 추가.
7. **자동 수집 속성 정리** — `[Amplitude] Page *` 검토 필요.
8. **`(none)` birth_year 발생** — Apr 27 2명. 코드 변경 전 데이터인지 폼 우회 경로인지 확인 필요.
9. **spouse 이미지 404** — `/images/spouse/neutral.png`, `f-neutral.png`, `m-neutral.png` 파일 부재. 결과 페이지의 AvoidPartnerSection·DestinedPartnerSection에서 fallback 시 발생. Amplitude와 별개의 이슈지만 사용자 경험에 영향.

---

## 8. 향후 보완

### UTM 추가 시
- 새 대시보드 D-6 마케팅 채널 분석
- D-1에 채널별 슬라이스
- 신규 차트: 시간대별 `landing_enter` (마케팅 타이밍)

### 결제 이벤트 추가 시
- 단순 퍼널 15단계 → 17~18단계 확장 (`payment_initiate` 등)
- D-5에 `paid_users` / GMV / ARPPU headline 추가
- 결제 CTA 클릭 → 결제 완료 전환율 별도 차트

### 표본 누적 후 가치 있는 차트 후보
- `survey_step_submit.step` 분포 — 어느 설문 단계에서 가장 많이 빠지는가
- `info_form_submit.calendar` × `has_birth_time` 분포 — 사주 계산 정밀도 추적
- birth_year 10년 단위 derived property — 연령대 분석 정밀화

---

## 부록: 운영 메모

- 모든 차트는 unpublished — 검토 후 게시 권장
- chartId / dashboardId 영구 식별자 — URL 안정적
- 차트/대시보드 삭제는 Amplitude MCP 도구 부재 — 사용자가 UI에서 직접 처리
- **user property 자동 첨부 활용**: D-3의 `d85fh9bw`(scene별 도달률), D-1의 `ioamfdh9`(스크롤 깊이) 등은 v3 도입 후 user property가 자동 첨부되므로 **차트 안에서 segment만 추가**하면 성별/연령대별 패턴 즉석 도출 (신규 차트 불필요, 슬롯 절약)
- 한 차트가 여러 대시보드에 들어갈 수 있음. 예: `9g1tmhas`/`nsgw8iwq`는 D-1과 D-5에 공유 배치 (Amplitude 정상 동작)

---

## 변경 이력

| 버전 | 날짜 | 주요 변경 |
| --- | --- | --- |
| v1 | 2026-04-28 | 초안. 차트 8종 + 대시보드 8개 (Funnel Analysis, Feature Adoption 등) |
| v2 | 2026-04-30 | 전면 재구성 — 사용자 단순 퍼널 13단계, 사용자 정보 대시보드 추가, 데이터 테이블 차트 폐지 |
| **v3** | **2026-05-01** | **무료 결과 페이지 이벤트 3개 추가 (result_page_view, result_scroll_depth, paid_report_cta_clicked), 단순 퍼널 13→15단계 확장, user property 자동 첨부 도입(`setUserProperties`), 스크롤 깊이 분포 차트 추가** |
