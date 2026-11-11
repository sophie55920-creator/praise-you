-- ==============================================================================
-- [너를 칭찬해] 001_create_feedbacks_table.sql
-- 설명: 사용자들의 피드백(방명록)을 저장하고 안전하게 조회하기 위한 테이블 생성 및 보안 정책
-- ==============================================================================

-- 1. feedbacks (방명록/피드백) 테이블 생성
-- 비회원도 자유롭게 따뜻한 한마디를 남길 수 있도록 설계되었습니다.
CREATE TABLE IF NOT EXISTS public.feedbacks (
    -- 고유 식별자 (UUID 형태로 중복 없는 고유 ID 자동 생성)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 작성자 닉네임 (최대 20자, 미입력 시 '익명의 천사' 기본값)
    nickname VARCHAR(20) DEFAULT '익명의 천사',
    
    -- 피드백 내용 (1자 이상 150자 이하로 제한하여 과도한 글자 등록 방지)
    content VARCHAR(150) NOT NULL,
    
    -- 감정 이모지 (예: 🌸, 💖, 🌿, ✨ 등)
    emoji VARCHAR(10) DEFAULT '🌸',
    
    -- 작성 일시 (UTC 기준 현재 시간 자동 기록)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. 성능 최적화를 위한 인덱스 생성
-- 방명록 목록을 최신순(created_at 내림차순)으로 빠르게 가져오기 위한 색인입니다.
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at 
ON public.feedbacks (created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS, 행 단위 보안 정책) 활성화
-- 데이터베이스에 아무나 접근하여 데이터를 마음대로 수정/삭제하지 못하도록 방어벽을 켭니다.
-- ------------------------------------------------------------------------------
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. 읽기 정책 (SELECT)
-- 웹사이트를 방문한 모든 사용자(누구나)가 방명록 목록을 읽을 수 있도록 허용합니다.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access" ON public.feedbacks;
CREATE POLICY "Allow public read access"
ON public.feedbacks
FOR SELECT
TO public
USING (true);

-- ------------------------------------------------------------------------------
-- 5. 작성 정책 (INSERT)
-- 누구나 따뜻한 한마디를 작성할 수 있지만, 악의적인 빈 글이나 150자를 넘는 글은 DB 차원에서 차단합니다.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public insert access" ON public.feedbacks;
CREATE POLICY "Allow public insert access"
ON public.feedbacks
FOR INSERT
TO public
WITH CHECK (
    char_length(content) >= 1 AND 
    char_length(content) <= 150
);

