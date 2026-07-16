/**
 * ============================================================
 * TEKNOVISTA.KIT — Order Tracking Controller (Stage 7 Polish)
 * ------------------------------------------------------------
 * Bertugas mengelola UI halaman pelacakan pesanan (tracking.html):
 * - Membaca form & validasi input (Order ID dan WhatsApp)
 * - Auto-fill Order ID dari URL Query Parameter (?orderId=...)
 * - Auto-focus ke input WhatsApp jika Order ID sudah terisi
 * - Komunikasi via TrackingService.trackOrder()
 * - Tampilan UI profesional (Stripe / Linear / Vercel style)
 * - Order Progress Timeline dengan indikator tahapan, progres X dari 5,
 *   penanganan khusus status Ditolak/Dibatalkan, format Last Update lokal,
 *   dan interaksi Salin Order ID tanpa alert().
 * ============================================================
 */

// Centralized SVG Icon Library (Lucide Outline Icons)
const LUCIDE_ICONS = {
  tag: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  user: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  package: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  clock: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16.5 12"/></svg>`,
  circleCheck: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  search: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  messageCircle: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
  rotateCcw: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  alertCircle: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  badgeCheck: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  loaderCircle: `<svg class="lucide-icon icon-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  packageCheck: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>`,
  circleCheckBig: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  circleX: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  ban: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>`,
  info: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  copy: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  dot: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
  circle: `<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
};

const TIMELINE_STAGES = [
  {
    key: "PENDING",
    title: "Menunggu Verifikasi Pembayaran",
    desc: "Kami sedang memverifikasi pembayaran Anda."
  },
  {
    key: "VERIFIED",
    title: "Pembayaran Diverifikasi",
    desc: "Pembayaran telah berhasil diverifikasi oleh panitia."
  },
  {
    key: "PROCESSING",
    title: "Sedang Diproses",
    desc: "Pesanan Anda sedang dipersiapkan oleh panitia."
  },
  {
    key: "READY",
    title: "Siap Diambil",
    desc: "Pesanan telah selesai dipersiapkan dan siap diambil sesuai informasi panitia."
  },
  {
    key: "COMPLETED",
    title: "Selesai",
    desc: "Pesanan telah berhasil diselesaikan."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initTrackingController();
});

function initTrackingController() {
  const trackingForm = document.getElementById("trackingForm");
  const orderIdInput = document.getElementById("track-order-id");
  const whatsappInput = document.getElementById("track-whatsapp");

  if (!trackingForm || !orderIdInput || !whatsappInput) return;

  // Clear error message when user starts typing
  orderIdInput.addEventListener("input", () => {
    clearFieldError("track-order-id");
  });

  whatsappInput.addEventListener("input", () => {
    clearFieldError("track-whatsapp");
  });

  // Auto-read orderId from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const paramOrderId = urlParams.get("orderId");
  if (paramOrderId && paramOrderId.trim() !== "") {
    orderIdInput.value = paramOrderId.trim();
    // Automatically focus the WhatsApp input so user only needs to type WhatsApp number
    setTimeout(() => {
      whatsappInput.focus();
    }, 50);
  } else {
    orderIdInput.focus();
  }

  // Submit Event via Button Click or Enter key inside form
  trackingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleTrackingSubmit();
  });
}

function clearFieldError(fieldId) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (inputEl) inputEl.classList.remove("error");
  if (errorEl) errorEl.textContent = "";
}

function showFieldError(fieldId, message) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (inputEl) {
    inputEl.classList.add("error");
    inputEl.focus();
  }
  if (errorEl) errorEl.textContent = message;
}

function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.setAttribute("role", "alert");
    container.setAttribute("aria-live", "assertive");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = type === "success" ? LUCIDE_ICONS.circleCheck : (type === "error" ? LUCIDE_ICONS.alertCircle : LUCIDE_ICONS.info);
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 300ms ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function copyTrackingOrderId(text) {
  if (!text || text === "-") return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Order ID berhasil disalin!", "success");
    });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    showToast("Order ID berhasil disalin!", "success");
  }
}

window.copyTrackingOrderId = copyTrackingOrderId;

function formatLastUpdate(rawDateStr) {
  if (!rawDateStr || rawDateStr === "-") return "-";
  try {
    const str = String(rawDateStr).trim();
    // If already localized like "15 Juli 2026 09.25 WIB" or "15 Juli 2026 • 09.25 WIB"
    if (str.includes("Juli") && str.includes("WIB")) {
      if (str.includes("•")) return str;
      return str.replace(/(\d{4})\s+(\d{2}[.:]\d{2}\s*WIB)/, "$1 • $2");
    }

    const dateObj = new Date(str);
    if (!isNaN(dateObj.getTime())) {
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const mins = String(dateObj.getMinutes()).padStart(2, "0");
      return `${day} ${month} ${year} • ${hours}.${mins} WIB`;
    }
  } catch (e) {
    console.warn("Date formatting fallback:", e);
  }
  return String(rawDateStr);
}

async function handleTrackingSubmit() {
  const orderIdInput = document.getElementById("track-order-id");
  const whatsappInput = document.getElementById("track-whatsapp");
  const btnTrackOrder = document.getElementById("btnTrackOrder");
  const loadingState = document.getElementById("trackingLoadingState");
  const resultContainer = document.getElementById("trackingResultContainer");

  clearFieldError("track-order-id");
  clearFieldError("track-whatsapp");

  const orderId = orderIdInput.value.trim();
  const whatsapp = whatsappInput.value.trim();

  let isValid = true;

  if (!orderId) {
    showFieldError("track-order-id", "Order ID wajib diisi.");
    isValid = false;
  }

  if (!whatsapp) {
    if (isValid) {
      showFieldError("track-whatsapp", "Nomor WhatsApp wajib diisi.");
    } else {
      const waError = document.getElementById("error-track-whatsapp");
      if (waError) waError.textContent = "Nomor WhatsApp wajib diisi.";
      whatsappInput.classList.add("error");
    }
    isValid = false;
  }

  if (!isValid) return;

  // Set Loading State
  btnTrackOrder.disabled = true;
  btnTrackOrder.innerHTML = `${LUCIDE_ICONS.loaderCircle}<span>Mencari data pesanan...</span>`;
  if (resultContainer) resultContainer.style.display = "none";
  if (loadingState) {
    loadingState.style.display = "block";
    loadingState.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  try {
    if (!window.TrackingService || typeof window.TrackingService.trackOrder !== "function") {
      throw new Error("Layanan pelacakan (TrackingService) tidak tersedia.");
    }

    const data = await window.TrackingService.trackOrder(orderId, whatsapp);

    if (loadingState) loadingState.style.display = "none";
    renderSuccessCard(data);

  } catch (error) {
    console.error("[TRACKING CONTROLLER]", error);
    if (loadingState) loadingState.style.display = "none";
    renderErrorCard(error.message || "Pesanan tidak ditemukan. Pastikan Order ID dan Nomor WhatsApp sesuai.");
  } finally {
    btnTrackOrder.disabled = false;
    btnTrackOrder.innerHTML = `${LUCIDE_ICONS.search}<span>Lacak Pesanan</span>`;
  }
}

/**
 * Maps Spreadsheet status string into clean visual badges & SVG outline icons
 * @param {string} statusRaw
 * @returns {Object} { label, badgeClass, icon }
 */
function getStatusBadgeInfo(statusRaw) {
  if (!statusRaw) {
    return {
      label: "Menunggu Verifikasi Pembayaran",
      badgeClass: "badge-yellow",
      icon: LUCIDE_ICONS.clock
    };
  }

  const statusClean = String(statusRaw).trim();
  const statusUpper = statusClean.toUpperCase();

  // 1. Menunggu Verifikasi Pembayaran / Pending -> Yellow badge, Clock3 icon
  if (
    statusUpper.includes("MENUNGGU VERIFIKASI") ||
    statusUpper === "VERIFICATION_PENDING" ||
    statusUpper === "PENDING"
  ) {
    return {
      label: "Menunggu Verifikasi Pembayaran",
      badgeClass: "badge-yellow",
      icon: LUCIDE_ICONS.clock
    };
  }

  // 2. Pembayaran Diverifikasi / Verified -> Blue badge, BadgeCheck icon
  if (
    statusUpper.includes("PEMBAYARAN DIVERIFIKASI") ||
    statusUpper === "VERIFIED" ||
    statusUpper === "DIVERIFIKASI"
  ) {
    return {
      label: "Pembayaran Diverifikasi",
      badgeClass: "badge-blue",
      icon: LUCIDE_ICONS.badgeCheck
    };
  }

  // 3. Sedang Diproses / Processing -> Orange badge, LoaderCircle icon
  if (
    statusUpper.includes("SEDANG DIPROSES") ||
    statusUpper.includes("DIPROSES") ||
    statusUpper === "PROCESSING"
  ) {
    return {
      label: "Sedang Diproses",
      badgeClass: "badge-orange",
      icon: LUCIDE_ICONS.loaderCircle
    };
  }

  // 4. Siap Diambil / Ready -> Green badge, PackageCheck icon
  if (statusUpper.includes("SIAP DIAMBIL") || statusUpper.includes("READY")) {
    return {
      label: "Siap Diambil",
      badgeClass: "badge-green",
      icon: LUCIDE_ICONS.packageCheck
    };
  }

  // 5. Selesai / Completed -> Green Success Badge, CircleCheckBig icon
  if (
    statusUpper === "SELESAI" ||
    statusUpper === "COMPLETED" ||
    statusUpper === "DONE"
  ) {
    return {
      label: "Selesai",
      badgeClass: "badge-success",
      icon: LUCIDE_ICONS.circleCheckBig
    };
  }

  // 6. Ditolak / Rejected -> Red badge, CircleX icon
  if (statusUpper.includes("DITOLAK") || statusUpper === "REJECTED") {
    return {
      label: "Ditolak",
      badgeClass: "badge-red",
      icon: LUCIDE_ICONS.circleX
    };
  }

  // 7. Dibatalkan / Cancelled -> Gray badge, Ban icon
  if (
    statusUpper.includes("DIBATALKAN") ||
    statusUpper === "CANCELLED" ||
    statusUpper === "CANCELED"
  ) {
    return {
      label: "Dibatalkan",
      badgeClass: "badge-gray",
      icon: LUCIDE_ICONS.ban
    };
  }

  // Default Fallback
  return {
    label: statusClean,
    badgeClass: "badge-blue",
    icon: LUCIDE_ICONS.info
  };
}

/**
 * Determines timeline progress index or special state
 * @param {string} statusRaw
 */
function getOrderTimelineState(statusRaw) {
  if (!statusRaw) {
    return { currentStageIndex: 0, specialState: null };
  }
  const clean = String(statusRaw).trim().toUpperCase();

  if (clean.includes("DITOLAK") || clean === "REJECTED") {
    return {
      currentStageIndex: -1,
      specialState: {
        type: "REJECTED",
        title: "Ditolak",
        desc: "Mohon hubungi admin untuk informasi lebih lanjut mengenai pesanan Anda.",
        badgeClass: "badge-red",
        icon: LUCIDE_ICONS.circleX
      }
    };
  }

  if (clean.includes("DIBATALKAN") || clean === "CANCELLED" || clean === "CANCELED") {
    return {
      currentStageIndex: -1,
      specialState: {
        type: "CANCELLED",
        title: "Dibatalkan",
        desc: "Pesanan telah dibatalkan.",
        badgeClass: "badge-gray",
        icon: LUCIDE_ICONS.ban
      }
    };
  }

  if (clean === "SELESAI" || clean === "COMPLETED" || clean === "DONE") {
    return { currentStageIndex: 4, specialState: null };
  }

  if (clean.includes("SIAP DIAMBIL") || clean.includes("READY")) {
    return { currentStageIndex: 3, specialState: null };
  }

  if (clean.includes("SEDANG DIPROSES") || clean.includes("DIPROSES") || clean === "PROCESSING") {
    return { currentStageIndex: 2, specialState: null };
  }

  if (clean.includes("PEMBAYARAN DIVERIFIKASI") || clean === "VERIFIED" || clean === "DIVERIFIKASI") {
    return { currentStageIndex: 1, specialState: null };
  }

  return { currentStageIndex: 0, specialState: null };
}

/**
 * Renders the Success Card displaying Order ID, Nama, Produk, Status, Last Update, and Order Progress Timeline.
 * @param {Object} data
 */
function renderSuccessCard(data) {
  const resultContainer = document.getElementById("trackingResultContainer");
  if (!resultContainer) return;

  const badgeInfo = getStatusBadgeInfo(data.status);
  const timelineState = getOrderTimelineState(data.status);
  const orderId = escapeHtml(data.orderId || "-");
  const nama = escapeHtml(data.nama || "-");
  const produk = escapeHtml(data.produk || "-");
  const lastUpdate = escapeHtml(formatLastUpdate(data.lastUpdate || "-"));

  let progressSectionHtml = "";

  if (timelineState.specialState) {
    const sp = timelineState.specialState;
    progressSectionHtml = `
      <div class="tracking-progress-section">
        <div class="tracking-special-card ${sp.type.toLowerCase()}">
          <div class="special-icon">${sp.icon}</div>
          <div class="special-content">
            <h5>Status Pesanan: ${sp.title}</h5>
            <p>${sp.desc}</p>
            <a href="https://wa.me/62881036633600" target="_blank" rel="noopener" class="btn btn-secondary btn-sm help-btn">
              ${LUCIDE_ICONS.messageCircle}
              <span>Hubungi Admin</span>
            </a>
          </div>
        </div>
      </div>
    `;
  } else {
    const currentIdx = timelineState.currentStageIndex;
    const completedCount = currentIdx + 1;
    const progressPercent = Math.round((completedCount / TIMELINE_STAGES.length) * 100);

    let timelineItemsHtml = "";
    TIMELINE_STAGES.forEach((stage, idx) => {
      let stateClass = "future";
      let iconHtml = LUCIDE_ICONS.circle;
      if (idx < currentIdx) {
        stateClass = "completed";
        iconHtml = LUCIDE_ICONS.circleCheckBig;
      } else if (idx === currentIdx) {
        stateClass = "current";
        iconHtml = LUCIDE_ICONS.dot;
      }

      timelineItemsHtml += `
        <div class="timeline-item ${stateClass}" role="listitem" aria-current="${idx === currentIdx ? 'step' : 'false'}">
          <div class="timeline-marker">
            <div class="timeline-icon">${iconHtml}</div>
            <div class="timeline-connector"></div>
          </div>
          <div class="timeline-content">
            <div class="timeline-title">${stage.title}</div>
            <p class="timeline-desc">${stage.desc}</p>
          </div>
        </div>
      `;
    });

    progressSectionHtml = `
      <div class="tracking-progress-section">
        <div class="tracking-progress-header">
          <h5>Order Progress</h5>
          <span class="progress-count-badge">${completedCount} dari 5 tahap selesai (${progressPercent}%)</span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="tracking-timeline" role="list" aria-label="Order Progress Timeline">
          ${timelineItemsHtml}
        </div>
      </div>
    `;
  }

  const html = `
    <div class="tracking-result-card">
      <div class="tracking-result-header">
        <h4>
          ${LUCIDE_ICONS.package}
          <span>Rincian Status Pesanan</span>
        </h4>
        <div class="tracking-status-badge ${badgeInfo.badgeClass}">
          ${badgeInfo.icon}
          <span>${badgeInfo.label}</span>
        </div>
      </div>

      <div class="tracking-result-body">
        <div class="tracking-detail-item">
          <span class="detail-label">${LUCIDE_ICONS.tag}<span>Order ID</span></span>
          <span class="detail-val" style="display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
            <span class="order-id-highlight">${orderId}</span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="copyTrackingOrderId('${orderId}')" aria-label="Salin Order ID" title="Salin Order ID">
              ${LUCIDE_ICONS.copy}
              <span>Salin</span>
            </button>
          </span>
        </div>

        <div class="tracking-detail-item">
          <span class="detail-label">${LUCIDE_ICONS.user}<span>Nama Lengkap</span></span>
          <span class="detail-val font-bold text-primary">${nama}</span>
        </div>

        <div class="tracking-detail-item">
          <span class="detail-label">${LUCIDE_ICONS.package}<span>Atribut / Produk</span></span>
          <span class="detail-val">${produk}</span>
        </div>

        <div class="tracking-detail-item">
          <span class="detail-label">${LUCIDE_ICONS.circleCheck}<span>Status Terkini</span></span>
          <span class="detail-val">
            <span class="tracking-status-badge ${badgeInfo.badgeClass}" style="display: inline-flex;">
              ${badgeInfo.icon}
              <span>${badgeInfo.label}</span>
            </span>
          </span>
        </div>

        <div class="tracking-detail-item">
          <span class="detail-label">${LUCIDE_ICONS.clock}<span>Terakhir Diperbarui</span></span>
          <span class="detail-val text-muted font-bold">${lastUpdate}</span>
        </div>

        ${progressSectionHtml}

        ${!timelineState.specialState ? `
        <div class="tracking-help-box mt-4">
          <div class="help-box-content">
            <span class="help-title font-bold text-main">Need help?</span>
            <span class="help-subtitle text-muted">If your order appears incorrect or has not changed for several days, please contact the committee.</span>
          </div>
          <a href="https://wa.me/6285640936728" target="_blank" rel="noopener" class="btn btn-secondary btn-sm help-btn">
            ${LUCIDE_ICONS.messageCircle}
            <span>Message Admin</span>
          </a>
        </div>
        ` : ""}
      </div>
    </div>
  `;

  resultContainer.innerHTML = html;
  resultContainer.style.display = "block";
  resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Renders the Error Card when order is not found or error occurs
 * @param {string} errorMessage
 */
function renderErrorCard(errorMessage) {
  const resultContainer = document.getElementById("trackingResultContainer");
  if (!resultContainer) return;

  const safeMessage = escapeHtml(
    errorMessage || "Pesanan tidak ditemukan. Pastikan Order ID dan Nomor WhatsApp sesuai."
  );

  const html = `
    <div class="tracking-error-card">
      <div class="tracking-error-icon">${LUCIDE_ICONS.alertCircle}</div>
      <h4>Pesanan Tidak Ditemukan</h4>
      <p>${safeMessage}</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('track-order-id').focus();">
          ${LUCIDE_ICONS.rotateCcw}
          <span>Coba Lagi</span>
        </button>
        <a href="https://wa.me/62881036633600" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
          ${LUCIDE_ICONS.messageCircle}
          <span>Hubungi Admin</span>
        </a>
      </div>
    </div>
  `;

  resultContainer.innerHTML = html;
  resultContainer.style.display = "block";
  resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Escapes HTML characters to prevent XSS attacks
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
