# Amplitude 연동 가이드

> F/E 이벤트 트래킹 현황 및 DA팀 SDK 연결 작업 범위 정리

---

## 1. 발화 이벤트 전체 목록

| 이벤트명 | 발화 시점 | 페이로드 | 발화 위치 |
|---|---|---|---|
| `landing_enter` | 랜딩 페이지 마운트 | - | `src/features/landing/hooks/useLanding.ts` |
| `intro_step_complete` | 시작하기 버튼 클릭, 인트로 각 씬 탭 | `{ step }` | `src/features/landing/hooks/useLanding.ts`, `src/features/intro/hooks/useIntroScene.ts` |
| `scenario_progress` | 인트로 씬 탭 진행 | `{ chapter_index }` | `src/features/intro/hooks/useIntroScene.ts` |
| `character_select` | 캐릭터 선택 확정 | `{ character_id }` | `src/features/character-select/hooks/useCharacterSelect.ts` |
| `story_scene_start` | 사주 씬 진입 | `{ character_id }` | `src/features/saju/views/doyoon/DoyoonSajuScene.tsx`, `src/features/saju/views/yeonwoo/YeonwooSajuScene.tsx` |
| `story_cut_view` | 각 컷 진입마다 | `{ character_id, cut_index, cut_type }` | `src/features/saju/views/doyoon/DoyoonSajuScene.tsx`, `src/features/saju/views/yeonwoo/YeonwooSajuScene.tsx` |

### 공통 자동 포함 필드

모든 이벤트에 아래 필드가 자동으로 포함된다.

| 필드 | 설명 | 생성 방식 |
|---|---|---|
| `device_id` | 익명 사용자 식별자 | `localStorage`에 UUID 생성·보관 |
| `session_id` | 세션 식별자 | `sessionStorage`에 UUID 생성·보관 |
| `timestamp` | 이벤트 발생 시각 | `new Date().toISOString()` |

---

## 2. DA팀 SDK 연결 작업 범위

### Step 1 — SDK 설치

```bash
npm install @amplitude/analytics-browser
```

### Step 2 — 초기화 (`src/app/layout.tsx`)

```ts
import * as amplitude from "@amplitude/analytics-browser";

amplitude.init("YOUR_API_KEY", { defaultTracking: false });
```

### Step 3 — `src/shared/utils/analytics.ts` 수정

**삭제할 부분 (24~28번째 줄)**
```ts
// ▼ 아래 블록 삭제
declare const amplitude:
  | { track: (name: string, props?: Record<string, unknown>) => void }
  | undefined;
// ▲ 삭제
```

**추가할 부분 (파일 상단)**
```ts
import * as amplitude from "@amplitude/analytics-browser";
```

`trackEvent` 내부 로직은 변경 없이 그대로 유지한다.

---

## 3. 현재 상태 (SDK 미연결)

- 실제 Amplitude 전송은 되지 않는 상태
- 개발 환경(`npm run dev`)에서 브라우저 콘솔에 아래 형태로 로그 출력되어 발화 시점 확인 가능

```
[Analytics] story_cut_view { device_id: "...", session_id: "...", timestamp: "...", character_id: "doyoon", cut_index: 0, cut_type: "dialogue" }
```

- F/E 추가 작업 없이 SDK 연결만 완료되면 즉시 전송 시작
