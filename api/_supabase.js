// ==============================================================================
// api/_supabase.js
// 설명: Supabase 데이터베이스와의 통신을 담당하는 공통 클라이언트 인스턴스 모듈
// ==============================================================================

// Supabase 자바스크립트 공식 라이브러리 불러오기
const { createClient } = require('@supabase/supabase-js');

// 환경 변수(.env 또는 Vercel 환경 변수)에서 Supabase 연결 정보 읽기
const supabaseUrl = process.env.SUPABASE_URL;

// 보안 우선 원칙: 백엔드 서버리스 함수에서는 관리자 권한을 가진 SERVICE_ROLE_KEY를 우선 사용하고,
// 없으면 익명 키(ANON_KEY)를 대체 사용합니다.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// 필수 환경 변수가 누락되었을 경우 명확한 에러 발생
if (!supabaseUrl || !supabaseKey) {
  console.error('[오류] Supabase 환경 변수(SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.');
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인해 주세요.');
}

// 애플리케이션 전체에서 재사용할 단일 Supabase 클라이언트 인스턴스 생성
const supabase = createClient(supabaseUrl, supabaseKey);

// 다른 API 파일(feedback.js 등)에서 가져다 쓸 수 있도록 모듈로 내보내기
module.exports = supabase;

