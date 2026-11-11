// ==============================================================================
// api/quote.js
// 설명: 웹사이트 상단에 노출할 '오늘의 온기 한 문장(랜덤 힐링 문구)'을 제공하는 서버리스 함수
// ==============================================================================

// 마음을 다독여주는 엄선된 힐링 글귀 리스트
const quotes = [
  "오늘 하루도 온 힘을 다해 살아낸 당신을 진심으로 칭찬해요.",
  "잠시 멈춰 서서 숨을 고르는 것도 앞으로 나아가는 멋진 방법이에요.",
  "당신이 존재하는 것만으로도 누군가에겐 커다란 위로가 됩니다.",
  "작은 발걸음이라도 괜찮아요. 당신만의 속도로 걷고 있으니까요.",
  "오늘 있었던 실수보다, 도전했던 당신의 용기를 더 기억해 주세요.",
  "완벽하지 않아도 괜찮아요. 당신은 이미 충분히 빛나고 있으니까요.",
  "숨 한번 크게 쉬고, 뭉친 어깨를 가볍게 털어보세요.",
  "모든 꽃이 한 번에 피지 않듯, 당신의 계절도 다정하게 오고 있어요.",
  "남들과 비교하지 마세요. 당신의 오늘은 그 자체로 소중합니다.",
  "지친 하루 끝에 이 자리에 온 당신에게 따뜻한 온기를 보냅니다."
];

// Vercel Serverless Function 진입점 핸들러
module.exports = async (req, res) => {
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: '허용되지 않은 요청 방식입니다.'
    });
  }

  try {
    // 글귀 리스트 중 1개를 무작위(랜덤)로 추첨
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];

    return res.status(200).json({
      success: true,
      quote: selectedQuote
    });
  } catch (error) {
    console.error('[Quote GET 오류]:', error);
    return res.status(500).json({
      success: false,
      message: '글귀를 불러오지 못했습니다.'
    });
  }
};

