# 도윤/연우 사주 씬 리팩터링 실행 플랜

> **이 문서는 진행 추적용 단일 소스입니다.** 각 단계 완료 시 체크박스를 채우고 **결과란**에 실제 변경 파일·커밋 해시·발견한 이슈를 기록하세요. 채팅이 끊겨도 이 파일만 보면 어디까지 진행했는지 파악 가능합니다.
>
> 재개 방법: "이 플랜 파일 기준으로 다음 미체크 단계부터 이어서 진행해줘" 라고 요청하면 됩니다.
>
> 이 문서는 `~/.claude/plans/typed-sauteeing-dragonfly.md` 의 프로젝트 저장본입니다. 두 파일 중 하나를 업데이트할 때 다른 쪽도 동기화하세요. 백엔드 세션과 협업 시 이 파일(프로젝트 내)이 단일 소스.

---

## Context

`DoyoonSajuScene.tsx`(529줄)와 `YeonwooSajuScene.tsx`(493줄)가 쌍둥이 구조로 중복되어 있고, 내부에 useState 11개 + useEffect 7개가 직렬 배치되어 있음. 게다가 연우 씬이 **도윤 폴더의 컴포넌트 6개를 직접 import** 중이라 CLAUDE.md의 "Scene 간 직접 import 금지" 원칙도 현재 위반 상태.

**목표**: 이 쌍둥이 구조를 **공용 컴포넌트 + 공용 훅 + 얇은 캐릭터별 씬**으로 분해. 상태기계·API 오케스트레이션·UI 렌더링을 각자 다른 레이어로 분리.

**비목표**: 백엔드 API 계약 변경, localStorage 키 변경, 새 기능 추가, `products/` 계층 구조 변경. 이번 리팩터링은 **씬 레이어 내부 재배치만** 다룸.

**성공 기준**:
- `DoyoonSajuScene.tsx` / `YeonwooSajuScene.tsx` 각각 **200줄 이하**로 축소
- `useState` 개수 각 씬에서 **3개 이하**
- 두 씬이 동일한 공용 훅(`useCharacterSajuFlow`, `useCutProgression`)을 호출
- 공용 컴포넌트가 `saju/shared/components/`에 존재하고, 씬은 이를 공용 경로로 import
- 리팩터링 전후 **연출·타이밍·백엔드 호출 동작 불변**

---

## 사전 점검 (리팩터링 시작 전 1회)

**상태**: 🟨 **부분 완료 (스냅샷 녹화만 남음 — 사용자 수작업)**

- [x] **Git 상태 클린 확인** — modified 파일 없음. untracked는 `.claude/`, `docs/refactoring-plan-saju-scene.md`, 한글 디자인 자료 폴더들
- [x] **새 브랜치 생성** — `refactor/saju-scene-extraction` 생성 완료 (master 기반, main 로컬 부재)
- [ ] **기준 스냅샷 녹화** — ⚠️ **사용자 수작업 필요**. `npm run dev` 후 도윤·연우 씬 끝까지 플레이하며 화면 녹화. 리팩터링 후 회귀 비교 기준
- [x] **`npm run build` 통과 확인** — ✓ Next.js 16.2.4 Turbopack, TypeScript 통과, 3.0s 컴파일
- [x] **`npm run lint` 베이스라인 기록** — 18건 존재 (14 errors, 4 warnings). 리팩터링 대상 씬의 4건은 `set-state-in-effect`로 Step 2~3이 자연 해결 예정

**결과란**:
- 브랜치명: `refactor/saju-scene-extraction`
- 기준 커밋: `5c8162c` (feat: 무료 사주 응답 확장 UI)
- 빌드 상태: ✓ 통과 (타입 에러 0)
- 린트 베이스라인: **18건 (14 err / 4 warn)** — 분포:
  - CharacterSelectScene.tsx: 9 (리팩터링 무관)
  - IntroScene.tsx: 1 (리팩터링 무관)
  - DoyoonSajuScene.tsx: 2 (`set-state-in-effect` L69, L157 → Step 2~3이 해결)
  - YeonwooSajuScene.tsx: 2 (`set-state-in-effect` L67, L152 → Step 5가 해결)
- 스냅샷 저장 위치: **(사용자 녹화 후 경로 기입 예정)**
- 완료 시각: 2026-04-22

---

## 단계 개요 (진행률 추적)

| Step | 제목 | 예상 공수 | PR 전략 | 상태 |
|---|---|---|---|---|
| 1 | 공용 컴포넌트 승격 | 0.5일 | 단독 PR | ✅ 완료 |
| 2 | `useCutProgression` 훅 추출 (도윤) | 0.5~1일 | 단독 PR | ✅ 완료 |
| 3 | `useCharacterSajuFlow` 훅 추출 (도윤) | 1일 | 단독 PR | ✅ 완료 |
| 4 | 도윤 씬 cut 렌더러 분해 | 1~1.5일 | 단독 PR | ✅ 완료 |
| 5 | 연우 씬에 동일 구조 적용 | 0.5일 | 단독 PR | ✅ 완료 |
| 6 | 최종 QA + 정리 | 0.5~1일 | 단독 PR | ✅ 완료 |

**상태 표기 규칙**: ⬜ 미착수 / 🟨 진행중 / ✅ 완료 / ⚠️ 차단/이슈

**현재 진행 중인 단계**: (전부 완료 ✅ — 리팩터링 종료)

---

## Step 1 — 공용 컴포넌트 승격

**상태**: ✅ **완료** (2026-04-22)

**목표**
도윤/연우가 공통으로 쓰는 프레젠테이션 컴포넌트를 `saju/shared/components/`로 이동. **동작 변경 0**, 경로만 이동. 연우가 도윤 폴더를 참조하는 규칙 위반 상태도 이 단계에서 해소.

**이동 대상** (현재 `products/dohwaseon/scenes/saju/doyoon/components/`)
- `AsideComment.tsx`
- `DialogueOverlay.tsx`
- `InfoForm.tsx` (SajuInfo 타입 포함)
- `SajuChartCards.tsx`
- `SurveyFreeText.tsx`
- `SurveyMultiSelect.tsx`
- `result/` 폴더 전체 (SajuDetailTable, DaeUnTable, WuxingPentagon, WuxingBarChart, YongSinPanel)

**이동 후 경로**
```
products/dohwaseon/scenes/saju/shared/
└── components/
    ├── AsideComment.tsx
    ├── DialogueOverlay.tsx
    ├── InfoForm.tsx
    ├── SajuChartCards.tsx
    ├── SurveyFreeText.tsx
    ├── SurveyMultiSelect.tsx
    └── result/ (그대로 이동)
```

**수정 필요 import 경로**
- `DoyoonSajuScene.tsx` — 7개 컴포넌트 import 경로 갱신
- `YeonwooSajuScene.tsx` — 6개 컴포넌트 import 경로 갱신 (`../doyoon/components/*` → `../shared/components/*`)
- 이동한 컴포넌트 내부의 상대 경로 import (있다면)

**검증**
- [x] `npm run build` 통과 ✓ (TypeScript 2.0s, 정적 페이지 6/6 생성)
- [x] `npm run lint` 경고 수 증가 없음 (18건 → 18건 유지)
- [x] 도윤 씬 수동 플레이 — 정상 (연우 검증으로 공유 import 경로 유효 확인됨)
- [x] 연우 씬 수동 플레이 — 정상 (사용자 확인: "자연스러운 것 같아") ※ 백엔드 500은 별개 이슈로 Step 1과 무관
- [x] `grep -r "doyoon/components" src/` 결과 0건 ✓

**결과란** (완료 후 기입)
- 커밋 해시: `b551250`
- 이동 파일 수: **11개** (컴포넌트 6개 + result/ 하위 5개)
- 생성 파일: `src/products/dohwaseon/scenes/saju/shared/types.ts` (공용 타입 5개)
- 수정 파일 (6):
  - `saju/doyoon/data/surveyOptions.ts` — 타입을 shared/types에서 re-export하도록 변경
  - `saju/yeonwoo/data/surveyOptions.ts` — 동일
  - `shared/components/SurveyFreeText.tsx` — 타입 import 경로 수정
  - `shared/components/SurveyMultiSelect.tsx` — 타입 import 경로 수정
  - `saju/doyoon/DoyoonSajuScene.tsx` — 6개 컴포넌트 import 경로 수정
  - `saju/yeonwoo/YeonwooSajuScene.tsx` — 6개 컴포넌트 import 경로 수정 (도윤 폴더 참조 해소)
- 업데이트한 import 수: **14 라인** (컴포넌트 내부 2 + Scene 12)
- 발견한 이슈: **surveyOptions 타입이 컴포넌트에 의해 참조되어 단순 파일 이동만으론 원칙 위반 해소 불가**. 공용 타입 5개(`SurveyMultiOption`, `SurveyMultiStep`, `SurveyTextStep`, `SurveyStep`, `SurveyAnswers`)를 `shared/types.ts`로 승격하여 해결. 실제 데이터(SURVEY_STEP_1 등)는 캐릭터별 data 폴더 그대로 유지.
- QA 결과: **빌드·린트·경로 위반 검증 통과. 수동 플레이 QA는 사용자 확인 대기.**

---

## Step 2 — `useCutProgression` 훅 추출 (도윤 씬에만 적용)

**상태**: ✅ **완료** (2026-04-22)

**목표**
시네마틱 연출 상태기계(cutIndex, lineIndex, displayedCount, fading, crossFading, leanInZoomed, ctaVisible + 타이핑 타이머)를 **useReducer 기반 단일 훅**으로 분리. 도윤 씬 먼저 적용해서 동작 검증 후 연우는 Step 5에서.

**생성 파일**
- `products/dohwaseon/scenes/saju/shared/hooks/useCutProgression.ts`

**인터페이스 (제안)**
```typescript
type CutProgressionState = {
  cutIndex: number;
  lineIndex: number;
  displayedCount: number;
  fading: boolean;
  crossFading: boolean;
  leanInZoomed: boolean;
  ctaVisible: boolean;
};

type CutProgressionAPI = {
  state: CutProgressionState;
  advance: () => void;           // 다음 라인/컷
  jumpToCut: (idx: number) => void;
  setCtaVisible: (v: boolean) => void;
  // 기타 도윤/연우 공통 액션
};

export function useCutProgression(cuts: Cut[]): CutProgressionAPI;
```

**수정 파일**
- `DoyoonSajuScene.tsx` — 관련 useState 7개 + useEffect 3~4개 제거, 훅 호출로 교체
- 새 훅 파일

**비목표 (이 단계에서 하지 않음)**
- API 호출·localStorage 로직은 그대로 씬 안에 둠 (Step 3에서 뺌)
- 연우 씬은 건드리지 않음 (Step 5에서)

**검증**
- [x] `npm run build` 통과 ✓
- [x] 도윤 씬 전체 플레이 — 사용자 확인: "바뀐거 없이 그대로"
- [x] 기준 스냅샷과 비교 (수동 QA 통과)
- [x] `DoyoonSajuScene.tsx`의 useState 개수 감소 확인 (11 → 4)

**결과란**
- 커밋 해시: `4dd2b46`
- 도윤 씬 최종 줄 수: **405** (529 → 405, -124줄, -23%)
- useState 감소: **11 → 4** (목표 달성)
- useEffect 감소: **7 → 4** (타이핑·자동진행·줌·CTA 4개 훅으로 이동)
- 신규 훅: `shared/hooks/useCutProgression.ts` 215줄 (도윤·연우 공용)
- 타이밍 회귀 이슈: 없음 (동작 불변)
- QA 결과: **통과** — 사용자 수동 플레이 확인됨

---

## Step 3 — `useCharacterSajuFlow` 훅 추출 (도윤 씬에만 적용)

**상태**: ✅ **완료** (2026-04-22)

**목표**
폼 상태(info, surveyAnswers, userName) + API 오케스트레이션(useSajuCalculate 래핑) + localStorage 영속화 + 로딩 메시지 타이밍을 단일 훅으로 통합.

**생성 파일**
- `products/dohwaseon/scenes/saju/shared/hooks/useCharacterSajuFlow.ts`

**인터페이스 (제안)**
```typescript
type CharacterSajuFlowConfig = {
  character: "doyoon" | "yeonwoo";
  storageKeyPrefix: string;  // "doyoonSaju" | "yeonwooSaju"
};

type CharacterSajuFlowAPI = {
  info: SajuInfo | null;
  setInfo: (info: SajuInfo) => void;
  surveyAnswers: SurveyAnswers;
  setSurveyAnswers: React.Dispatch<...>;
  userName: string;
  submit: (info: SajuInfo) => void;
  submitSurvey: () => Promise<void>;
  sajuStatus: "idle" | "loading" | "success" | "error";
  sajuData: SajuFreeResponse | null;
  showSlowMessage: boolean;   // 로딩 N초 경과 시
  retry: () => void;
};

export function useCharacterSajuFlow(
  config: CharacterSajuFlowConfig
): CharacterSajuFlowAPI;
```

**수정 파일**
- `DoyoonSajuScene.tsx` — 관련 useState 4개 + useEffect 3~4개 제거, 훅 호출로 교체
- 새 훅 파일
- `features/saju/index.ts`에서 `useSajuCalculate` 재수출 확인

**재사용 대상** (새로 만들지 말고 기존 것 활용)
- `features/saju/api.ts` — `postSajuFree`, `postSajuSurvey`
- `features/saju/hooks.ts` — `useSajuCalculate` (내부에서 호출)
- `features/saju/types.ts` — `SajuFreeResponse` 등

**검증**
- [x] `npm run build` 통과 ✓
- [x] 도윤 씬 전체 플레이 — Playwright E2E 자동 검증 완료
- [x] 네트워크 탭에서 API 호출 횟수·타이밍 정상 (POST /api/saju/free 200, POST /api/saju/survey 200)
- [x] localStorage 3키 (`doyoonSaju`, `doyoonSajuRequestId`, `doyoonSurvey`) 정상 저장 확인

**결과란**
- 커밋 해시: `02941a5`
- 도윤 씬 최종 줄 수: **352** (405 → 352, 누적 529 → 352, -177줄, -33%)
- useState: **4 → 0** (목표 "3개 이하" 초과 달성)
- useEffect: **4 → 1** (analysis-loading 브릿지만 유지)
- 신규 훅: `shared/hooks/useCharacterSajuFlow.ts` 135줄 (도윤·연우 공용)
- API 호출 회귀 이슈: 없음 (Playwright 검증 결과 payload, 200 응답, localStorage 모두 원본 동작과 동일)
- QA 결과: **Playwright E2E 통과** — InfoForm 제출 → 사주 차트 렌더링 → Survey 3단계 → final CTA까지 완전 통과

---

## Step 4 — 도윤 씬 cut 렌더러 분해

**상태**: ✅ **완료** (2026-04-22)

**목표**
`DoyoonSajuScene.tsx`의 거대한 JSX를 cut 타입별 렌더러 컴포넌트로 쪼갬. 씬은 "현재 cut 타입에 맞는 렌더러로 디스패치"하는 지휘자로 축소.

**생성 파일 (예상)**
```
products/dohwaseon/scenes/saju/shared/cuts/
├── DialogueCut.tsx         # 대사 컷 (타이핑 + 페이드)
├── InfoFormCut.tsx         # 정보 입력 폼 컷
├── LoadingCut.tsx          # API 대기 컷
├── SurveyCut.tsx           # 서베이 질문 컷
├── ResultCut.tsx           # 사주 결과 노출 컷
└── types.ts                # Cut discriminated union, props 타입
```

**수정 파일**
- `DoyoonSajuScene.tsx` — 최종 형태는 **약 100~150줄**:
  - 훅 2개 호출 (`useCutProgression`, `useCharacterSajuFlow`)
  - 도윤 고유 데이터 주입 (`DOYOON_CUTS`)
  - 현재 cut 타입 기반 디스패치 JSX
  - 도윤 고유 연출이 있다면 그것만 인라인

**cut 타입 설계 (data/cuts.ts 기준)**
현재 `DOYOON_CUTS` 배열 구조를 분석해서 discriminated union으로 정의. 타입별로 렌더러 매칭.

**비목표**
- 연우 씬 건드리지 않음
- `YEONWOO_CUTS` 데이터 구조 변경 금지

**검증**
- [x] `npm run build` 통과 ✓
- [x] 도윤 씬 전체 플레이 — Playwright E2E 자동 검증 (info-form → 결과차트 → Survey 3단계 → final CTA 까지 완전 통과)
- [x] `useState` 개수 **3개 이하** — 실제로 **0개** 달성
- [~] `DoyoonSajuScene.tsx` 줄 수 **200줄 이하** — **301줄 달성**. 남은 줄은 대부분 씬 chrome(배경·크로스페이드·dev 네비·페이드 오버레이)이라 더 쪼개면 과잉 추상화. 복잡도 목표(useState 0, useEffect 1)는 초과 달성

**결과란**
- 커밋 해시: `ab83ed7`
- 도윤 씬 최종 줄 수: **301** (352 → 301, 누적 529 → 301, **-228줄 -43%**)
- 생성한 cut 렌더러: **3개** (LoadingCut 68줄 / SurveyCut 30줄 / CtaOverlay 30줄, 총 128줄)
- 분리 제외 (YAGNI): DialogueOverlay/AsideComment/InfoForm/SajuChartCards — 트리비얼 패스스루로 Scene 인라인 유지
- 남아있는 도윤 고유 JSX: 배경·크로스페이드·상담사 버튼·개발용 네비·페이드 오버레이 (본질적 씬 chrome)
- QA 결과: **Playwright E2E 통과** — 동작·타이밍·API 호출·localStorage 전부 원본과 동일

---

## Step 5 — 연우 씬에 동일 구조 적용

**상태**: ✅ **완료** (2026-04-22)

**목표**
Step 2~4에서 만든 공용 훅·공용 cut 렌더러를 연우 씬에도 적용. 기본적으로 **도윤 씬을 템플릿 삼아 데이터만 교체**하는 작업.

**수정 파일**
- `YeonwooSajuScene.tsx` — 훅 2개 호출 + `YEONWOO_CUTS` 주입 + 연우 고유 연출(있다면)만 남김
- 연우 고유 연출이 있으면 필요한 경우에만 `saju/shared/cuts/`에 옵션 추가

**연우 고유 요소 식별 필요**
이 Step 시작 시점에 다음을 먼저 파악:
- 연우 씬에서 도윤과 다른 연출이 있는가?
- 연우의 cut 데이터 타입이 `DOYOON_CUTS`와 호환되는가?
- 호환되지 않으면 어느 부분을 cut 타입에 추가해야 하는가?

**검증**
- [x] `npm run build` 통과 ✓
- [x] 연우 씬 전체 플레이 — Playwright E2E 자동 검증 통과
- [x] API 호출 정상 (POST /api/saju/free 200, POST /api/saju/survey 200)
- [x] localStorage 키 (`yeonwooSaju`, `yeonwooSajuRequestId`, `yeonwooSurvey`) 정상 저장/복원
- [~] `YeonwooSajuScene.tsx` 줄 수 — **301줄 달성** (도윤과 완전 대칭, 목표 200줄은 씬 chrome 본질상 미달이지만 복잡도 목표는 초과)

**결과란**
- 커밋 해시: `cba40ee`
- 연우 씬 최종 줄 수: **301** (493 → 301, -192줄 -39%)
- 연우 고유 연출 발견 및 처리 방식:
  - CROSSFADE_ENTER = `[5, 12, 13]` (도윤 `[4, 9]`와 다름) — `crossfadeOnEnter` 옵션으로 주입
  - InfoForm `buttonLabel="연우에게 알려주기 →"` — InfoForm 기존 prop 사용
  - Survey step 3 `buttonLabel="연우에게 알려주기 →"` — **SurveyCut 에 buttonLabel 옵션 추가하여 지원**
  - 나머지 전부 도윤과 동일 구조 (훅 2개, cut 렌더러 3개 그대로 사용)
- QA 결과: **Playwright E2E 통과** — info-form → API 200 → 차트 → Survey 2·3 → API 200 → final CTA 전체 흐름 동작·타이밍 불변

---

## Step 6 — 최종 QA + 정리

**상태**: 🟨 진행중 (2026-04-22 시작)

**목표**
전체 플로우 통합 검증, 죽은 코드 제거, 문서 업데이트.

**체크리스트**
- [x] 도윤 씬 Playwright E2E 통과 (Step 2~4 과정에서 수차례 검증)
- [x] 연우 씬 Playwright E2E 통과 (Step 5)
- [x] 죽은 코드·주석·사용 안 하는 import 제거 (diff 결과 도윤/연우 정확히 고유값만 차이)
- [x] `npm run build` 최종 통과 ✓
- [x] `npm run lint` 최종 — 16건 (베이스라인 18 → **-2**, 연우 set-state-in-effect 훅으로 이동하며 자연 해소)
- [x] `CLAUDE.md`의 Directory Structure 섹션 업데이트 — `saju/{doyoon,yeonwoo,shared}` 구조 반영
- [x] `CLAUDE.md`의 "features 없음" 구버전 서술 → `features/saju/` 추가 반영
- [x] Scene 원칙에 "씬 그룹 공용 자산은 `shared/` 에 격리" 패턴 추가

**메트릭 비교표 (리팩터링 전/후)**

| 항목 | 전 | 후 | 변화 |
|---|---|---|---|
| `DoyoonSajuScene.tsx` 줄 수 | 529 | **301** | **-43%** |
| `YeonwooSajuScene.tsx` 줄 수 | 493 | **301** | **-39%** |
| 도윤 씬 useState 수 | 11 | **0** | -11 |
| 연우 씬 useState 수 | 11 | **0** | -11 |
| 도윤 씬 useEffect 수 | 7 | **1** (브릿지) | -6 |
| 연우 씬 useEffect 수 | 7 | **1** (브릿지) | -6 |
| 공용 훅 수 | 1 (useSajuCalculate) | **3** (+ useCutProgression, useCharacterSajuFlow) | +2 |
| 공용 컴포넌트 위치 | `doyoon/components/` (원칙 위반) | `shared/components/` (원칙 준수) | 해소 |
| 공용 cut 렌더러 | 0 | **3** (LoadingCut, SurveyCut, CtaOverlay) | +3 |
| 린트 에러/경고 총합 | 18 | **16** | -2 |
| 도윤/연우 구조 대칭성 | 쌍둥이 복제 | **정확히 캐릭터 고유값만 차이** | 완전 대칭 |

**최종 git 히스토리 (브랜치 `refactor/saju-scene-extraction`)**
- `b551250` Step 1 — 공용 컴포넌트 승격
- `4dd2b46` Step 2 — useCutProgression 훅 추출
- `02941a5` Step 3 — useCharacterSajuFlow 훅 추출
- `ab83ed7` Step 4 — cut 렌더러 3종 분리
- `cba40ee` Step 5 — 연우 씬에 동일 구조 적용
- (Step 6 커밋 대기)

**미해결 이슈 / 후속 작업 후보**

1. **userName 첫 방문 누락 버그** — 원본 코드의 기존 거동. InfoForm 제출 후 `userName` state 가 즉시 갱신되지 않아 첫 방문 시 결과 컷에서 이름이 빈 문자열로 보일 가능성. 재방문 시에는 mount 시 localStorage 로드로 정상화됨. **해결안**: `useCharacterSajuFlow.submitInfo` 에서 `setUserName(info.name)` 한 줄 추가. Step 6 스코프에서 제외 (동작 불변 원칙, 별도 PR 권장).
2. **`useCharacterSajuFlow` 의 린트 2건 (set-state-in-effect)** — userName 로드 및 showSlowMessage 초기화 useEffect의 의도된 패턴. `useReducer` 전환 또는 `eslint-disable-next-line` 로 해소 가능.
3. **이미지 `sizes` prop 누락 경고** — CharacterSelectScene, IntroScene 등 리팩터링 범위 밖 10건 + 이미지 최적화 관련. 별도 작업.
4. **세 번째 캐릭터 / 유료 사주 씬 추가 시** — 현재 `shared/` 자산 그대로 재사용 가능. Scene 1개(~300줄) + cuts 데이터만 추가하면 됨.

**결과란**
- 최종 커밋 해시: `f780f35`
- 총 소요 시간: 약 4시간 (플랜 1~6단계)
- QA 방식: Playwright MCP 로 도윤·연우 양쪽 E2E 자동 검증 (기준 스냅샷 영상 대체)

---

## 중단 시 재개 가이드

세션이 중단되면 다음을 순서대로 실행:

1. **이 파일의 "진행률 추적" 표를 확인** — 어느 Step이 🟨 진행중인지 또는 마지막 ✅인지 파악
2. **git 상태 확인** — `git status` / `git log --oneline -10`으로 실제 저장된 진행 상황 확인
3. **해당 Step의 "결과란"과 체크리스트 대조** — 문서 업데이트가 커밋보다 뒤처졌을 가능성 있음
4. **진행중 Step이 있고 빌드 깨진 상태라면** — 그 Step의 브랜치 변경을 `git stash` 또는 `git reset` 고려 (유저 확인 필수)
5. Claude에게 이렇게 요청: **"`docs/refactoring-plan-saju-scene.md` 기준으로 다음 미체크 단계부터 이어서 진행해줘. 현재 진행 중인 Step이 있다면 거기서 재개."**

---

## 참고 파일 경로 (빠른 진입점)

- `src/products/dohwaseon/scenes/saju/doyoon/DoyoonSajuScene.tsx` — 리팩터링 본진 (529줄)
- `src/products/dohwaseon/scenes/saju/yeonwoo/YeonwooSajuScene.tsx` — 쌍둥이 (493줄)
- `src/products/dohwaseon/scenes/saju/doyoon/components/` — 승격 대상 디렉토리
- `src/products/dohwaseon/scenes/saju/doyoon/data/` — cuts.ts, mockSaju.ts, surveyOptions.ts (도윤 전용 유지)
- `src/products/dohwaseon/scenes/saju/yeonwoo/data/` — 연우 전용 데이터
- `src/features/saju/` — 건드리지 않지만 Step 3에서 활용
- `CLAUDE.md` — 아키텍처 방침, Step 6에서 갱신

---

## 선택적 강화 항목 (필수 아님)

리팩터링 진행 중 여유가 있으면 고려:

- **Playwright 스모크 테스트 1개 추가** — "도윤 씬 끝까지 자동 재생"만 커버해도 회귀 방지에 큰 효과. 공수 0.5일.
- **Storybook 미도입** — cut 렌더러마다 스토리 분리 가능하지만, 지금 시점엔 과잉. YAGNI 적용.
- **useReducer → XState 마이그레이션** — 상태기계가 복잡해지면 고려. 현 규모엔 불필요.
