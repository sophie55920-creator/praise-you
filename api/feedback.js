// ==============================================================================
// api/feedback.js
// 설명: 피드백(방명록) 목록 조회(GET) 및 새 피드백 등록(POST)을 처리하는 서버리스 함수
// ==============================================================================

// Supabase 공통 모듈 불러오기
const supabase = require('./_supabase');

// Vercel Serverless Function 진입점 핸들러
module.exports = async (req, res) => {
  // ----------------------------------------------------------------------------
  // 1. [GET 요청] 최신 피드백 목록 30개 조회
  // ----------------------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('id, nickname, content, emoji, created_at')
        .order('created_at', { ascending: false }) // 최신순 정렬
        .limit(30);                                 // 최대 30개 제한

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: data || []
      });

    } catch (err) {
      console.error('[Feedback GET 오류]:', err);
      return res.status(500).json({
        success: false,
        message: '피드백 목록을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.'
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 2. [POST 요청] 새로운 피드백 등록
  // ----------------------------------------------------------------------------
  if (req.method === 'POST') {
    const { nickname, content, emoji } = req.body || {};

    // 유효성 검사: 피드백 내용 필수 입력
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '피드백 내용을 입력해 주세요.'
      });
    }

    // 유효성 검사: 최대 글자 수(150자) 제한
    if (content.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: '피드백은 150자 이내로 작성해 주세요.'
      });
    }

    // 닉네임 정제 (미입력 시 '익명의 천사', 최대 20자)
    const cleanNickname = (nickname && typeof nickname === 'string' && nickname.trim()) 
      ? nickname.trim().slice(0, 20) 
      : '익명의 천사';

    // 허용된 이모지 화이트리스트 검사 (부적절한 입력 방어)
    const allowedEmojis = ['🌸', '🌿', '💖', '☕', '✨'];
    const cleanEmoji = allowedEmojis.includes(emoji) ? emoji : '🌸';

    try {
      // Supabase feedbacks 테이블에 데이터 삽입 (INSERT)
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([
          {
            nickname: cleanNickname,
            content: content.trim(),
            emoji: cleanEmoji
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        success: true,
        message: '소중한 피드백이 등록되었습니다.',
        data: data
      });

    } catch (err) {
      console.error('[Feedback POST 오류]:', err);
      return res.status(500).json({
        success: false,
        message: '피드백 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      });
    }
  }

  // GET과 POST 이외의 메서드 차단
  return res.status(405).json({
    success: false,
    message: '허용되지 않은 요청 방식입니다.'
  });
};

