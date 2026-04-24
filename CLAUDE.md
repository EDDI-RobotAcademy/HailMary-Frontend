# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

**도화선(導火線 / 桃花煞)** 은 서사 기반의 사주 해석 서비스다.  
사용자는 두 캐릭터(강연우, 한도윤) 중 한 명을 선택하여 각자의 해석 스타일로 자신의 사주 풀이를 받는다. 붉은 실타래로 상징되는 운명의 얽힘을 시네마틱하게 전달하는 것이 서비스의 핵심 경험이다.

### 서비스 흐름

```
시작 화면 → 인트로 스토리 → 캐릭터 선택 → 무료 사주 + 결제 유도 → 결제 사주 → 마무리
```

---

## Build & Development Commands

```bash
npm run dev      # Start Next.js development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- ESLint 9 with eslint-config-next
- State Management: Jotai (필요 시점에 도입)

---

## Path Alias

`@/*` maps to `./src/*`. Use `@/features/...`, `@/shared/...`, etc.

---

## 아키텍처 철학: Frontend DDD

### 왜 Frontend에서도 DDD인가?

1. **도메인 중심 설계** — UI, API 호출, 상태 관리가 아닌 실제 비즈니스/사용자 행동 중심으로 코드 구성
2. **관심사 분리** — 상태(Domain) / 행동(Hooks) / UI(Views)를 명확히 나눔 → 유지보수, 테스트, 확장성 향상
3. **의존성 방향 확립** — View → Hooks → Domain → API. Domain은 상위 계층에 의존하지 않고 순수하게 비즈니스 모델과 규칙만 정의

### 계층 구조

| 레이어     | 역할                                 | 위치                      |
| ---------- | ------------------------------------ | ------------------------- |
| **Domain** | 상태, Entity, 도메인 규칙, 순수 로직 | `features/[name]/domain/` |
| **Hooks**  | 행동/UseCase, 상태 변환, API 호출    | `features/[name]/hooks/`  |
| **Views**  | 화면 렌더링만 담당                   | `features/[name]/views/`  |
| **Shared** | 재사용 컴포넌트, 유틸, 공통 타입     | `shared/`                 |

**의존성 방향:** `Views → Hooks → Domain → API`

Domain은 Views/Hooks를 import하지 않는다. 역방향 import 절대 금지.

---

## Directory Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                      # → landing feature entry
│   ├── intro/page.tsx
│   └── select/page.tsx
│
├── features/                         # Feature 단위 패키지
│   ├── landing/
│   │   ├── domain/                   # 랜딩 상태, 도메인 모델
│   │   ├── hooks/                    # 행동, UseCase
│   │   ├── views/                    # UI 렌더링
│   │   └── index.ts                  # 외부 export
│   ├── intro/
│   │   ├── domain/
│   │   ├── hooks/
│   │   ├── views/
│   │   └── index.ts
│   ├── character-select/
│   │   ├── domain/                   # 캐릭터 목록, 선택 상태
│   │   ├── hooks/                    # 캐릭터 선택 행동
│   │   ├── views/                    # 캐릭터 선택 UI
│   │   └── index.ts
│   └── saju/
│       ├── domain/                   # SajuEntity, SajuState, SurveyAnswers
│       │   ├── entities.ts
│       │   ├── state.ts
│       │   └── characters.ts         # 강연우, 한도윤 데이터
│       ├── hooks/                    # useSajuCalculate, useCharacterSajuFlow, useCutProgression
│       ├── views/
│       │   ├── doyoon/               # 도윤 전용 뷰
│       │   ├── yeonwoo/              # 연우 전용 뷰
│       │   └── shared/               # 도윤·연우 공용 뷰 컴포넌트
│       └── index.ts
│
└── shared/                           # 재사용 가능한 자산
    ├── components/                   # stateless, reusable, pure UI
    ├── utils/
    │   └── api.ts                    # fetch wrapper (모든 HTTP 호출은 여기를 통해서만)
    └── types/                        # 공통 타입 정의
```

---

## Feature 구조

각 Feature는 Domain / Hooks / Views 3계층으로 구성된 독립 패키지다.

```
features/[feature-name]/
├── domain/               # 상태, Entity, 순수 도메인 규칙
│   ├── state.ts          # 상태 정의 (Jotai atoms 등)
│   ├── entities.ts       # Entity, ValueObject
│   └── ...
├── hooks/                # 행동/UseCase
│   └── use[Action].ts    # 상태 변환, API 호출
├── views/                # UI 렌더링만
│   ├── [Feature].tsx     # 최상위 뷰 컴포넌트
│   └── components/       # 뷰 전용 하위 컴포넌트
└── index.ts              # domain + hooks + views 외부 export
```

**계층별 원칙:**

- **Domain**: 상태와 순수 도메인 규칙만. API 호출, React 훅 금지.
- **Hooks**: 상태를 변환시키는 행동. Domain을 import해서 사용. API는 `shared/utils/api`를 통해서만.
- **Views**: 렌더링만. 비즈니스 로직 금지. 상태와 행동은 Hooks에서 import해서 연결.
- Feature 간 직접 import 금지. 공통 자산은 `shared/`로 승격.

**페이지에서 사용:**

```tsx
// app/select/page.tsx
import { CharacterSelect } from "@/features/character-select";

export default function SelectPage() {
  return <CharacterSelect />;
}
```

---

## Shared 구조

```
shared/
├── components/           # stateless, reusable, pure UI 컴포넌트
├── utils/
│   └── api.ts            # fetch wrapper
└── types/                # 공통 타입 정의
```

Feature 2개 이상에서 동일한 코드가 필요해지면 `shared/`로 올린다. 미리 올리지 않는다.

---

## 이벤트 트래킹

> **⚠️ "백엔드로 이벤트 전송"은 Amplitude를 의미한다. MySQL, Docker, 별도 서버 API가 아님.**

이 프로젝트는 별도 이벤트 수집 서버 없이 **Amplitude 단일 채널**로 모든 행동 데이터를 수집한다.
티켓이나 기획서에 "백엔드로 이벤트 전송"이라고 명시되어 있어도 Amplitude를 가리킨다.

- 이벤트 발화: `shared/utils/analytics.ts`의 `trackEvent()` 사용
- Amplitude SDK 초기화·연결: **DA팀 담당** (F/E는 `trackEvent()` 호출만 담당)
- 이벤트 스펙: `docs/event-tracking.md` 참고

```typescript
// 올바른 사용법
trackEvent("scenario_progress", { chapter_index: stepIndex });

// 틀린 접근 — 이벤트 목적으로 api.post() 사용 금지
api.post("/api/events/...", payload); // ❌
```

---

## 백엔드 연동

- 사주 계산, 인증, 결제 등 비즈니스 로직은 백엔드에만 존재한다.
- 프론트는 API 호출, 응답 타입 정의, 클라이언트 측 상태 관리만 담당한다.
- HTTP 호출은 `shared/utils/api.ts`의 wrapper를 통해서만 수행한다.
- API 계약: `docs/backend-integration.md`가 단일 소스.

```typescript
// shared/utils/api.ts
export const api = {
  get: <T>(path: string) => fetch(...).then(r => r.json() as Promise<T>),
  post: <T>(path: string, body: unknown) => ...,
};
```

---

## 디자인 변경 대응 원칙

1. **디자인은 Views에만 영향을 준다.** Domain과 Hooks는 디자인 변경에 영향받지 않아야 한다.
2. **데이터와 프레젠테이션 분리.** Views는 props로 데이터를 받는다. 내부에서 fetch하지 않는다.
3. **디자인 토큰 중앙화.** 색상, 폰트, 간격은 Tailwind config 및 CSS 변수로 관리한다.
4. **확정 전 복잡 이펙트 구현 연기.** 클립패스 애니메이션, 트랜지션 등은 디자인 확정 후 구현.

---

## Claude Code 작업 가이드라인

### 작업 범위

1. **명시적으로 요청받지 않은 파일은 건드리지 않는다.**
2. 새 의존성(npm install) 추가 전 반드시 사용자 확인.

### 커뮤니케이션

1. 구현 전 **5줄 이내 요약 플랜** 제시.
2. 가정(assumption)이 필요하면 명시적으로 선언.
3. **드라이런 요청 시 코드를 한 줄도 쓰지 말 것**. 파일 경로와 역할 설명만 제공.

### 구조 원칙

1. **의존성 방향을 지킬 것.** Views → Hooks → Domain → API. 역방향 import 금지.
2. **Domain은 순수하게.** API 호출, React 훅 직접 사용 금지.
3. **Feature 간 직접 import 금지.** 공통 코드는 `shared/`로 승격.
4. **Views는 렌더링만.** 비즈니스 로직을 Views에 직접 작성하지 않는다.
5. **shared/utils/api.ts를 통해서만 HTTP 호출.**

### 구현 원칙

1. **YAGNI.** 지금 쓰지 않는 추상화, 레이어, 파일을 만들지 않는다.
2. **Types first.** 기능 구현 전 타입 정의부터. `any` 사용 금지.
3. **Props-driven.** Views 내부 fetch/상태 관리보다 props 전달을 선호.
4. **Feature 독립성.** 각 Feature는 다른 Feature의 구현 세부사항을 몰라야 한다.

### 금지 사항

1. 요청받지 않은 리팩토링 금지.
2. Views에서 직접 API 호출 금지 (Hooks를 통해).
3. Domain에서 다른 Feature import 금지.
4. Feature 간 직접 참조 금지.
5. 과한 추상화 도입 금지.
