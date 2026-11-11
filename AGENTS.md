# AGENTS.md - Antigravity AI 코딩 에이전트 작업 지침서

## 1. 역할 및 목표
본 문서는 Antigravity AI 코딩 에이전트가 **[너를 칭찬해]** 서비스를 일관되고 결함 없이 구현하기 위한 개발 규칙, 코드 작성 원칙, 제약조건을 정의합니다. 에이전트는 본 규칙을 엄격히 준수하며 개발을 진행해야 합니다.

---

## 2. 기본 작업 원칙
1. **임의 추측 금지**: 요구사항 및 명세서(PRD.md 및 `docs/` 내 문서)에 명시되지 않은 사항을 임의로 결정하지 마십시오. 불명확한 부분은 기술 문서의 기본 규칙(보수적 접근)을 따릅니다.
2. **보안 최우선 (API Key 노출 엄금)**:
   - OpenAI API Key 및 Supabase Service Role Key는 절대 클라이언트(HTML/JS) 코드에 직접 노출하지 않습니다.
   - 모든 외부 API 및 DB 접근은 Vercel Serverless Function(Node.js 백엔드)을 경유합니다.
   - `.env.local` 및 환경변수 템플릿(`.env.example`)을 제공하고 `.gitignore`에 등록합니다.
3. **단순성과 명확성**:
   - 불필요한 거대 프레임워크(React, Vue 등)를 사용하지 않고 순수 HTML, CSS, Vanilla JS로 프론트엔드를 구성합니다.
   - 단일 페이지(SPA 느낌의 심플한 인터페이스)로 구현하여 직관적인 UX를 제공합니다.
4. **반응형 웹 지원**:
   - 모바일 퍼스트(Mobile-First) 디자인 원칙을 적용하여 스마트폰(375px~) 및 데스크톱 환경 모두에서 깨짐 없이 렌더링되어야 합니다.

---

## 3. 기술 스택 및 디렉터리 구조 표준

### 기술 스택
- **Front-End**: HTML5, Modern CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+)
- **Back-End**: Node.js (Vercel Serverless Functions - `/api` 디렉터리)
- **AI**: OpenAI API (`gpt-4o-mini` 권장, 감정 공감 프롬프트)
- **DB**: Supabase (PostgreSQL, Anonymous Key / REST API)
- **배포(Hosting)**: Vercel

### 디렉터리 구조 규칙
```text
project-root/
├── public/                 # 정적 프론트엔드 자원
│   ├── index.html          # 메인 단일 페이지
│   ├── css/
│   │   └── style.css       # 메인 스타일시트
│   └── js/
│       ├── app.js          # UI 이벤트 및 칭찬/피드백 처리 로직
│       └── toast.js        # 토스트/오류 알림 공통 모듈
├── api/                    # Vercel Serverless Functions (Node.js)
│   ├── praise.js           # OpenAI 호출 엔드포인트
│   ├── feedback.js         # Supabase 피드백 조회/저장 엔드포인트
│   └── quote.js            # [추가기능] 오늘의 온기 한 문장 제공 엔드포인트
├── docs/                   # 프로젝트 세부 명세 문서 (6개)
├── .env.example            # 환경변수 예시 파일
├── .gitignore              # Git 제외 파일 목록
├── package.json            # Node.js 의존성 관리
├── vercel.json             # Vercel 라우팅 및 빌드 설정
├── PRD.md                  # 제품 요구사항 정의서
└── AGENTS.md               # 에이전트 작업 지침서
```

---

## 4. 코딩 컨벤션 및 제약 조건

### 4.1 Front-End (HTML / CSS / JS)
- **시맨틱 태그 준수**: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>` 등을 명확히 구분합니다.
- **클래스 네이밍**: BEM(Block-Element-Modifier) 유사 구조 또는 직관적인 케밥 케이스(`kebab-case`) 사용 (예: `praise-form`, `card-item`, `btn-primary`).
- **상태 관리**:
  - 버튼 클릭 시 즉각적인 로딩 스피너 및 비활성화(`disabled`) 처리로 중복 제출 방지.
  - 네트워크 오류 시 화면이 멈추지 않고 Toast 알림 메시지 팝업.

### 4.2 Back-End (Vercel Serverless Functions)
- **CORS 설정**: 동일 오리진 배포 기본 지원 및 필요한 헤더 명시.
- **에러 핸들링**: 모든 핸들러는 `try...catch` 블록으로 감싸고, 실패 시 표준 에러 JSON 포맷(`{ "success": false, "message": "..." }`) 반환.
- **상태 코드 준수**:
  - `200 OK`: 요청 성공
  - `400 Bad Request`: 필수 파라미터 누락 또는 글자 수 초과
  - `500 Internal Server Error`: 외부 API(OpenAI/Supabase) 연동 실패

---

## 5. 단계별 작업 완료 기준 (Definition of Done)
1. **정적 마크업 단계**: UI 레이아웃이 Figma/명세 기준과 일치하며, 375px/768px/1200px 해상도에서 레이아웃 깨짐이 없을 때.
2. **백엔드 API 단계**: Postman 또는 curl을 통해 `/api/praise`, `/api/feedback`, `/api/quote` 호출 시 정상 응답 및 예외 응답이 검증될 때.
3. **통합 연동 단계**: 프론트엔드에서 실제 사연 입력 -> AI 답변 수신 -> 카드 복사/공유, 피드백 등록 -> 리스트 즉시 갱신이 정상 동작할 때.
4. **배포 단계**: Vercel에 배포되어 도메인 접근 시 환경변수가 정상 작동하고 동작할 때.