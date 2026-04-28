# Amplitude 트래킹 플랜 등록 가이드

> 이 문서는 Amplitude의 "Tracking Plan" 기능에 도화선 이벤트를 등록하기 위한 가이드와 코드 기준 이벤트 풀 스펙을 모아놓은 곳이다.
>
> **참고**: `docs/event-tracking.md`는 기획 단계 문서(13개 이벤트, HMDA 백로그 매핑)다. 현재 코드에는 16개 이벤트가 구현되어 있고 기획과 일부 차이가 있다 — 이 문서 마지막 절에 갭 정리.

---

## 1. 트래킹 플랜이 무엇이고 왜 등록하는가

Amplitude의 트래킹 플랜은 이벤트와 속성의 **공식 명세를 Amplitude 시스템에 등록**하는 기능이다. 등록하면:
- 신입 팀원이 이벤트 카탈로그를 Amplitude UI에서 바로 볼 수 있음
- 잘못된 속성 키나 누락된 속성을 자동 검출 (Data Quality 점수)
- 새 이벤트가 들어왔을 때 "계획에 없는 이벤트"로 알림

**현재 상태 (2026-04-28 갱신)**: 16개 이벤트의 스키마 등록과 라이브 반영이 모두 완료됨. Amplitude UI가 변경되면서 이전과 달리 "Approve & Publish"라는 별도 버튼 단계 없이 UI에서의 편집이 그대로 라이브에 자동 반영된다. `isPlanned` 필드는 새 UI 흐름에서는 더 이상 라이브 여부의 신뢰할 수 있는 지표가 아님 (현재 false로 보여도 실제 트래킹 플랜은 라이브).

## 2. 등록 주체 — 누가 하는가?

**개발팀(F/E) 또는 DA팀이 직접 한다.** Amplitude MCP에는 트래킹 플랜 직접 생성 도구가 없어서 코드로 자동 등록할 수는 없다. UI 또는 CSV 임포트 또는 Ampli CLI를 써야 한다.

## 3. 방법 A — Amplitude UI에서 수동 등록 (권장: 첫 등록)

/tracking-plans URL로 접근했을 때 Amplitude가 자동으로 /events/main/latest로 리다이렉트한 것입니다. 이게 실은 좋은 신호입니다.

1. Amplitude 좌측 사이드바에서 **Data → Tracking Plans** 진입
2. **+ Create plan** 클릭, 이름은 예: "도화선 v1"
3. **Events** 탭에서 **+ Add event**를 16번 반복:
   - 이벤트명은 아래 5절의 이벤트명을 그대로 입력
   - 각 이벤트의 Description에 한 줄 설명 복붙
4. 각 이벤트 클릭 → **+ Add property**로 속성 등록:
   - Property name (예: `character_id`)
   - Type (string / number / boolean) — 5절 명세 참고
   - Required 체크박스 (필수 속성이면)
   - Allowed values (예: `character_id`라면 `yeonwoo, doyoon` 입력)
5. 저장. **현재 Amplitude UI는 편집 결과를 자동으로 라이브에 반영한다** (예전의 "Approve & Publish" 버튼 단계 없음).

소요 시간: 15~30분 (16개 이벤트 × 평균 3분).

## 4. 방법 B / C — CSV 임포트 또는 Ampli CLI

- **방법 B (CSV 임포트)**: Tracking Plan 페이지에서 CSV 임포트 기능 제공. 형식이 Amplitude 공식 문서에 정의되어 있다. 16개를 반복 입력하기 귀찮으면 이걸 쓴다.
- **방법 C (Ampli CLI)**: `@amplitude/ampli` CLI로 트래킹 플랜과 코드를 양방향 동기화. TypeScript 사용자에게 가장 적합. `trackEvent("landing_enter")`가 컴파일 타임에 검증됨. 도입 결정 시 별도 작업(설치, ampli.json 설정, CI 통합) 필요.

**권장 첫 단계**: 방법 A로 일단 등록. 한 달 운영 후 변경 빈도 보고 방법 C 도입 여부 판단.

---

## 5. 코드 기준 16개 이벤트 풀 스펙

> 각 이벤트는 `shared/utils/analytics.ts`의 `trackEvent`로 발화. 자동 첨부 공통 속성: `device_id`(string), `session_id`(string), `timestamp`(string).

### 5.1 진입 / 인트로

**`landing_enter`** — 첫 진입 시 1회 발화
- 추가 속성: 없음

**`intro_step_complete`** — 인트로 단계 완료
- `step` (number, required) — 완료한 단계 번호 (1부터)

**`scenario_progress`** — 시나리오 챕터/씬 진행
- `chapter_index` (number, required) — 챕터 인덱스 (0부터)
- `scene_label` (string, required) — 씬 식별 라벨

### 5.2 캐릭터 선택

**`character_select`** — 캐릭터 카드 선택 확정
- `character_id` (string, required, allowed: `yeonwoo` / `doyoon`)

### 5.3 사주 정보 입력

**`info_form_view`** — 정보 입력 폼 노출
- `character_id` (string, required, allowed: `yeonwoo` / `doyoon`)

**`info_form_submit`** — 정보 입력 폼 제출
- `character_id` (string, required, allowed: `yeonwoo` / `doyoon`)
- `gender` (string, required, allowed: `female` / `male`)
- `birth_year` (string, required, format: `YYYY`)
- `birth_month` (string, required, format: `MM`)
- `calendar` (string, required, allowed: `solar` / `lunar`)
- `has_birth_time` (boolean, required)

### 5.4 설문

**`survey_step_view`** — 설문 단계 진입
- `character_id` (string, required)
- `step` (number, required)

**`survey_step_submit`** — 설문 단계 제출 (멀티셀렉트)
- `character_id` (string, required)
- `step` (number, required)

**`survey_freetext_submit`** — 자유서술 설문 제출
- `character_id` (string, required)

**`survey_freetext_skip`** — 자유서술 설문 스킵
- `character_id` (string, required)

### 5.5 사주 풀이 로딩

> 모두 2026-04-28에 `character` 키를 `character_id`로 통일.

**`loading_enter`** — 로딩 화면 진입
- `character_id` (string, required, allowed: `yeonwoo` / `doyoon`)

**`loading_slot_change`** — 로딩 화면 TMI 슬롯 자동 전환
- `character_id` (string, required)
- `slot_index` (number, required)
- `line_slug` (string, required)

**`loading_done`** — 로딩 완료 (결과 보기 버튼 활성화 시점)
- `character_id` (string, required)

**`loading_result_clicked`** — "결과 보기" 버튼 클릭. 결제 유도 직전 신호
- `character_id` (string, required)

### 5.6 스토리 (사주 풀이)

**`story_scene_start`** — 스토리 시작
- `character_id` (string, required)

**`story_cut_view`** — 스토리 컷 노출
- `character_id` (string, required)

---

## 6. 향후 추가 예정 (결제 이벤트)

```
payment_cta_view      — 결제 유도 화면 노출
payment_initiate      — 결제 위젯 진입
payment_success       — 결제 성공 (B/E에서 직접 전송 권장 — 보안)
payment_fail          — 결제 실패
```
공통 속성: `character_id`, `amount` (number, KRW), `payment_method` (string).
`payment_fail`만 추가로 `failure_reason` (string).

기획 문서(`docs/event-tracking.md`)에는 `payment_click` / `payment_complete`로 명시되어 있고 `payment_complete`는 B/E에서 직접 전송하기로 되어있다. 그 명명 규칙을 따를지, 위 4단계로 세분화할지는 결제 구현 시점에 결정.

---

## 7. 기획 vs 구현 갭 (참고용)

`docs/event-tracking.md`(기획, 13개)와 코드 구현(16개)의 차이:

### 기획에 있고 코드에 없음 (9개 — 미구현)
- `enter_character_select` — 캐릭터 선택 화면 진입 시각
- `result_received` — 무료 결과 수신 완료
- `unselected_character_shown` — 미선택 캐릭터 결과 유도 버튼 노출
- `unselected_character_click` — 미선택 캐릭터 유도 버튼 클릭
- `payment_click` — 결제 의도
- `paid_version_enter` — 유료 결과 페이지 진입
- `paid_version_complete_read` — 유료 결과 완독
- `share_click` — 공유 버튼 클릭
- `payment_complete` — 결제 완료 (B/E 직접 전송)

### 코드에 있고 기획에 없음 (12개 — 추가 구현)
- `info_form_view`, `info_form_submit` (기획의 `user_info_submit`에 해당하나 view 이벤트 추가)
- `survey_step_view`, `survey_step_submit`, `survey_freetext_submit`, `survey_freetext_skip` — 설문 4종
- `loading_enter`, `loading_slot_change`, `loading_done`, `loading_result_clicked` — 로딩 4종
- `story_scene_start`, `story_cut_view` — 스토리 2종

### 권장
1. 트래킹 플랜은 **현재 코드 기준 16개**를 등록 (실제 들어오고 있는 데이터와 일치)
2. 미구현된 9개 이벤트 중 비즈니스 임팩트가 큰 것(`payment_*`, `result_received`)을 우선순위로 구현
3. 구현 시 기획의 명명 규칙을 가능한 따르되, 이미 구현된 12개의 키와 충돌하지 않게 검토

---

## 8. 변경 이력

| 날짜 | 변경 |
| --- | --- |
| 2026-04-28 | 초안. 16개 이벤트 풀 스펙 + Amplitude UI 등록 가이드 + 기획 갭 정리. |
| 2026-04-28 | 16개 이벤트 등록 완료. UI 변경에 따라 "Approve & Publish" 단계 부재로 가이드 갱신. `isPlanned` 필드는 새 UI에서 신뢰할 수 없는 지표임을 명시. |
