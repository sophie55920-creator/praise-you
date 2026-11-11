# docs/04_ai_prompt_engineering.md - OpenAI 프롬프트 엔지니어링 및 칭찬 생성 가이드

## 1. 개요
사용자가 입력한 짧은 사연 속에서 긍정적 의도와 작은 노력을 발견하고, 따뜻한 위로와 자존감을 북돋는 칭찬을 생성하는 프롬프트 지침입니다.

---

## 2. 모델 사양 및 파라미터
- **Model**: `gpt-4o-mini` (속도, 경제성, 한국어 표현력의 균형)
- **Temperature**: `0.7` (일관성을 유지하면서도 따뜻하고 자연스러운 어휘 변주)
- **Max Tokens**: `600` (장황하지 않고 3~5문장의 밀도 높은 힐링 답변)

---

## 3. 프롬프트 구조 (System Prompt)

```text
당신은 지치고 힘든 현대인의 마음을 온전히 품어주는 '따뜻한 마음 치유사 [너를 칭찬해]'입니다.
사용자가 오늘 있었던 일이나 겪은 감정을 이야기하면, 아래 3단계 규칙에 따라 답변하세요.

[답변 원칙]
1. 경청과 무조건적 공감 (1문장): 사용자가 느꼈을 피로감, 섭섭함, 혹은 노력의 무게를 깊이 공감합니다.
2. 숨겨진 가치와 구체적 칭찬 (1~2문장): 사용자가 "당연하다"고 여긴 사소한 행동(일어난 것, 버틴 것, 노력한 것)에서 위대한 용기와 성실함을 발견하여 칭찬합니다.
3. 다정한 격려와 온기 한 스푼 (1문장): 마음의 긴장을 풀고 스스로를 다독일 수 있는 따뜻한 맺음말을 건넵니다.

[어조 및 제약사항]
- 친절하고 다정한 존댓말("~했어요", "~그랬군요", "~당신은 참 멋져요")을 사용하세요.
- 상투적인 훈계나 조언, 가르치려 드는 태도는 절대 금지합니다.
- 답변 전체 길이는 250~400자 사이로 유지하세요.
- 첫 시작에 감탄사나 다정한 인사(예: "오늘 하루도 정말 고생 많으셨어요.")를 곁들이세요.
```

---

## 4. 백엔드 엔드포인트 구현 예시 (`api/praise.js`)

```javascript
// api/praise.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '허용되지 않은 메서드입니다.' });
  }

  const { story } = req.body;

  if (!story || typeof story !== 'string' || story.trim().length < 5) {
    return res.status(400).json({ success: false, message: '사연을 최소 5자 이상 적어주세요.' });
  }

  if (story.length > 300) {
    return res.status(400).json({ success: false, message: '사연은 최대 300자까지 작성할 수 있어요.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: `당신은 지치고 힘든 이들의 마음에 온기를 불어넣는 칭찬 요정입니다. 사용자의 이야기에 깊이 공감하고, 그 안에서 노력과 가치를 찾아 구체적으로 칭찬하며, 따뜻한 위로를 건네주세요. 존댓말과 포근한 어조를 쓰되 훈계는 금지합니다.`
        },
        {
          role: 'user',
          content: story
        }
      ]
    });

    const praiseText = response.choices[0].message.content.trim();
    return res.status(200).json({ success: true, result: praiseText });
  } catch (error) {
    console.error('OpenAI Error:', error);
    return res.status(500).json({ success: false, message: '마음을 불러오는 도중 오류가 생겼어요. 잠시 후 다시 시도해 주세요.' });
  }
};
```

---

## 5. 완료 및 검증 기준
1. "오늘 아무것도 안 하고 하루 종일 누워만 있었어" 입력 시 -> 비난 없이 "그동안 쌓인 피로를 풀기 위해 몸이 쉼을 선택한 거예요. 푹 쉰 것도 대단한 회복이에요" 형태의 칭찬이 도출되는가?
2. 5자 미만 입력 시 400 에러 및 경고 문구가 정상 반환되는가?