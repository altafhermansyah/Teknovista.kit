/**
 * AMERTA 2026 Official Order Website — Toast Notification Utility
 * Senior Frontend Architecture — Modern Lightweight Notifications
 */

const showToast = (message, type = 'info') => {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconHtml = 'ℹ️';
  if (type === 'success') iconHtml = '✅';
  if (type === 'error') iconHtml = '❌';
  
  toast.innerHTML = `
    <span style="font-size: 1.25rem;">${iconHtml}</span>
    <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);"></span>
  `;
  toast.lastElementChild.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = `all ${ANIMATION_TRANSITION_MS}ms ease`;
    setTimeout(() => toast.remove(), ANIMATION_TRANSITION_MS);
  }, TOAST_DURATION_MS);
};
