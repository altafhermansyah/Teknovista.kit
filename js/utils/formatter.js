/**
 * AMERTA 2026 Official Order Website — Formatter Utilities
 * Senior Frontend Architecture — Reusable Data & Currency Formatting
 */

const formatIDR = (amount) => {
  return new Intl.NumberFormat(APP_CONFIG.locale || 'id-ID', {
    style: 'currency',
    currency: APP_CONFIG.currency || 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || isNaN(bytes)) return '0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const generateOrderId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `AMERTA26-${randomNum}`;
};
