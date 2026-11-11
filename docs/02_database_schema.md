# docs/02_database_schema.md - Supabase 데이터베이스 설계 및 세팅 지침

## 1. 개요
본 문서는 비회원 피드백을 안전하게 수집하고 최신순으로 제공하기 위한 Supabase 데이터베이스 스키마와 보안 정책(RLS)을 정의합니다.

---

## 2. 테이블 설계: `feedbacks`

### 2.1 컬럼 구조
| 컬럼명 | 데이터 타입 | 기본값 / 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` / PK | 고유 식별자 |
| `nickname` | `text` | `'익명의 천사'` | 작성자 닉네임 (최대 20자) |
| `content` | `text` | `NOT NULL` | 피드백 내용 (1~150자) |
| `emoji` | `text` | `'🌸'` | 감정 이모지 선택 (기본값 설정) |
| `created_at` | `timestamptz` | `now()` | 작성 일시 |

---

## 3. SQL 실행 스크립트 (Supabase SQL Editor에 복사하여 실행)

```sql
-- 1. feedbacks 테이블 생성
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(20) DEFAULT '익명의 천사',
    content VARCHAR(150) NOT NULL,
    emoji VARCHAR(10) DEFAULT '🌸',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 빠른 정렬을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks (created_at DESC);

-- 3. Row Level Security(RLS) 활성화
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. 누구나 피드백을 읽을 수 있도록 정책 허용 (SELECT)
CREATE POLICY "Allow public read access"
ON public.feedbacks
FOR SELECT
TO public
USING (true);

-- 5. 누구나 피드백을 작성할 수 있도록 정책 허용 (INSERT)
CREATE POLICY "Allow public insert access"
ON public.feedbacks
FOR INSERT
TO public
WITH CHECK (
    char_length(content) >= 1 AND 
    char_length(content) <= 150
);
```

---

## 4. 백엔드 연동 클라이언트 인스턴스 (`api/_supabase.js`)
서버리스 함수에서 공통으로 호출할 싱글톤 모듈입니다.

```javascript
// api/_supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

---

## 5. 완료 및 검증 기준
1. Supabase 대시보드의 Table Editor에서 `feedbacks` 테이블이 생성되었는지 확인.
2. 테스트 INSERT 쿼리를 실행하여 `nickname`, `content`, `emoji`, `created_at` 필드가 올바르게 채워지는지 확인.
3. 150자 초과 텍스트 입력 시 DB 레벨의 제약 조건에 의해 방어되는지 확인.