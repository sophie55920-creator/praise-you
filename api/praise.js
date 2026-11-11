// ==============================================================================
// api/praise.js
// 설명: 사용자의 사연에 대해 따뜻한 칭찬과 위로 메시지를 실시간 생성하는 서버리스 함수
// - 비용 0원 안심 보장: OpenAI 크레딧 소진 시에도 절대 에러가 나지 않고
//   감성 키워드 분석 기반의 [스마트 마음 치유사]가 즉시 따뜻한 맞춤형 처방전을 전달합니다.
// ==============================================================================

// OpenAI 공식 SDK 불러오기
const OpenAI = require('openai');

// 환경 변수에 등록된 OpenAI API 키를 이용하여 클라이언트 인스턴스 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
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

  const cleanStory = story.trim();

  // ----------------------------------------------------------------------------
  // 1차 시도: OpenAI API 호출 (크레딧 잔액이 있는 경우 최신 GPT-4o-mini 동작)
  // ----------------------------------------------------------------------------
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: `당신은 지치고 힘든 현대인의 마음을 온전히 품어주는 '따뜻한 마음 치유사 [너를 칭찬해]'입니다.
사용자가 오늘 있었던 일이나 겪은 감정을 이야기하면, 아래 3단계 규칙에 따라 답변하세요.

[답변 원칙]
1. 경청과 무조건적 공감 (1문장): 사용자가 느꼈을 피로감, 섭섭함, 혹은 노력의 무게를 깊이 공감합니다.
2. 숨겨진 가치와 구체적 칭찬 (1~2문장): 사용자가 "당연하다"고 여긴 사소한 행동(일어난 것, 버틴 것, 밥을 챙겨 먹은 것, 쉼을 선택한 것)에서 위대한 용기와 성실함을 발견하여 칭찬합니다.
3. 다정한 격려와 온기 한 스푼 (1문장): 마음의 긴장을 풀고 스스로를 다독일 수 있는 따뜻한 맺음말을 건냅니다.

[어조 및 제약사항]
- 친절하고 다정한 존댓말("~했어요", "~그랬군요", "~당신은 참 멋져요")을 사용하세요.
- 상투적인 훈계나 조언, 가르치려 드는 태도는 절대 금지합니다.
- 답변 전체 길이는 250~400자 사이로 유지하세요.`
        },
        {
          role: 'user',
          content: cleanStory
        }
      ]
    });

    const praiseText = response.choices[0].message.content.trim();
    return res.status(200).json({
      success: true,
      result: praiseText
    });

  } catch (error) {
    // --------------------------------------------------------------------------
    // 2차 스마트 안심 대응: 잔액 부족(insufficient_quota) 또는 외부 API 장애 시
    // 사용자에게 오류 화면을 띄우지 않고, 사연을 분석하여 정성스러운 칭찬을 즉시 생성합니다!
    // --------------------------------------------------------------------------
    console.log('[알림] 외부 AI API 잔액 부족 또는 오류 감지. 스마트 힐링 생성기 가동:', error?.code || error?.message);

    const fallbackPraise = generateWarmPraise(cleanStory);

    return res.status(200).json({
      success: true,
      result: fallbackPraise
    });
  }
};

/**
 * 비용 0원 안심 기능:
 * 사용자의 사연에서 감정 키워드를 분석하여 포근하고 다정한 3단계 맞춤형 칭찬 문장을 완성합니다.
 * @param {string} story - 사용자가 입력한 사연 텍스트
 * @returns {string} 완성된 따뜻한 칭찬 메시지
 */
function generateWarmPraise(story) {
  const lower = story.toLowerCase();

  // 1. 밥/식사 관련 사연인 경우
  if (lower.includes('밥') || lower.includes('배부') || lower.includes('먹') || lower.includes('식사') || lower.includes('맛')) {
    return `오늘 하루 든든하게 식사를 챙겨 드셨군요! 바쁘고 지친 일상 속에서 끼니를 거르지 않고 자신에게 든든한 밥 한 끼를 선물해 준 것은, 내 몸과 마음을 아끼는 가장 다정하고 위대한 돌봄이에요. 배부른 포만감만큼이나 오늘 밤 당신의 마음도 포근하고 넉넉한 온기로 가득 채워지길 바라요. 오늘 하루도 정말 수고 많으셨어요. 🌸`;
  }

  // 2. 피로/잠/휴식 관련 사연인 경우
  if (lower.includes('피곤') || lower.includes('힘들') || lower.includes('지쳐') || lower.includes('누워') || lower.includes('잠') || lower.includes('쉬')) {
    return `오늘 하루의 무게를 온전히 짊어지느라 참 많이 애쓰셨어요. 그 피로감은 오늘 하루 당신이 얼마나 세상과 치열하게 마주하고 노력했는지를 보여주는 훈장 같은 흔적이에요. 지금 느끼는 피로 앞에서 자책하지 마시고, 오늘 밤은 오직 당신만을 위한 편안한 쉼을 허락해 주세요. 당신은 오늘 하루도 충분히 멋지게 살아냈어요. 🌿`;
  }

  // 3. 출근/퇴근/일/공부 관련 사연인 경우
  if (lower.includes('일') || lower.includes('출근') || lower.includes('퇴근') || lower.includes('회사') || lower.includes('공부') || lower.includes('학교') || lower.includes('숙제')) {
    return `무거운 발걸음이었을 텐데도 묵묵히 자리를 지키고 맡은 몫을 해내신 당신을 진심으로 칭찬해요! 당연해 보이는 그 하루 뒤에는 당신의 수많은 인내와 성실함이 보석처럼 숨어 있답니다. 작은 한 걸음들이 모여 더 빛나는 내일을 만들어갈 거예요. 어깨를 가볍게 털고 스스로에게 "오늘 참 잘했다"고 따뜻하게 속삭여주세요. ✨`;
  }

  // 4. 감정/속상함/불안/실수 관련 사연인 경우
  if (lower.includes('우울') || lower.includes('속상') || lower.includes('슬프') || lower.includes('눈물') || lower.includes('불안') || lower.includes('걱정') || lower.includes('실수')) {
    return `마음속에 품고 있던 무거운 이야기를 솔직하게 꺼내어 마주해 준 당신의 용기를 높이 사요. 실수나 흔들림은 당신이 부족해서가 아니라, 더 잘해내고 싶었던 진심 어린 마음이 컸기 때문이에요. 지나간 일에 마음 쓰며 아파하기보다, 그 시간 속에서 최선을 다했던 당신의 진심을 꼭 안아주세요. 당신은 언제나 사랑받을 자격이 충분한 소중한 사람입니다. 💖`;
  }

  // 5. 일반적인 일상 사연에 대한 포근한 공통 처방전
  return `오늘 있었던 소소한 이야기를 이렇게 다정하게 나누어 주셔서 고마워요. 아무것도 아닌 것처럼 흘러가는 일상 속에서도, 이렇게 하루를 돌아보며 자신의 마음에 귀를 기울이는 것은 정말 특별하고 건강한 태도랍니다. 오늘 하루 당신이 건너온 모든 시간과 작은 행동 하나하나가 그 자체로 충분히 가치 있고 반짝여요. 오늘 밤은 마음에 무거운 짐을 다 내려놓고 온전히 편안한 시간을 보내시길 응원할게요. ☕`;
}
