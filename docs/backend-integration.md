# 도화선 백엔드 연동 계약서

> 프런트(dohwa_frontend) ↔ 백엔드(dohwa-backend, fortuneteller를 도메인으로 흡수) 연동 결정 사항 정리.
> 최초 작성: 2026-04-21
> 최종 수정: 2026-04-21 (§2 응답 확장·§10 보안 원칙 개정 / PR2)
> 이 문서가 **단일 소스(single source of truth)** — 대화 중 새 결정이 나오면 이 파일을 갱신한다.

---

## 1. 아키텍처

**단일 백엔드 서비스** 구조. 별도의 FastAPI 중간층 없음.

```
프런트 (Next.js, Vercel)
   │  NEXT_PUBLIC_API_URL = dohwa-backend 도메인 하나
   ▼
dohwa-backend (Node.js/TypeScript)
├── src/
│   ├── domains/
│   │   ├── fortuneteller/        # 기존 fortuneteller-main 의 lib/ 이관 (계산 엔진)
│   │   │   ├── lib/              # saju.ts, yong_sin.ts 등 — 수정 금지
│   │   │   ├── data/             # 절기/음력/천간지지/경도 테이블
│   │   │   └── types/
│   │   ├── payment/              # 페이앱 결제 생성/검증/웹훅
│   │   ├── reports/              # Claude API 호출, 유료 리포트 생성
│   │   └── users/                # 사주 요청 이력, 결제 이력 DB
│   ├── http/
│   │   ├── routes/
│   │   │   ├── saju.ts           # POST /api/saju/free
│   │   │   ├── payment.ts        # POST /api/payment/prepare, /api/payment/webhook
│   │   │   └── reading.ts        # POST /api/reading/premium
│   │   ├── transformers/         # domain 결과 → 응답 shape 변환
│   │   └── middleware/           # CORS, rate limit
│   ├── db/                       # ORM/스키마 (Prisma 권장)
│   └── server.ts                 # Express/Fastify 진입점
└── prisma/                       # DB 스키마
```

**도메인 경계 규칙:**
- `domains/fortuneteller/` 는 **다른 도메인을 import하지 않음** (순수 계산 엔진 격리)
- `reports`, `payment` 는 `fortuneteller` 를 import해 사용 가능
- `http/routes/` 가 도메인들을 조합해 엔드포인트 구성

**핵심 불변:** `fortuneteller/lib/saju.ts` 10단계 파이프라인 순서는 절대 변경 금지. 내부 해석(interpreters/) 개선만 허용.

**언어:** 전부 TypeScript. Python/FastAPI 도입하지 않음.

**향후 확장 시점:** fortuneteller를 별도 npm 패키지로 분리하고 싶어지면 그때 분리. 현 단계에선 단일 레포·단일 서비스 유지.

---

## 2. 무료 사주 API 계약

### 엔드포인트
```
POST /api/saju/free
```

### 요청 바디
```json
{
  "birth": "1998-03-15",
  "calendar": "solar",
  "time": "14:30",
  "gender": "female"
}
```

**규칙:**
- `birth`: **ISO `YYYY-MM-DD`** (프런트가 UI의 `.` 구분자를 전송 전에 `-`로 변환)
- `calendar`: `"solar"` | `"lunar"`
- `time`: `"HH:MM"` | `"unknown"`
- `gender`: `"female"` | `"male"`
- `name`은 **보내지 않음** (프런트 localStorage에만 보관, PII 리스크 제거)
- `birthCity`는 **수집하지 않음** → 백엔드 서울 기본값 사용 (고지 문구도 없음, 섹션 4 참고)

### 응답 바디 (성공) — PR2 확장본

```jsonc
{
  "pillars": [
    {
      "label": "년주",
      "heaven": "丙",
      "earth": "子",
      "heavenHangul": "병",
      "earthHangul": "자",
      "element": "화 / 수",
      "hue": "#E6A88E",
      "yinYang": { "heaven": "양", "earth": "양" },
      "tenGod": {
        "heaven": "비견",
        "earth": "정관",
        "heavenHanja": "比肩",
        "earthHanja": "正官"
      },
      "twelvePhase": { "name": "태", "hanja": "胎" },
      "sinSals": [
        { "slug": "do_hwa_sal", "label": "도화살", "hanja": "桃花殺" }
      ],
      "unknown": false
    }
    // month/day/hour 동일 구조 (총 4개)
  ],

  "highlight": "화개살(華蓋殺) — 年支에 위치",

  "wuxing": {
    "counts":    { "목": 1, "화": 3, "토": 1, "금": 0, "수": 3 },
    "ratios":    { "목": 12.5, "화": 37.5, "토": 12.5, "금": 0.0, "수": 37.5 },
    "judgments": { "목": "적정", "화": "과다", "토": "적정", "금": "결핍", "수": "발달" }
  },

  "yongSin": {
    "primary":   { "element": "수", "hanja": "水", "role": "용신" },
    "secondary": null,
    "opposing":  { "element": "화", "hanja": "火", "role": "기신" }
  },

  "dayMaster": {
    "stem": "병",
    "stemHanja": "丙",
    "strengthLevel": "신강",
    "strengthScale": 7,
    "strengthPosition": 5
  },

  "daeUn": {
    "startAge": 2,
    "direction": "forward",
    "periods": [
      {
        "age": 2,
        "startYear": 1998,
        "stem": "갑",
        "branch": "오",
        "stemHanja": "甲",
        "branchHanja": "午",
        "element": "목 / 화",
        "hue": "#9CC8B0"
      }
      // ... 총 7개
    ]
  },

  "sajuRequestId": "svr_01KPQ..."
}
```

**규칙:**
- `pillars`: **항상 길이 4** 고정. 각 pillar 는 천간/지지 한자·한글, 음양, 오행(혼합 문자열), hue, 십성(`tenGod`), 십이운성(`twelvePhase`), 기둥별 신살 배열(`sinSals`), unknown 플래그를 포함.
- 시주 unknown 시 `heaven: "?"`, `earth: "?"`, `element: "—"`, `hue: "—"`, `sinSals: []`, `tenGod`/`twelvePhase` 는 placeholder 값 (프런트에서 unknown 분기 렌더).
- `highlight`: 단일 문자열 — 신살 우선 포맷 `"{신살명}({한자}) — {위치}에 위치"` 또는 백엔드 선택 카피.
- `wuxing`: 오행 5종 카운트·비율·판정. 판정은 `결핍 / 적정 / 발달 / 과다` 4단계.
- `yongSin`: **`null` 가능** (내부 미산출 시 전체 null). 채워질 땐 `primary`(용신) / `secondary`(희신, null 가능) / `opposing`(기신).
- `dayMaster`: 일간 간지 + 7단계 신강신약. `strengthPosition` 1=극약 ~ 7=극왕.
- `daeUn.periods`: **정확히 7개**, 순행/역행, 나이 10년 간격.
- `sajuRequestId`: 유료 리포트(`POST /api/reading/premium`) 재사용 식별자.

### 값 도메인 레퍼런스

**오행 5종 (한글 고정)**: `목` `화` `토` `금` `수`

**오행 hex 팔레트 (확정 — 변경 없음)**

| 오행 | Hex |
|---|---|
| 목(木) | `#9CC8B0` |
| 화(火) | `#E6A88E` |
| 토(土) | `#E6C58E` |
| 금(金) | `#C5CAD4` |
| 수(水) | `#6B8BB5` |

혼합 오행 `hue` 는 **천간 오행 색** 기준. 프런트는 응답값 그대로 렌더.

**십이운성 12단계**: 태(胎) · 양(養) · 장생(長生) · 목욕(沐浴) · 관대(冠帶) · 건록(建祿) · 제왕(帝旺) · 쇠(衰) · 병(病) · 사(死) · 묘(墓) · 절(絕)

**십성 10종**: 비견(比肩) · 겁재(劫財) · 식신(食神) · 상관(傷官) · 편재(偏財) · 정재(正財) · 편관(偏官) · 정관(正官) · 편인(偏印) · 정인(正印)

> **일주 천간 특례**: 일간 기준 자기 자신의 십성은 정의상 항상 `"비견"`. `pillars[2].tenGod.heaven === "비견"`이 항상 참. UI 에서 일주 칸의 십성(상) 자리는 "日干" 라벨로 대체 렌더 권장.

**신살 슬러그 (현재 방출 7 + 타입 정의 8 = 총 15)**

실방출 (매핑 필수): `cheon_eul_gwi_in`(천을귀인) · `do_hwa_sal`(도화살) · `yeok_ma_sal`(역마살) · `hwa_gae_sal`(화개살) · `gong_mang`(공망) · `won_jin_sal`(원진살) · `gwi_mun_gwan_sal`(귀문관살)

미방출 (확장 대비): `cheon_deok_gwi_in` · `wol_deok_gwi_in` · `mun_chang_gwi_in` · `hak_dang_gwi_in` · `geum_yeo_rok` · `yang_in_sal` · `baek_ho_sal` · `gwa_suk_sal`

응답 `pillars[*].sinSals[]` 는 각 기둥 지지에 실제 걸린 것만 0~여러 개. 접미어 `_gwi_in` 로 귀인 분류.

**오행 판정 라벨 (개수 기반)**: 0개 → `결핍` / 1개 → `적정` / 2개 → `발달` / 3개 이상 → `과다`

**신강신약 7단계** (`strengthPosition` 1~7): 1=극약 · 2=태약 · 3=신약 · 4=중화 · 5=신강 · 6=태강 · 7=극왕

### 에러 응답

```json
// 400
{ "error": "BAD_REQUEST", "detail": [{ "path": ["birth"], "message": "..." }] }

// 500
{ "error": "CALCULATION_FAILED" }

// (프런트 자체 감지)
// TIMEOUT
```

프런트 한국어 매핑:
- `BAD_REQUEST` → 필드 하이라이트 + "입력을 확인해 주세요"
- `CALCULATION_FAILED` → "잠시 후 다시 시도해 주세요"
- `TIMEOUT` → "연결이 늦어지고 있어요"

500 응답에 스택 트레이스 / 내부 변수 **절대 노출 금지**.

---

## 3. 응답 시간 / 로딩 UX

| 항목 | 값 |
|---|---|
| 백엔드 목표 응답 시간 | 평시 500ms 이하 |
| 프런트 하드 타임아웃 | 5초 (abort) |
| 프런트 최소 로딩 노출 | 1.2초 (컷 연출 유지) |
| 3초 초과 시 | 문구 전환 "별의 배치를 읽는 중…" |

현재 `analysis-loading` 스텝의 고정 2초 `setTimeout`은 실 연동 시 `await fetch` + 최소 노출 1.2초 보장으로 교체.

---

## 4. 출생지 (birthCity) 정책

**수집하지 않음. UI 고지 문구도 없음.** 서버가 서울 기본값으로 조용히 계산.

**근거:**
- 국내 경도차 최대 약 8분 → 실용적으로 무시 가능
- 경쟁사 관행상 출생지까지 수집하는 사례 없음
- 입력 필드 하나를 줄이면 UX 저항이 줄어 결제 전환에 유리
- 필요시 유료 리포트 단계에서 정밀 입력 옵션 제공 고려 (fortuneteller에 162개 시군구 데이터 존재)

---

## 5. 캐릭터 톤 분리 정책

- **무료 단계:** 카드 앞뒤 캐릭터 대사(도윤/연우)로 분위기 전달. 카드 내부는 **사실 데이터만** (pillars + highlight).
- **유료 단계:** Claude API로 캐릭터별 해석 리포트 생성 → 유료의 핵심 차별점.

프런트 측 대사(`cuts.ts`의 `analysis-result.intro`, `dialogue-after-result.lines`)는 **정적 문구 유지** — 사용자 사주 내용 언급 없는 포괄적 캐릭터 대사.

---

## 6. 설문(Survey) 저장

**Why.** 무료 단계 끝의 3단 설문(관계 상태 / 알고 싶은 것 / 자유 서술)을 DB 에 저장해 유료 리포트(`/api/reading/premium`) 생성 시 Claude 프롬프트 구성 입력으로 재사용한다. 저장은 **업서트** — 사용자가 뒤로 가서 수정해도 안전.

### 엔드포인트
```
POST /api/saju/survey
```

### 요청 바디
```json
{
  "sajuRequestId": "svr_xxx",
  "surveyVersion": "v1",
  "step1": ["waiting_new", "crushing"],
  "step2": ["soulmate"],
  "step3": "헤어진 연인이 그리워요…"
}
```

**규칙:**
- `sajuRequestId`: `POST /api/saju/free` 응답으로 받은 값. 프런트는 이를 localStorage(`doyoonSajuRequestId`/`yeonwooSajuRequestId`) 에 보관.
- `surveyVersion`: 현재 `"v1"` 고정. 옵션 문구/슬러그가 바뀌면 `"v2"` 로 올린다.
- `step1`/`step2`: 아래 v1 슬러그 중 복수 선택(최소 1개).
- `step3`: 자유 서술(최대 100자). 건너뛰기 시 `null`.

### v1 슬러그 테이블 (도윤/연우 공통)

**step1 — 본인 상황**

| slug | UI 라벨 |
|---|---|
| `waiting_new` | 새로운 인연을 기다려요 |
| `crushing` | 썸 타는 중이에요 |
| `in_relationship` | 연애 중이에요 |
| `missing_ex` | 헤어진 연인이 그리워요 |

**step2 — 알고 싶은 것**

| slug | UI 라벨 |
|---|---|
| `soulmate` | 내 운명의 상대 |
| `timing` | 다음 인연의 시기 |
| `compatibility` | 현재 인연과의 궁합 |
| `patterns` | 내 연애 패턴의 본질 |

**step3** — 자유 서술. 정규화/토큰화는 백엔드 몫(필요 시).

**슬러그 단일 소스:** `src/products/dohwaseon/scenes/saju/{doyoon,yeonwoo}/data/surveyOptions.ts` 의 `id` 필드. UI 라벨을 바꾸더라도 `id` 는 유지 — 변경이 필요하면 `surveyVersion` 을 bump 하고 본 섹션에 새 테이블 추가.

### 응답
- `200 OK`: 본문 미사용(업서트 성공 여부만 확인).
- `400 BAD_REQUEST`: `detail` 은 Zod 이슈 배열(§2 와 동일 포맷).

### 호출 시점 / 실패 처리
- **프런트**: `SurveyFreeText` 의 onNext 직후 **fire-and-forget** 으로 1회 POST. 결과를 기다리지 않고 `final-leanin` 컷으로 진행.
- **실패 허용**: 네트워크 실패·타임아웃이어도 씬은 계속 진행. 유료 진입 시 백엔드가 survey 누락을 감지하면 기본 톤으로 폴백하거나 별도 처리.
- **업서트**: 사용자가 뒤로 가서 수정 후 다시 제출하면 덮어씀. 프런트 쪽 중복 차단 플래그 불필요.

---

## 7. 유료 엔드포인트 (잠정 설계)

**이번 작업 범위 밖** — 결제 연동과 함께 별도 단계.

```
POST /api/reading/premium
```

요청 shape 초안:
```json
{
  "sajuRequestId": "svr_xxxx",
  "paymentToken": "페이앱 발급 검증 토큰",
  "survey": { "step1": [...], "step2": [...], "step3": "..." },
  "character": "yeonwoo" | "doyoon"
}
```

백엔드 흐름:
1. `paymentToken`으로 페이앱에 결제 완료 검증
2. DB에서 `sajuRequestId` 조회 → 명식 재사용 (재계산 X)
3. `character` + `survey` + 명식 → Claude API 프롬프트 구성
4. 리포트 생성 후 DB 저장 + 응답 반환

---

## 8. 결제 모듈

**페이앱(payapp)** — 확정.

**선정 사유:** 사업자 등록 없이 PG 이용 가능.

### 연동 방식
**프런트 SDK + 백엔드 Webhook** 구조.

- 프런트: `<script src="https://lite.payapp.kr/public/api/v2/payapp-lite.js">` 로드 → `PayApp.setParam()` / `PayApp.payrequest()` 호출
- 결제창 방식: **redirect** (SDK 파라미터 `redirectpay: "1"`). popup/iframe은 기본 미지원 → 모바일 UX는 redirect 전제로 설계
- 결제 완료 후: `returnurl` 로 사용자 브라우저 복귀, 동시에 `feedbackurl` 로 백엔드에 webhook 전송

### 수수료 (2026-04 확인, VAT 10% 별도)

| 수단 | 수수료 | VAT 포함 실질 |
|---|---|---|
| 신용카드 / 체크카드 | 4.00% | 4.40% |
| 네이버페이 | 4.00% | 4.40% |
| 애플페이 | 4.00% | 4.40% |
| 휴대전화 | 4.00% | 4.40% |
| 등록결제(자동) | 4.00% | 4.40% |
| 계좌이체 | 2.30% | 2.53% |
| 내통장결제 | 2.00% | 2.20% |
| 가상계좌 | 건당 220원 | (미사용 설정) |
| 위쳇페이 | 2.60% | (미사용 설정) |

**정산:** 구비서류 제출 후. 건당 50만원 이상 또는 월 매출 500만원 이상 시 보증보험 가입 필요.

### 최소 결제 금액
**1,000원** (테스트 검증 완료).

### 결제 파라미터 (SDK)
프런트에서 `PayApp.setParam()` 으로 전달:

| 파라미터 | 용도 |
|---|---|
| `goodname` | 상품명 (예: "도화선 프리미엄 리포트") |
| `price` | 결제 금액 (원) |
| `var1` | 주문번호 (백엔드가 발급, webhook/return에 그대로 전달됨) |
| `recvphone` | 알림 받을 휴대폰 (SMS 미사용시 더미 가능) |
| `feedbackurl` | 백엔드 webhook URL (`https://api.dohwaseon.com/api/payment/webhook`) |
| `returnurl` | 결제 후 사용자 복귀 URL (`https://dohwaseon.com/reading/complete?orderId=...`) |
| `redirectpay` | `"1"` 고정 (redirect 방식) |
| `smsuse` | `"n"` (SMS 발송 안 함) |
| `skip_cstpage` | `"y"` (커스터마이징 페이지 스킵) |

### 백엔드가 구현할 것
- `POST /api/payment/prepare` — 서버가 주문 생성, `orderId`/`amount` 반환 → 프런트가 이 값을 SDK에 주입
- `POST /api/payment/webhook` — 페이앱 feedbackurl 수신, 서명/금액/상태 검증 후 DB 기록. `var1`(orderId)로 자체 주문 매칭
- 결제 유효성 확인 로직 — `/api/reading/premium` 진입 시 해당 orderId가 결제완료 상태인지 체크

### 환경변수
```
PAYAPP_USERID=       # 판매자 아이디
PAYAPP_LINKKEY=      # 연동 KEY
PAYAPP_LINKVAL=      # 연동 VALUE
```
페이앱 대시보드 → 설정 → 연동정보에서 발급.

### 참고 구현 (FastAPI 샘플)
`C:\Users\skwog\Documents\dohwa_project\dohwa_money` 에 FastAPI+바닐라JS 레퍼런스 구현 있음. Node/TS로 포팅 시 참고.
공식 SDK 문서: https://www.payapp.kr/dev_center/dev_center01.html

---

## 9. CORS / 환경

**환경 분리 전략:**

| 환경 | 프런트 `NEXT_PUBLIC_API_URL` | 백엔드 CORS allow-origin |
|---|---|---|
| Local | `http://localhost:8000` (또는 dev 포트) | `http://localhost:3000` |
| Preview (Vercel) | `https://api-dev.dohwaseon.com` (예정) | `https://*.vercel.app` (해당 프로젝트 prefix 제한) |
| Production | `https://api.dohwaseon.com` (예정) | Production 도메인 정확 매칭 |

**핵심 원칙:**
- Preview 배포는 **dev 백엔드**를 호출 — 실결제/실계산이 아닌 별도 인스턴스
- Production CORS는 커스텀 도메인 **정확 매칭**만. 와일드카드 불가
- Vercel 환경변수 기능으로 `NEXT_PUBLIC_API_URL`을 환경별로 분리 설정

**프로덕션 도메인:** 🟣 **미정** — 구매 후 공유 예정.

---

## 10. 보안 / 알고리즘 보호 원칙 (2026-04 개정 / PR2)

> 이전 버전은 `wuxingCount` / `tenGods` / `yongSin` 등을 "절대 노출 금지"로 규정했지만, 이는 명리학 표준 계산 결과물이라 공개된 사주 레포들에도 전부 드러나는 값이다. 이번 개정으로 **표시용 결과는 공개, 해석·프롬프트·가중치만 보호** 로 재정의.

### 공개 OK — 명리학 표준 계산 결과물
- 4기둥 (천간·지지·음양·오행)
- 십성(`tenGod`), 십이운성(`twelvePhase`), 신살(`sinSals`, 위치 포함)
- 오행 분포·비율·강약 (`wuxing`)
- 용신·희신·기신 (`yongSin`)
- 신강신약 단계 (`dayMaster.strengthLevel` / `strengthPosition`)
- 대운 7구간 (`daeUn`)

### 보호 대상 — 진짜 영업 비밀
- 용신 선택 알고리즘 근거 텍스트 (`yongSin.reasoning` 내부 필드)
- 일간 강약 수치·판정 근거 텍스트 (`score`, `analysis` 내부 필드)
- 격국 상세 판정 (`gyeokGuk`)
- 지장간 세력 수치 (`jiJangGan`)
- 지지 관계 판정 (`branchRelations`)
- 월령 판정 근거 (`wolRyeong.reason`)
- **PR3 유료 리포트의 Claude 프롬프트 원문·캐릭터 톤·해석 유파 가중치**

### 변함없는 원칙
- Claude API 키는 백엔드 전용. 프런트 노출 금지.
- 500 응답에 스택 트레이스 / 내부 변수 노출 금지.
- 설문 step3 자유 텍스트는 로그 출력 금지.

---

## 11. 미결 사항

| # | 항목 | 상태 |
|---|---|---|
| 1 | 프로덕션 도메인 | 🟣 구매 후 공유 예정 |
| 2 | 유료 리포트 가격 책정 | 🟣 수수료 확인 후 제품 결정 필요 |

결정되는 대로 이 문서의 해당 섹션을 갱신.

---

## 12. 프런트 측 후속 작업 체크리스트

실 연동 착수 시 프런트에서 바꿀 지점:

- [ ] `features/saju/api.ts` 신규 — fetch wrapper + 타입
- [ ] `features/saju/hooks.ts` 신규 — `useSajuCalculate()` hook
- [ ] `data/mockSaju.ts` — `insight` 필드 제거 (doyoon, yeonwoo 양쪽)
- [ ] `components/SajuChartCards.tsx` — `insight` 렌더 블록 삭제, `MockSaju` 타입 업데이트, `Pillar.unknown` 분기 렌더 추가
- [ ] `components/InfoForm.tsx` — 제출 시 `birth` 점→하이픈 변환, `name`은 localStorage에만 (요청 페이로드에서 제외)
- [ ] `{Doyoon,Yeonwoo}SajuScene.tsx` — `analysis-loading` 타이머 제거, `useSajuCalculate` 결과 대기로 교체 + 최소 1.2초 노출 보장
- [ ] `lib/api.ts` 확장 — 에러 코드 한국어 매핑 테이블
- [ ] `NEXT_PUBLIC_API_URL` 환경변수 설정 (local/preview/production 3종)
- [ ] 프런트 mockSaju 팔레트를 섹션 2의 확정 팔레트로 동기화 (특히 水의 `#A5BBD9` → `#6B8BB5`)
- [ ] (유료 단계) 페이앱 SDK 통합, `/api/reading/premium` 호출 로직
