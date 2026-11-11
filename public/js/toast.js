// ==============================================================================
// public/js/toast.js
// 설명: 사용자에게 알림, 성공, 경고 메시지를 화면 상단에 부드럽게 띄워주는 공통 토스트 모듈
// ==============================================================================

/**
 * 토스트 메시지를 화면 상단 중앙에 표시합니다.
 * @param {string} message - 표시할 안내 문구
 * @param {'info' | 'success' | 'error' | 'warning'} type - 알림 유형 (스타일 구분)
 * @param {number} duration - 표시 시간 (기본값: 3000ms = 3초)
 */
export function showToast(message, type = 'info', duration = 3000) {
  // 1. 화면에 토스트 컨테이너가 없으면 새로 생성하여 body에 추가합니다.
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // 2. 새로운 토스트 메시지 엘리먼트 생성
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // 타입별 아이콘 매핑
  const icons = {
    info: '💡',
    success: '💌',
    error: '⚠️',
    warning: '🌿'
  };
  const icon = icons[type] || '✨';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-text">${message}</span>
  `;

  // 컨테이너에 추가 (화면에 등장)
  container.appendChild(toast);

  // 3. 지정된 시간(3초) 후 부드럽게 페이드아웃하며 DOM에서 제거
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, duration);
}

