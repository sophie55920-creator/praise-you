// ==============================================================================
// public/js/app.js
// 설명: 웹사이트의 전체 UI 이벤트 처리 및 백엔드 API 연동을 담당하는 메인 스크립트
// ==============================================================================

// 공통 토스트 알림 모듈 불러오기
import { showToast } from './toast.js';

// ==============================================================================
// DOM 엘리먼트 참조
// ==============================================================================
// 1. 오늘의 온기 배너
const quoteTextEl = document.getElementById('quoteText');

// 2. 사연 입력 관련
const storyInput = document.getElementById('storyInput');
const charCounter = document.getElementById('charCounter');
const submitBtn = document.getElementById('submitBtn');

// 3. 칭찬 결과 카드 관련
const resultCard = document.getElementById('resultCard');
const praiseResultEl = document.getElementById('praiseResult');
const copyBtn = document.getElementById('copyBtn');
const retryBtn = document.getElementById('retryBtn');

// 4. 방명록(피드백) 관련
const nicknameInput = document.getElementById('nicknameInput');
const feedbackContentInput = document.getElementById('feedbackContentInput');
const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
const feedbackListEl = document.getElementById('feedbackList');
const emojiButtons = document.querySelectorAll('.emoji-btn');

// 선택된 이모지 상태값 (기본값: 🌸)
let selectedEmoji = '🌸';
// 현재 수신된 칭찬 텍스트 저장용 (복사하기 기능에 활용)
let currentPraiseText = '';

// ==============================================================================
// 1. 초기화 실행 (페이지 로드 시)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  fetchQuote();      // 오늘의 온기 한 모금 가져오기
  fetchFeedbacks();  // 방명록 목록 불러오기
  setupEventListeners(); // 모든 버튼 클릭 및 입력 이벤트 바인딩
});

// ==============================================================================
// 2. 이벤트 리스너 등록 함수
// ==============================================================================
function setupEventListeners() {
  // 1) 사연 입력창 글자 수 카운터 실시간 업데이트
  storyInput.addEventListener('input', () => {
    const currentLength = storyInput.value.length;
    charCounter.textContent = `${currentLength} / 300자 (최소 5자)`;

    // 글자 수 제한 근접 시 색상 강조
    if (currentLength >= 280) {
      charCounter.className = 'char-counter near-limit';
    } else {
      charCounter.className = 'char-counter';
    }
  });

  // 2) 칭찬과 위로 받기 버튼 클릭
  submitBtn.addEventListener('click', handlePraiseSubmit);

  // 3) 칭찬 간직하기 (클립보드 복사) 버튼 클릭
  copyBtn.addEventListener('click', handleCopyPraise);

  // 4) 다른 이야기 들려주기 (다시 쓰기) 버튼 클릭
  retryBtn.addEventListener('click', handleRetry);

  // 5) 방명록 이모지 선택 버튼 클릭
  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEmoji = btn.getAttribute('data-emoji') || '🌸';
    });
  });

  // 6) 방명록 등록 버튼 클릭
  feedbackSubmitBtn.addEventListener('click', handleFeedbackSubmit);

  // 방명록 엔터키 등록 지원
  feedbackContentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFeedbackSubmit();
    }
  });
}

// ==============================================================================
// 3. API 연동: [오늘의 온기 한 모금] 가져오기
// ==============================================================================
async function fetchQuote() {
  try {
    const response = await fetch('/api/quote');
    const data = await response.json();
    if (data.success && data.quote) {
      quoteTextEl.textContent = data.quote;
    }
  } catch (error) {
    console.error('Quote 로딩 실패:', error);
    // 오류 발생 시 기본 문구 유지
  }
}

// ==============================================================================
// 4. API 연동: [칭찬과 위로 요청] (/api/praise)
// ==============================================================================
async function handlePraiseSubmit() {
  const story = storyInput.value.trim();

  // 프론트엔드 1차 유효성 검사
  if (story.length < 5) {
    showToast('조금만 더 당신의 이야기를 들려주세요 (최소 5자) 🌿', 'warning');
    storyInput.focus();
    return;
  }

  if (story.length > 300) {
    showToast('이야기가 조금 길어요. 300자 이내로 들려주세요.', 'warning');
    return;
  }

  // 중복 클릭 방지 및 로딩 상태 UI 적용
  setSubmitLoading(true);

  try {
    const response = await fetch('/api/praise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ story: story })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      // 서버에서 전달된 오류 메시지 토스트 출력
      showToast(result.message || '마음을 불러오는 도중 바람이 불었어요. 잠시 후 다시 시도해 주세요.', 'error');
      return;
    }

    // 성공 시 전역 변수에 저장 및 화면에 타이핑 효과로 출력
    currentPraiseText = result.result;
    displayPraiseResult(currentPraiseText);

  } catch (error) {
    console.error('칭찬 생성 에러:', error);
    showToast('인터넷 연결이 불안정합니다. 연결 상태를 확인해 주세요.', 'error');
  } finally {
    setSubmitLoading(false);
  }
}

// 버튼 로딩 상태 켜기/끄기
function setSubmitLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    submitBtn.innerHTML = `
      <span class="spinner"></span>
      <span>따뜻한 마음을 빚는 중... ☕</span>
    `;
  } else {
    submitBtn.innerHTML = `
      <span>따뜻한 칭찬과 위로 받기 ✨</span>
    `;
  }
}

// 칭찬 결과를 부드러운 타이핑 효과로 렌더링
function displayPraiseResult(text) {
  resultCard.style.display = 'block';
  praiseResultEl.textContent = '';
  
  // 카드로 부드럽게 스크롤 이동
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  let index = 0;
  const speed = 25; // 타이핑 속도 (ms)

  function typeWriter() {
    if (index < text.length) {
      praiseResultEl.textContent += text.charAt(index);
      index++;
      setTimeout(typeWriter, speed);
    }
  }

  typeWriter();
}

// ==============================================================================
// 5. 기능: [칭찬 카드 복사하기]
// ==============================================================================
async function handleCopyPraise() {
  if (!currentPraiseText) {
    showToast('복사할 칭찬 내용이 없습니다.', 'warning');
    return;
  }

  // 공유하기 좋은 형태의 텍스트 포맷 구성
  const shareText = `[너를 칭찬해 - 오늘의 마음 처방전]\n"${currentPraiseText}"\n\n따뜻한 위로가 필요할 때 들러보세요 🌸`;

  try {
    await navigator.clipboard.writeText(shareText);
    showToast('칭찬이 클립보드에 복사되었어요 💌', 'success');
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    // 대체 복사 방식 (구형 브라우저 대응)
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = shareText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    showToast('칭찬이 클립보드에 복사되었어요 💌', 'success');
  }
}

// 다른 이야기 들려주기 (초기화)
function handleRetry() {
  storyInput.value = '';
  charCounter.textContent = '0 / 300자 (최소 5자)';
  resultCard.style.display = 'none';
  praiseResultEl.textContent = '';
  currentPraiseText = '';
  storyInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==============================================================================
// 6. API 연동: [방명록(피드백) 조회] (/api/feedback)
// ==============================================================================
async function fetchFeedbacks() {
  try {
    const response = await fetch('/api/feedback');
    const result = await response.json();

    if (!response.ok || !result.success) {
      feedbackListEl.innerHTML = '<div class="feedback-empty">아직 남겨진 온기가 없어요. 첫 번째 주인공이 되어보세요! 🌸</div>';
      return;
    }

    renderFeedbacks(result.data || []);
  } catch (error) {
    console.error('Feedback 조회 실패:', error);
    feedbackListEl.innerHTML = '<div class="feedback-empty">방명록을 불러오지 못했습니다.</div>';
  }
}

// 방명록 리스트 동적 렌더링
function renderFeedbacks(feedbacks) {
  if (!feedbacks || feedbacks.length === 0) {
    feedbackListEl.innerHTML = '<div class="feedback-empty">아직 남겨진 온기가 없어요. 첫 번째 주인공이 되어보세요! 🌸</div>';
    return;
  }

  feedbackListEl.innerHTML = feedbacks.map(item => {
    // 날짜 포맷 변환 (한국 시간 기준)
    const date = new Date(item.created_at);
    const dateFormatted = `${date.getMonth() + 1}월 ${date.getDate()}일`;

    // 보안을 위한 HTML 엔티티 치환 (XSS 공격 방어)
    const safeNickname = escapeHtml(item.nickname || '익명의 천사');
    const safeContent = escapeHtml(item.content || '');
    const safeEmoji = escapeHtml(item.emoji || '🌸');

    return `
      <div class="feedback-item">
        <div class="feedback-item-header">
          <span class="feedback-item-name">
            <span>${safeEmoji}</span>
            <span>${safeNickname}</span>
          </span>
          <span class="feedback-item-date">${dateFormatted}</span>
        </div>
        <div class="feedback-item-content">${safeContent}</div>
      </div>
    `;
  }).join('');
}

// ==============================================================================
// 7. API 연동: [방명록(피드백) 등록] (/api/feedback)
// ==============================================================================
async function handleFeedbackSubmit() {
  const content = feedbackContentInput.value.trim();
  const nickname = nicknameInput.value.trim() || '익명의 천사';

  if (!content) {
    showToast('따뜻한 한마디를 적어주세요 🌱', 'warning');
    feedbackContentInput.focus();
    return;
  }

  if (content.length > 150) {
    showToast('피드백은 150자 이내로 작성해 주세요.', 'warning');
    return;
  }

  feedbackSubmitBtn.disabled = true;
  feedbackSubmitBtn.textContent = '남기는 중...';

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nickname: nickname,
        content: content,
        emoji: selectedEmoji
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showToast(result.message || '피드백 등록에 실패했습니다.', 'error');
      return;
    }

    showToast('소중한 온기가 등록되었어요! 고맙습니다 💛', 'success');
    
    // 입력창 초기화
    feedbackContentInput.value = '';
    
    // 방명록 리스트 새로고침
    await fetchFeedbacks();

  } catch (error) {
    console.error('Feedback 등록 에러:', error);
    showToast('네트워크 오류가 발생했습니다.', 'error');
  } finally {
    feedbackSubmitBtn.disabled = false;
    feedbackSubmitBtn.textContent = '남기기';
  }
}

// XSS 방지를 위한 특수문자 이스케이프 함수
function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

