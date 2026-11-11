// ==============================================================================
// api/praise.js
// 설명: OpenAI API(gpt-4o-mini)를 호출하여 사용자의 사연에 대한 따뜻한 칭찬/위로 메시지를 생성하는 서버리스 함수
// ==============================================================================

// OpenAI 공식 SDK 불러오기
const OpenAI = require('openai');

// 환경 변수에 등록된 OpenAI API 키를 이용하여 클라이언트 인스턴스 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vercel Serverless Function 진입점 핸들러
module.exports = async (req, res) => {
  // CORS 및 HTTP 메서드 검증 (POST 요청만 허용)
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '허용되지 않은 요청 방식입니다. POST 방식을 사용해 주세요.'
    });
  }

  // 클라이언트로부터 전달받은 사연(story) 추출
  const { story } = req.body || {};

  // 1. 유효성 검사: 사연 필수 입력 및 최소 글자 수(5자) 검증
  if (!story || typeof story !== 'string' || story.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: '조금만 더 당신의 이야기를 들려주세요 (최소 5자 이상 작성해 주세요).'
    });
  }

  // 2. 유효성 검사: 최대 글자 수(300자) 초과 방지
  if (story.trim().length > 300) {
    return res.status(400).json({
      success: false,
      message: '이야기가 조금 길어요. 300자 이내로 들려주세요.'
    });
  }

  try {
    // OpenAI Chat Completion API 호출 (gpt-4o-mini 모델 사용)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7, // 다정하고 자연스러운 표현을 위한 창의성 조절
      max_tokens: 600,   // 과도하게 길지 않은 3~5문장의 따뜻한 답변 길이
      messages: [
        {
          role: 'system',
          content: `당신은 지치고 힘든 현대인의 마음을 온전히 품어주는 '따뜻한 마음 치유사 [너를 칭찬해]'입니다.
사용자가 오늘 있었던 일이나 겪은 감정을 이야기하면, 아래 3단계 규칙에 따라 답변하세요.

[답변 원칙]
1. 경청과 무조건적 공감 (1문장): 사용자가 느꼈을 피로감, 섭섭함, 혹은 노력의 무게를 깊이 공감합니다.
2. 숨겨진 가치와 구체적 칭찬 (1~2문장): 사용자가 "당연하다"고 여긴 사소한 행동(일어난 것, 버틴 것, 노력한 것)에서 위대한 용기와 성실함을 발견하여 칭찬합니다.
3. 다정한 격려와 온기 한 스푼 (1문장): 마음의 긴장을 풀고 스스로를 다독일 수 있는 따뜻한 맺음말을 건냅니다.

[어조 및 제약사항]
- 친절하고 다정한 존댓말("~했어요", "~그랬군요", "~당신은 참 멋져요")을 사용하세요.
- 상투적인 훈계나 조언, 가르치려 드는 태도는 절대 금지합니다.
- 답변 전체 길이는 250~400자 사이로 유지하세요.
- 첫 시작에 감탄사나 다정한 인사(예: "오늘 하루도 정말 고생 많으셨어요.")를 곁들이세요.`
        },
        {
          role: 'user',
          content: story.trim()
        }
      ]
    });

    // AI가 생성한 칭찬 텍스트 추출
    const praiseText = response.choices[0].message.content.trim();

    // 성공 응답 반환
    return res.status(200).json({
      success: true,
      result: praiseText
    });

  } catch (error) {
    console.error('[OpenAI 호출 에러]:', error);
    // 보안 지침: 상세 시스템 에러 대신 친절하고 따뜻한 에러 메시지 반환
    return res.status(500).json({
      success: false,
      message: '마음을 불러오는 도중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.'
    });
  }
};

