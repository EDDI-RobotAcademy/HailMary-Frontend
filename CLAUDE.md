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

현재 이터레이션 목표는 **캐릭터 선택 화면까지 구현**이다.

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

`@/*` maps to `./src/*`. Use `@/products/...`, `@/features/...`, `@/components/...`, etc.

---

## 아키텍처 방침

### 하이브리드 구조: Product + Feature

도화선은 서사 중심 서비스이므로, 전형적인 CRUD 앱과 다른 구조를 택한다.

| 구분        | 역할                          | 예시                   |
| ----------- | ----------------------------- | ---------------------- |
| **Product** | 하나의 완결된 사주 상품 경험  | 도화선                 |
| **Scene**   | Product 내부의 화면 단위 연출 | 캐릭터 선택, 웹툰 해석 |
| **Feature** | Product 간 재사용되는 기능    | 인증, 결제             |

**왜 이 구조인가:**

- 도화선은 선형 서사이므로 DDD 풀 구조는 과하다.
- 그러나 단순 Scene-only 구조는 두 번째 상품 추가 시 대응 불가하다.
- `products/` 폴더 하나로 미래 플랫폼 확장 여지를 열어둔다.

### 확장 로드맵

```
현재:   products/dohwaseon/              # 도화선 단독
미래:   products/dohwaseon/              # 도화선
        products/{next-product}/         # 다른 사주 상품 추가 시
        platform/home/                   # 상품 카탈로그 홈 (필요 시)
```

두 번째 상품이 실제로 기획되기 전까지 `platform/` 레이어는 만들지 않는다. **YAGNI 원칙 준수.**

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # → 도화선 landing scene
│   ├── intro/page.tsx            # → intro scene
│   └── select/page.tsx           # → character-select scene
│
├── products/                     # 사주 상품별 경험
│   └── dohwaseon/                # 도화선
│       ├── config.ts             # 씬 순서, 메타데이터
│       ├── scenes/               # 씬별 UI와 연출
│       │   ├── landing/
│       │   ├── intro/
│       │   ├── character-select/
│       │   └── saju/             # 무료 사주 씬 (캐릭터별 + 공용)
│       │       ├── doyoon/       # 도윤 씬 진입 + 도윤 전용 data
│       │       ├── yeonwoo/      # 연우 씬 진입 + 연우 전용 data
│       │       └── shared/       # 도윤/연우 공용 자산
│       │           ├── components/  # InfoForm, DialogueOverlay, Survey* 등
│       │           ├── hooks/       # useCutProgression, useCharacterSajuFlow
│       │           ├── cuts/        # LoadingCut, SurveyCut, CtaOverlay
│       │           └── types.ts     # SurveyAnswers 등 공용 타입
│       └── data/                 # 스토리 스크립트, 캐릭터 데이터
│           ├── characters.ts     # 강연우, 한도윤 데이터
│           └── story.ts          # 인트로 대사, 세계관
│
├── features/                     # Product 간 재사용 기능
│   └── saju/                     # 사주 계산 API·훅·타입 (백엔드 계약)
│       ├── api.ts                # postSajuFree, postSajuSurvey
│       ├── hooks.ts              # useSajuCalculate
│       ├── types.ts              # SajuFreeResponse, Pillar 등
│       └── constants.ts
│
├── components/                   # 공통 UI 컴포넌트
│   ├── Button.tsx
│   └── ...
│
├── lib/                          # 유틸, API 클라이언트
│   ├── api.ts                    # fetch wrapper
│   ├── env.ts                    # 환경 변수 접근
│   └── types.ts                  # 공통 타입
│
└── styles/
    └── globals.css
```

---

## Scene 구조

각 Scene은 자체 연출을 가지는 독립 모듈이다.

```
products/dohwaseon/scenes/{scene-name}/
├── {SceneName}Scene.tsx          # 씬 진입 컴포넌트
├── use{SceneName}.ts             # 씬 내부 상태/로직 (필요 시)
└── components/                   # 씬 전용 하위 컴포넌트
    └── ...
```

**Scene 원칙:**

- Scene은 UI와 연출을 담당한다.
- 비즈니스 로직은 `features/` 또는 `lib/`에서 import해서 쓴다.
- Scene 간 직접 import 금지. 공통 컴포넌트는 `components/`로 승격.
- 씬별 애니메이션, 스타일, 배경 이미지는 해당 씬 폴더 내부에 격리.
- **같은 상품 내 여러 씬이 공유하는 자산**은 해당 씬 그룹 하위에 `shared/` 폴더로 격리. 예: `scenes/saju/shared/{components,hooks,cuts,types.ts}` — 도윤·연우 사주 씬이 공통으로 쓰는 자산. 타 상품이나 타 씬 그룹에서 참조 금지.

---

## Feature 추가 원칙

Feature는 **실제로 필요해질 때** 만든다. 미리 만들지 않는다.

| Feature   | 추가 예정 시점       | 역할                          |
| --------- | -------------------- | ----------------------------- |
| `auth`    | 무료 사주 씬 착수 시 | 로그인, 세션                  |
| `saju`    | 무료 사주 씬 착수 시 | 사주 계산 API 호출, 결과 타입 |
| `payment` | 결제 사주 진입 전    | 결제 플로우                   |

Feature 추가 시 구조:

```
features/{name}/
├── api.ts         # 백엔드 API 호출
├── hooks.ts       # React hook (상태 관리)
├── types.ts       # 타입 정의
└── index.ts       # 외부 export
```

과도한 레이어 분리(`domain/application/infrastructure`)는 현 시점에선 불필요하다. 복잡도가 올라오면 그때 레이어를 쪼갠다.

---

## 디자인 변경 대응 원칙

디자인은 개발 도중에도 변경된다. 영향 범위를 최소화하기 위해:

1. **디자인은 Scene과 components/에만 영향을 준다.**  
   Feature의 로직, lib/의 유틸은 디자인 변경에 영향받지 않아야 한다.

2. **데이터와 프레젠테이션 분리.**  
   컴포넌트는 props로 데이터를 받는다. 내부에서 fetch하지 않는다.

3. **디자인 토큰 중앙화.**  
   색상, 폰트, 간격은 Tailwind config 및 CSS 변수로 관리한다.

4. **확정 전 복잡 이펙트 구현 연기.**  
   클립패스 애니메이션, 트랜지션 등은 디자인 확정 후 구현. 초기에는 정적 플레이스홀더로 대체.

---

## 백엔드 연동

프론트의 `features/`는 백엔드 도메인과 짝을 이루지만 독립적으로 관리된다.

- 사주 계산, 인증, 결제 등 비즈니스 로직은 백엔드에만 존재한다.
- 프론트는 API 호출, 응답 타입 정의, 클라이언트 측 상태 관리만 담당한다.
- API 계약이 확정되면 해당 Feature의 `types.ts`에 반영한다.

HTTP 호출은 `lib/api.ts`의 wrapper를 통해서만 수행한다.

```typescript
// lib/api.ts
export const api = {
  get: <T>(path: string) => fetch(...).then(r => r.json() as Promise<T>),
  post: <T>(path: string, body: unknown) => ...,
};
```

---

## Claude Code 작업 가이드라인

이 프로젝트에서 Claude Code가 반드시 지켜야 할 규칙.

### 작업 범위

1. **한 번에 3개 이하의 파일만 수정/생성**한다.
2. **명시적으로 요청받지 않은 파일은 건드리지 않는다.**
3. "아키텍처 전체 구현" 같은 광범위 작업은 거부하고, 사용자에게 범위를 좁혀달라고 요청한다.
4. 작업 완료 후 **"다음 단계 제안" 금지**. 사용자의 다음 지시를 대기한다.
5. 새 의존성(npm install) 추가 전 반드시 사용자 확인.

### 커뮤니케이션

1. 구현 전 **5줄 이내 요약 플랜** 제시.
2. 불확실한 부분은 구현하지 말고 질문.
3. 가정(assumption)이 필요하면 명시적으로 선언.
4. **드라이런 요청 시 코드를 한 줄도 쓰지 말 것**. 파일 경로와 역할 설명만 제공.

### 구조 원칙

1. **Product 경계를 지킬 것.** `products/dohwaseon/` 내부 코드는 다른 product에 의존하지 않는다.
2. **Feature는 product를 모른다.** `features/auth/`는 "도화선"을 직접 참조하지 않는다.
3. **Scene 간 직접 import 금지.** 공통 코드는 상위 레벨로 승격.
4. **Scene은 비즈니스 로직을 직접 수행하지 않는다.** Feature의 hook 또는 lib의 유틸을 호출한다.
5. **components/는 stateless, reusable, pure UI만.** 비즈니스 로직을 포함하지 않는다.

### 구현 원칙

1. **YAGNI.** 지금 쓰지 않는 추상화, 레이어, 파일을 만들지 않는다.
2. **Types first.** 기능 구현 전 타입 정의부터. `any` 사용 금지.
3. **Props-driven.** 컴포넌트 내부 fetch/상태 관리보다 props 전달을 선호.
4. **Scene 독립성.** 각 씬은 다른 씬의 구현 세부사항을 몰라야 한다.

### 금지 사항

1. 요청받지 않은 리팩토링 금지.
2. Scene에서 직접 API 호출 금지 (Feature hook을 통해).
3. Feature 내부에서 다른 Feature import 금지.
4. `products/` 외부에서 특정 product의 데이터 직접 참조 금지.
5. 부트캠프/학습용 "과한 구조" 도입 금지 (DDD 4-layer, 복잡한 추상화 등).

---
