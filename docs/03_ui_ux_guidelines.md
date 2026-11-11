# docs/03_ui_ux_guidelines.md - UI/UX 디자인 및 프론트엔드 퍼블리싱 지침

## 1. 디자인 컨셉: "포근한 찻집에서의 위로"
- **분위기**: 따스하고 부담 없는 감성적인 힐링 무드.
- **컬러 팔레트**:
  - Background: Warm Cream (`#FDFBF7`)
  - Primary / Point: Warm Coral / Peach (`#FF8E72`)
  - Card Surface: Pure White (`#FFFFFF`) with Soft Shadow (`rgba(0, 0, 0, 0.04)`)
  - Text Primary: Deep Charcoal Warm (`#2D2B2A`)
  - Text Secondary: Muted Gray (`#7A7571`)
  - Error: Soft Crimson (`#E55353`)
  - Success: Soft Forest Green (`#48A974`)

---

## 2. 화면 레이아웃 구성 (`index.html`)

화면은 수직 1열 중앙 정렬 카드형 레이아웃(최대 너비 560px)으로 구성합니다.

```text
+----------------------------------------------------+
| 1. Header: 타이틀 ("너를 칭찬해") + 감성 서브카피   |
|    [추가기능: 오늘의 온기 한 모금 배너]           |
+----------------------------------------------------+
| 2. Input Section:                                  |
|    - 오늘 무슨 일이 있었나요? (Textarea, 최대 300자)|
|    - 글자 수 카운터 (0/300)                        |
|    - [칭찬과 위로 받기] 버튼 (로딩 시 스피너 동작) |
+----------------------------------------------------+
| 3. Result Section (결과 카드):                     |
|    - AI 공감/위로/칭찬 텍스트 출력 영역            |
|    - [복사하기 버튼] [다시 쓰기 버튼]              |
+----------------------------------------------------+
| 4. Feedback Section:                               |
|    - 피드백 작성 폼 (닉네임 + 내용 + 등록 버튼)    |
|    - 실시간 피드백 목록 (최신순 스크롤 카드 리스트)|
+----------------------------------------------------+
| 5. Toast 알림 컨테이너 (화면 상단 중앙 플로팅)     |
+----------------------------------------------------+
```

---

## 3. 핵심 CSS 스타일 가이드라인 (`public/css/style.css`)

```css
:root {
  --bg-color: #FDFBF7;
  --surface-color: #FFFFFF;
  --primary-color: #FF8E72;
  --primary-hover: #F27A5D;
  --text-main: #2D2B2A;
  --text-muted: #7A7571;
  --border-color: #EFECE6;
  --radius-lg: 20px;
  --radius-md: 12px;
  --shadow-card: 0 8px 24px rgba(149, 130, 115, 0.08);
}

body {
  margin: 0;
  padding: 24px 16px;
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif;
  line-height: 1.6;
}

.container {
  max-width: 560px;
  margin: 0 auto;
}

.card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #D9D4CE;
  cursor: not-allowed;
  transform: none;
}
```

---

## 4. UI 상호작용 및 반응성 규칙
1. **스피너 애니메이션**: AI 생성 요청 중 버튼 텍스트가 *"따뜻한 마음을 빚는 중..."* 으로 변경되며 로딩 스피너 활성화.
2. **트랜지션 효과**: 결과 카드가 나타날 때 부드러운 페이드인(`fade-in`) 및 슬라이드업 효과 적용.
3. **글자 수 표시**: 300자에 가까워질 때(280자 이상) 글자 수 카운터 색상이 주황색/붉은색으로 강조.

---

## 5. 완료 및 검증 기준
- 모바일(375px 너비) 디바이스에서 가로 스크롤(Overflow)이 발생하지 않는가?
- 버튼 클릭 반응, 포커스 아웃라인, 플레이스홀더 텍스트가 명확하게 보이는가?