# docs/01_project_setup.md - 프로젝트 생성 및 환경 설정 지침

## 1. 개요
본 문서는 [너를 칭찬해] 프로젝트의 초기화, 패키지 설치, 환경변수 구성 및 Vercel 배포 세팅 과정을 설명합니다.

---

## 2. 사전 준비 사항
- Node.js 18.x 이상 설치
- Supabase 계정 및 프로젝트 생성
- OpenAI API Key 발급
- Vercel CLI 또는 Vercel 계정 연동

---

## 3. 프로젝트 초기화 절차

### Step 1: 디렉터리 생성 및 초기화
```bash
mkdir praise-you-service
cd praise-you-service
npm init -y
```

### Step 2: 필수 라이브러리 설치
```bash
npm install @supabase/supabase-js openai dotenv
npm install -D vercel
```

### Step 3: package.json 설정
```json
{
  "name": "praise-you-service",
  "version": "1.0.0",
  "description": "지친 당신을 위한 AI 칭찬 & 위로 서비스",
  "main": "index.js",
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.4.5",
    "openai": "^4.28.0"
  }
}
```

---

## 4. 환경 변수 설정 (`.env.example`)
루트 경로에 `.env.local` 파일을 생성하고 아래 항목을 입력합니다 (Git에는 절대 올리지 않음).

```env
# OpenAI API 설정
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx

# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 5. Vercel 라우팅 설정 (`vercel.json`)
정적 파일(`public`)과 API 함수(`/api`)를 명확하게 매핑합니다.

```json
{
  "version": 2,
  "public": true,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/public/$1"
    }
  ]
}
```

---

## 6. 완료 및 검증 기준
1. `npm run dev` 실행 시 로컬 주소(기본 `http://localhost:3000`)로 정적 HTML 화면이 정상 로딩되는가?
2. `.gitignore`에 `.env`, `.env.local`, `node_modules`가 포함되어 있어 민감 정보가 격리되는가?