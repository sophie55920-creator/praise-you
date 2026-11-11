# docs/06_additional_features_and_errors.md - 부가 기능 및 예외 처리 시스템 지침

## 1. 개요
서비스의 완성도를 높이고 긍정적인 사용자 경험을 완성하기 위한 **오류 처리 시스템(Toast)**과 서비스 특화 **부가 기능 2종(칭찬 카드 복사 & 오늘의 온기 한 모금)** 구현 명세입니다.

---

## 2. 오류 메시지 처리 시스템 (Toast UI)

### 2.1 Toast 모듈 (`public/js/toast.js`)
중앙 관리형 토스트 알림으로 화면 상단에 3초간 부드럽게 노출된 후 사라집니다.

```javascript
// public/js/toast.js
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  // 나타나는 애니메이션 후 3초 뒤 소멸
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}
```

### 2.2 표준 오류 코드별 사용자 안내 메시지 매핑
- **글자 수 부족 (< 5자)**: *"조금만 더 당신의 이야기를 들려주세요 (최소 5자)"*
- **글자 수 초과 (> 300자)**: *"이야기가 조금 길어요. 300자 이내로 들려주세요."*
- **네트워크 오프라인**: *"인터넷 연결이 불안정합니다. 연결 상태를 확인해 주세요."*
- **서버 오류 (500)**: *"마음을 전하는 길목에 잠시 바람이 불었어요. 잠시 후 다시 시도해 주세요."*

---

## 3. 특화 추가 기능 명세

### 3.1 추가기능 1: [칭찬 카드 원클릭 클립보드 복사]
- **목적**: AI의 따뜻한 칭찬을 개인 메모장에 보관하거나 메신저로 지인과 쉽게 나눌 수 있도록 편의 제공.
- **구현 방식**:
  - 결과 카드 하단에 [📋 칭찬 간직하기] 버튼 배치.
  - 클릭 시 `navigator.clipboard.writeText()` 실행.
  - 복사 문구 포맷:
    ```text
    [너를 칭찬해 - 오늘의 마음 처방전]
    "사용자가 받은 AI 칭찬 내용"
    
    따뜻한 위로가 필요할 때: https://praise-you.vercel.app
    ```
  - 복사 완료 시 `showToast('칭찬이 클립보드에 복사되었어요 💌', 'success')` 호출.

### 3.2 추가기능 2: [오늘의 온기 한 모금 (랜덤 힐링 문구)]
- **목적**: 사용자가 고민을 적기 전 긴장을 풀 수 있도록 메인 상단에 따뜻한 응원 문구를 노출.
- **구현 방식**:
  - `api/quote.js` 엔드포인트에서 20여 개의 엄선된 힐링 글귀 중 1개를 랜덤 반환.
  - 화면 상단 배너에 새로고침 시마다 잔잔하게 노출.
  - 예시 글귀:
    - *"오늘 하루도 살아내느라 참 애썼어요."*
    - *"완벽하지 않아도 괜찮아요. 당신은 이미 충분히 빛나고 있으니까요."*
    - *"숨 한번 크게 쉬고, 어깨를 가볍게 털어보세요."*

---

## 4. 백엔드 구현 소스 (`api/quote.js`)

```javascript
// api/quote.js
const quotes = [
  "오늘 하루도 온 힘을 다해 살아낸 당신을 진심으로 칭찬해요.",
  "잠시 멈춰 서서 숨을 고르는 것도 앞으로 나아가는 멋진 방법이에요.",
  "당신이 존재하는 것만으로도 누군가에겐 커다란 위로가 됩니다.",
  "작은 발걸음이라도 괜찮아요. 당신만의 속도로 걷고 있으니까요.",
  "오늘 있었던 실수보다, 도전했던 당신의 용기를 더 기억해 주세요."
];

module.exports = async (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return res.status(200).json({ success: true, quote: randomQuote });
};
```

---

## 5. 완료 및 검증 기준
1. 클립보드 복사 버튼 클릭 시 복사 완료 알림이 뜨고 실제 붙여넣기 시 올바른 포맷으로 복사되는가?
2. 빈 값 및 서버 강제 에러 발생 시 지정된 친절한 Toast 알림이 3초간 정확히 나타나는가?
3. 브라우저 새로고침 시 상단 배너에 새로운 온기 한 문장이 로딩되는가?