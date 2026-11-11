# docs/05_feedback_feature.md - 익명 피드백 및 감정 이모지 시스템 구현 지침

## 1. 개요
로그인 없이 간편하게 서비스 이용 후기를 남기고, 저장된 후기를 최신순으로 화면에 동적 렌더링하는 전 과정을 정의합니다.

---

## 2. 백엔드 API 명세 (`api/feedback.js`)

### 2.1 GET 요청: 최신 피드백 목록 조회
- **Endpoint**: `GET /api/feedback`
- **응답 (JSON)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "e2a1b9...",
      "nickname": "따뜻한 햇살",
      "content": "오늘 너무 힘들었는데 칭찬 한마디에 눈물이 핑 돌았어요.",
      "emoji": "💖",
      "created_at": "2026-11-11T05:00:00Z"
    }
  ]
}
```

### 2.2 POST 요청: 피드백 등록
- **Endpoint**: `POST /api/feedback`
- **Request Body**:
```json
{
  "nickname": "토닥이",
  "content": "따뜻한 서비스 만들어주셔서 고맙습니다!",
  "emoji": "🌿"
}
```
- **유효성 검사**:
  - `content`: 필수, 1자 이상 150자 이하.
  - `nickname`: 선택, 미입력 시 '익명의 천사'로 자동 할당. 최대 20자.
  - `emoji`: 허용 이모지 화이트리스트(`['🌸', '🌿', '💖', '☕', '✨']`).

---

## 3. 백엔드 구현 소스 (`api/feedback.js`)

```javascript
// api/feedback.js
const supabase = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('Feedback Fetch Error:', err);
      return res.status(500).json({ success: false, message: '피드백 목록을 가져오지 못했습니다.' });
    }
  }

  if (req.method === 'POST') {
    const { nickname, content, emoji } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: '피드백 내용을 입력해 주세요.' });
    }

    if (content.length > 150) {
      return res.status(400).json({ success: false, message: '피드백은 150자 이내로 작성해 주세요.' });
    }

    const cleanNickname = (nickname && nickname.trim()) ? nickname.trim().slice(0, 20) : '익명의 천사';
    const cleanEmoji = emoji || '🌸';

    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([{ nickname: cleanNickname, content: content.trim(), emoji: cleanEmoji }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    } catch (err) {
      console.error('Feedback Insert Error:', err);
      return res.status(500).json({ success: false, message: '피드백 등록에 실패했습니다.' });
    }
  }

  return res.status(405).json({ success: false, message: '허용되지 않은 메서드입니다.' });
};
```

---

## 4. 프론트엔드 연동 흐름
1. **페이지 로드 시**: `GET /api/feedback`을 호출하여 하단 `#feedback-list` 영역에 카드 형태로 렌더링.
2. **피드백 폼 제출 시**:
   - 버튼 `disabled` 처리.
   - `POST /api/feedback` 전송.
   - 성공 시 입력창 초기화, 생성된 신규 카드를 목록의 맨 위(`prepend`)에 동적으로 삽입.
   - Toast로 *"따뜻한 한마디가 등록되었어요!"* 안내.

---

## 5. 완료 및 검증 기준
1. 피드백 작성 즉시 새로고침 없이 최신 리스트에 나타나는가?
2. 닉네임을 비워두고 작성해도 '익명의 천사'로 정상 저장되는가?
3. 악의적인 스크립트 태그(`<script>`) 삽입 시 텍스트 노드로 안전하게 이스케이프 처리되는가?