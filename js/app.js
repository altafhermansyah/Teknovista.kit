/**
 * AMERTA 2026 Official Order Website — Core Application Controller
 * Senior Frontend Architecture Implementation
 * Refactored modular structure ready for Google Apps Script integration.
 */

// Centralized Application State
const appState = {
  participant: {
    nama: '',
    nim: '',
    fakultas: '',
    garuda: '',
    ksatria: '',
    kelompok: '',
    whatsapp: '',
    alamat: ''
  },
  products: {
    selected: {}, // Map of productId -> quantity
    bundleActive: false
  },
  payment: {
    method: 'qris',
    proofFile: null
  },
  order: {
    orderId: null,
    timestamp: null,
    status: STATUS_DRAFT
  },
  config: {
    deadline: APP_CONFIG.deadlineTimestamp,
    productsList: productsList,
    bundle: bundlePackage
  },
  ui: {
    currentStep: STEP_PRODUCT,
    isSubmitting: false
  }
};

const getCombinedKelompok = (p = appState.participant) => {
  if (p.garuda && p.ksatria) {
    return `Garuda ${p.garuda} / Ksatria ${p.ksatria}`;
  }
  return p.kelompok || '';
};
window.getCombinedKelompok = getCombinedKelompok;

// ============================================================================
// 1. PRICE CALCULATION ENGINE
// ============================================================================
const calculateOrderTotal = () => {
  if (appState.products.bundleActive) {
    return {
      total: bundlePackage.price,
      itemCount: bundlePackage.includes.length,
      isBundle: true,
      savings: bundlePackage.savings
    };
  }

  let total = 0;
  let itemCount = 0;

  Object.keys(appState.products.selected).forEach((prodId) => {
    if (appState.products.selected[prodId] > 0) {
      const prod = productsList.find(p => p.id === prodId);
      if (prod) {
        total += prod.price;
        itemCount += 1;
      }
    }
  });

  return {
    total,
    itemCount,
    isBundle: false,
    savings: 0
  };
};

// ============================================================================
// 2. PRODUCT RENDERING & SELECTION LOGIC
// ============================================================================
const renderStep1ProductSelection = () => {
  const bundleBanner = document.getElementById('step1BundleBanner');
  const selectionGrid = document.getElementById('step1ProductsGrid');
  if (!bundleBanner || !selectionGrid) return;

  if (!appState.products || typeof appState.products !== 'object') {
    appState.products = { selected: {}, bundleActive: false };
  }
  if (!appState.products.selected || typeof appState.products.selected !== 'object') {
    appState.products.selected = {};
  }

  const isBundleActive = !!appState.products.bundleActive;

  bundleBanner.innerHTML = `
    <div>
      <span class="bundle-badge">⚡ Rekomendasi Terpopuler</span>
      <h4>${bundlePackage.name}</h4>
      <p>${bundlePackage.desc}</p>
    </div>
    <div class="bundle-price-box">
      <div class="bundle-price-strike">${formatIDR(bundlePackage.originalPrice)}</div>
      <div class="bundle-price">${formatIDR(bundlePackage.price)}</div>
      <button type="button" class="btn ${isBundleActive ? 'btn-secondary' : 'btn-accent'} mt-2" id="btnToggleBundle">
        ${isBundleActive ? '✓ Paket Terpilih' : '+ Ambil Paket Lengkap'}
      </button>
    </div>
  `;

  const toggleBtn = document.getElementById('btnToggleBundle');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      if (appState.products.bundleActive) {
        appState.products.bundleActive = false;
        appState.products.selected = {};
        showToast('Paket Bundle dibatalkan. Silakan pilih produk satuan.', 'info');
      } else {
        appState.products.bundleActive = true;
        appState.products.selected = {};
        showToast('Paket Bundle Lengkap berhasil dipilih!', 'success');
      }
      saveStateToStorage();
      renderStep1ProductSelection();
      updateLiveSummaryBar();
    };
  }

  const catalogList = (typeof productsList !== 'undefined' && Array.isArray(productsList) && productsList.length > 0)
    ? productsList
    : (appState?.config?.productsList || []);

  let gridHtml = '';
  catalogList.forEach((prod) => {
    const isSelected = !isBundleActive && !!(appState.products.selected && appState.products.selected[prod.id] > 0);
    gridHtml += `
      <div class="select-product-card ${isSelected ? 'active' : ''} ${isBundleActive ? 'opacity-50' : ''}" 
           data-prod-id="${prod.id}">
        <div class="select-checkbox">${isSelected ? '✓' : ''}</div>
        <div class="select-thumb">
          <img src="${prod.image}" alt="${prod.name}" />
        </div>
        <div class="select-details">
          <h5>${prod.name}</h5>
          <div class="price">${formatIDR(prod.price)}</div>
          <p class="select-desc">${prod.desc}</p>
        </div>
      </div>
    `;
  });

  selectionGrid.innerHTML = gridHtml;

  selectionGrid.querySelectorAll('.select-product-card').forEach((cardEl) => {
    cardEl.onclick = () => {
      const prodId = cardEl.getAttribute('data-prod-id');
      if (appState.products.bundleActive) {
        showConfirm(
          'Beralih ke Pilihan Satuan?',
          'Anda saat ini memilih Paket Bundle Lengkap. Apakah ingin menonaktifkan bundle dan memilih produk satuan?',
          () => {
            appState.products.bundleActive = false;
            appState.products.selected = { [prodId]: 1 };
            saveStateToStorage();
            renderStep1ProductSelection();
            updateLiveSummaryBar();
          }
        );
        return;
      }

      if (appState.products.selected[prodId] > 0) {
        delete appState.products.selected[prodId];
      } else {
        appState.products.selected[prodId] = 1;
      }
      saveStateToStorage();
      renderStep1ProductSelection();
      updateLiveSummaryBar();
    };
  });
};

const updateLiveSummaryBar = () => {
  const labelEl = document.getElementById('liveSummaryLabel');
  const amountEl = document.getElementById('liveSummaryAmount');
  if (!labelEl || !amountEl) return;

  const calc = calculateOrderTotal();
  if (calc.isBundle) {
    labelEl.innerHTML = `Terpilih: <b>Bundle Lengkap (4 Atribut)</b> — Hemat ${formatIDR(calc.savings)}`;
  } else if (calc.itemCount === 0) {
    labelEl.innerHTML = `Belum ada produk yang dipilih`;
  } else {
    labelEl.innerHTML = `Terpilih: <b>${calc.itemCount} Atribut Satuan</b>`;
  }
  amountEl.textContent = formatIDR(calc.total);
};

// ============================================================================
// 3. STEP 3: PAYMENT & FILE UPLOAD HANDLER
// ============================================================================
const setupPaymentStep = () => {
  const methodSelect = document.getElementById('paymentMethodSelect');
  if (methodSelect) {
    methodSelect.value = appState.payment.method || 'qris';
    methodSelect.onchange = () => {
      appState.payment.method = methodSelect.value;
      saveStateToStorage();
    };
  }

  const totalDisplay = document.getElementById('paymentStepTotalAmount');
  if (totalDisplay) {
    const calc = calculateOrderTotal();
    totalDisplay.textContent = formatIDR(calc.total);
  }

  const dropZone = document.getElementById('dropZoneArea');
  const fileInput = document.getElementById('proofFileInput');
  if (!dropZone || !fileInput) return;

  dropZone.onclick = () => fileInput.click();

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove('dragover');
  };

  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  fileInput.onchange = () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFileUpload(fileInput.files[0]);
    }
  };

  renderUploadedFilePreview();
};

const handleFileUpload = (file) => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    showToast('Format file tidak didukung! Unggah JPG, PNG, atau PDF.', 'error');
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    showToast('Ukuran file maksimal 5 MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    appState.payment.proofFile = {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      dataUrl: e.target.result,
      originalFile: file // <-- BARIS BARU: Menyimpan objek file mentah untuk dikompresi di api.js
    };
    saveStateToStorage();
    renderUploadedFilePreview();
    showToast('Bukti pembayaran berhasil diunggah!', 'success');
  };
  reader.readAsDataURL(file);
};

const renderUploadedFilePreview = () => {
  const zone = document.getElementById('dropZoneArea');
  const previewBox = document.getElementById('filePreviewContainer');
  if (!zone || !previewBox) return;

  if (!appState.payment.proofFile) {
    zone.style.display = 'block';
    previewBox.style.display = 'none';
    return;
  }

  zone.style.display = 'none';
  previewBox.style.display = 'flex';

  const f = appState.payment.proofFile;
  const isImg = f.type && f.type.startsWith('image/');

  const thumbEl = document.getElementById('previewFileThumb');
  const nameEl = document.getElementById('previewFileName');
  const sizeEl = document.getElementById('previewFileSize');

  if (thumbEl) {
    thumbEl.innerHTML = isImg
      ? `<img src="${f.dataUrl}" alt="Proof" />`
      : `<span style="font-size:1.5rem;">📄</span>`;
  }
  if (nameEl) nameEl.textContent = f.name;
  if (sizeEl) sizeEl.textContent = f.size;

  const btnReplace = document.getElementById('btnReplaceFile');
  if (btnReplace) {
    btnReplace.onclick = () => document.getElementById('proofFileInput')?.click();
  }

  const btnRemove = document.getElementById('btnRemoveFile');
  if (btnRemove) {
    btnRemove.onclick = () => {
      appState.payment.proofFile = null;
      saveStateToStorage();
      renderUploadedFilePreview();
      showToast('Bukti pembayaran dihapus.', 'info');
    };
  }
};

// ============================================================================
// 4. STEP 4: CONFIRMATION REVIEW
// ============================================================================
const renderConfirmationReview = () => {
  const partBox = document.getElementById('reviewParticipantData');
  const prodBox = document.getElementById('reviewProductData');
  const payBox = document.getElementById('reviewPaymentData');
  if (!partBox || !prodBox || !payBox) return;

  const p = appState.participant;
  partBox.innerHTML = `
    <div class="review-row"><span class="label">Nama Lengkap</span><span class="val">${p.nama || '-'}</span></div>
    <div class="review-row"><span class="label">NIM</span><span class="val">${p.nim || '-'}</span></div>
    <div class="review-row"><span class="label">Fakultas</span><span class="val">${p.fakultas || '-'}</span></div>
    <div class="review-row"><span class="label">Kelompok</span><span class="val">${getCombinedKelompok(p) || '-'}</span></div>
    <div class="review-row"><span class="label">WhatsApp</span><span class="val">${p.whatsapp || '-'}</span></div>
    <div class="review-row"><span class="label">Alamat</span><span class="val">${p.alamat || '-'}</span></div>
  `;

  const calc = calculateOrderTotal();
  let prodHtml = '';
  if (calc.isBundle) {
    prodHtml += `
      <div class="review-row">
        <span class="label">Paket Dipilih</span>
        <span class="val text-accent">Bundle Package Lengkap (4 Atribut)</span>
      </div>
    `;
  } else {
    Object.keys(appState.products.selected).forEach((prodId) => {
      if (appState.products.selected[prodId] > 0) {
        const item = productsList.find(i => i.id === prodId);
        if (item) {
          prodHtml += `<div class="review-row"><span class="label">${item.name}</span><span class="val">${formatIDR(item.price)}</span></div>`;
        }
      }
    });
  }

  prodHtml += `
    <div class="review-row" style="margin-top:12px; padding-top:12px; border-top:2px solid var(--border);">
      <span class="label font-bold" style="color:var(--primary); font-size:1.1rem;">Total Tagihan</span>
      <span class="val font-bold text-accent" style="font-size:1.25rem;">${formatIDR(calc.total)}</span>
    </div>
  `;
  prodBox.innerHTML = prodHtml;

  const payMethodName = appState.payment.method === 'qris'
    ? 'QRIS Standar Nasional (Semua E-Wallet / M-Banking)'
    : 'Transfer Bank Resmi UNAIR';
  const fName = appState.payment.proofFile ? appState.payment.proofFile.name : 'Belum diunggah';

  payBox.innerHTML = `
    <div class="review-row"><span class="label">Metode Pembayaran</span><span class="val">${payMethodName}</span></div>
    <div class="review-row"><span class="label">File Bukti Pembayaran</span><span class="val">${fName}</span></div>
  `;
};

// ============================================================================
// 5. STEP 5 & API INTEGRATION SIMULATION
// ============================================================================
const submitOrderToBackend = async () => {
  const agreementCheck = document.getElementById('checkAgreeTerms');
  if (agreementCheck && !agreementCheck.checked) {
    showToast('Silakan centang pernyataan kebenaran data terlebih dahulu!', 'error');
    return;
  }

  if (appState.ui.isSubmitting) return;
  appState.ui.isSubmitting = true;

  const btnSubmit = document.getElementById('btnSubmitOrder');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `⏳ Memproses Pesanan...`;
  }

  const orderId = generateOrderId();
  const timestamp = new Date().toISOString();
  const calc = calculateOrderTotal();

  // 1. Format rincian produk menjadi teks untuk direkap di Sheet/Telegram
  let produkDetail = calc.isBundle ? "Bundle Package Lengkap" : "";
  if (!calc.isBundle) {
    const items = Object.keys(appState.products.selected).filter(k => appState.products.selected[k] > 0);
    produkDetail = items.map(id => productsList.find(p => p.id === id).name).join(', ');
  }

  // 2. Susun Payload Akhir (TANPA data base64/file, karena diurus oleh api.js)
  const orderPayload = {
    orderId: orderId,
    nama: appState.participant.nama,
    nim: appState.participant.nim,
    fakultas: appState.participant.fakultas,
    kelompok: getCombinedKelompok(appState.participant),
    whatsapp: appState.participant.whatsapp,
    alamat: appState.participant.alamat,
    produkDetail: produkDetail,
    totalHarga: calc.total
  };

  try {
    // 3. Kirim ke API Layer dengan 2 Parameter (Data Order & File Mentah)
    await ApiService.submitOrder(orderPayload, appState.payment.proofFile.originalFile);

    appState.order.orderId = orderId;
    appState.order.timestamp = timestamp;
    appState.order.status = STATUS_PENDING_VERIFICATION;

    clearStorageAfterOrder();

    renderSuccessPage();
    goToStep(STEP_SUCCESS);
    showToast('Pesanan berhasil dibuat! Silakan simpan Order ID Anda.', 'success');
  } catch (err) {
    console.error('Submission failed:', err);
    showToast('Gagal memproses pesanan: ' + err.message, 'error');
  } finally {
    appState.ui.isSubmitting = false;
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `✨ Konfirmasi &amp; Kirim Pesanan`;
    }
  }
};

const renderSuccessPage = () => {
  const idEl = document.getElementById('successOrderIdDisplay');
  const summaryEl = document.getElementById('successOrderSummary');
  if (!idEl || !summaryEl) return;

  idEl.textContent = appState.order.orderId || 'AMERTA26-000000';

  const calc = calculateOrderTotal();
  const prodName = calc.isBundle ? 'Bundle Package Lengkap AMERTA 2026' : `${calc.itemCount} Atribut Satuan`;

  summaryEl.innerHTML = `
    <div class="review-box" style="text-align:left; max-width:500px; margin:0 auto 28px;">
      <div class="review-row"><span class="label">Nama Pemesan</span><span class="val">${appState.participant.nama}</span></div>
      <div class="review-row"><span class="label">NIM</span><span class="val">${appState.participant.nim}</span></div>
      <div class="review-row"><span class="label">Produk Dipesan</span><span class="val">${prodName}</span></div>
      <div class="review-row"><span class="label">Total Dibayar</span><span class="val text-accent font-bold">${formatIDR(calc.total)}</span></div>
      <div class="review-row"><span class="label">Status Pesanan</span><span class="val badge" style="margin:0;">Menunggu Verifikasi Admin</span></div>
    </div>
  `;

  const btnCopy = document.getElementById('btnCopyOrderId');
  if (btnCopy) {
    btnCopy.onclick = () => {
      const textToCopy = appState.order.orderId;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Order ID berhasil disalin ke clipboard!', 'success');
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        showToast('Order ID berhasil disalin!', 'success');
      }
    };
  }

  const btnWa = document.getElementById('btnWhatsappAdmin');
  if (btnWa) {
    btnWa.onclick = () => {
      const p = appState.participant;
      const msg = encodeURIComponent(
        `Halo Admin AMERTA UNAIR 2026,\n\nSaya ingin mengonfirmasi pesanan kit penugasan saya:\n` +
        `• Order ID: *${appState.order.orderId}*\n` +
        `• Nama: ${p.nama}\n` +
        `• NIM: ${p.nim}\n` +
        `• Fakultas: ${p.fakultas}\n` +
        `• Total Tagihan: ${formatIDR(calc.total)}\n\n` +
        `Bukti pembayaran telah saya unggah di website. Mohon diverifikasi. Terima kasih!`
      );
      window.open(`https://wa.me/${APP_CONFIG.adminWhatsapp}?text=${msg}`, '_blank');
    };
  }
};

const resetApplicationState = () => {
  // 1. Reset Participant Session
  appState.participant = {
    nama: '',
    nim: '',
    fakultas: '',
    garuda: '',
    ksatria: '',
    kelompok: '',
    whatsapp: '',
    alamat: ''
  };

  // 2. Reset Product Selection Session
  appState.products = {
    selected: {},
    bundleActive: false
  };

  // 3. Reset Payment Session (including proof file and preview state)
  appState.payment = {
    method: 'qris',
    proofFile: null
  };

  // 4. Reset Order Session
  appState.order = {
    orderId: null,
    timestamp: null,
    status: STATUS_DRAFT,
    response: null,
    invoice: null
  };

  // 5. Reset UI Session State (preserving isResetting if active)
  const currentResettingFlag = appState.ui?.isResetting || false;
  appState.ui = {
    currentStep: STEP_PRODUCT,
    isSubmitting: false,
    isResetting: currentResettingFlag,
    validationErrors: {},
    successFlags: {},
    previewState: null
  };

  // 6. Preserve Static Application Configuration (DO NOT RESET OR MUTATE)
  if (!appState.config) {
    appState.config = {};
  }
  if (typeof productsList !== 'undefined') appState.config.productsList = productsList;
  if (typeof bundlePackage !== 'undefined') appState.config.bundle = bundlePackage;
  if (typeof APP_CONFIG !== 'undefined') appState.config.deadline = APP_CONFIG.deadlineTimestamp;

  // 7. Reset Participant DOM Form Inputs & Error States
  const formEl = document.getElementById('formParticipant') || document.getElementById('participantForm');
  if (formEl) formEl.reset();

  const inputIds = ['input-nama', 'input-nim', 'input-fakultas', 'input-garuda', 'input-ksatria', 'input-whatsapp', 'input-alamat'];
  inputIds.forEach(id => {
    const inputEl = document.getElementById(id);
    if (inputEl) {
      inputEl.value = '';
      inputEl.classList.remove('error');
    }
  });

  const errorIds = ['error-input-nama', 'error-input-nim', 'error-input-fakultas', 'error-input-garuda', 'error-input-ksatria', 'error-input-whatsapp'];
  errorIds.forEach(id => {
    const errEl = document.getElementById(id);
    if (errEl) {
      errEl.textContent = '';
      errEl.innerHTML = '';
    }
  });

  // 8. Reset Payment & Agreement DOM Controls
  const agreeEl = document.getElementById('checkAgreeTerms');
  if (agreeEl) agreeEl.checked = false;

  const proofInputEl = document.getElementById('proofFileInput');
  if (proofInputEl) proofInputEl.value = '';

  const methodSelectEl = document.getElementById('paymentMethodSelect');
  if (methodSelectEl) methodSelectEl.value = 'qris';

  // 9. Clear Review & Summary DOM Containers
  const reviewContainers = ['reviewParticipantData', 'reviewProductData', 'reviewPaymentData', 'successOrderSummary'];
  reviewContainers.forEach(id => {
    const box = document.getElementById(id);
    if (box) box.innerHTML = '';
  });

  const orderIdDisplay = document.getElementById('successOrderIdDisplay');
  if (orderIdDisplay) orderIdDisplay.textContent = 'AMERTA26-000000';

  // 10. Re-render Clean Step 1 Catalog, Summary Bar & File Preview
  renderStep1ProductSelection();
  updateLiveSummaryBar();
  renderUploadedFilePreview();
};

window.resetApplicationState = resetApplicationState;

window.resetAndGoHome = () => {
  appState.ui.isResetting = true;
  clearStorageAfterOrder();
  resetApplicationState();
  goToStep(STEP_PRODUCT);
  appState.ui.isResetting = false;
  clearStorageAfterOrder();
  showToast('Sistem telah direset. Anda dapat membuat pesanan baru.', 'info');
};

// ============================================================================
// 6. WIZARD STEP CONTROLLER
// ============================================================================
const goToStep = (stepNum) => {
  if (stepNum > appState.ui.currentStep) {
    if (appState.ui.currentStep === STEP_PRODUCT) {
      const calc = calculateOrderTotal();
      if (!calc.isBundle && calc.itemCount === 0) {
        showToast('Silakan pilih minimal 1 produk atau ambil Paket Bundle terlebih dahulu!', 'error');
        return;
      }
    }
    if (appState.ui.currentStep === STEP_PARTICIPANT && !isParticipantFormValid()) {
      showToast('Mohon lengkapi seluruh data wajib Ksatria dengan benar!', 'error');
      return;
    }
    if (appState.ui.currentStep === STEP_PAYMENT) {
      if (!appState.payment.proofFile) {
        showToast('Mohon unggah foto/PDF bukti pembayaran Anda!', 'error');
        return;
      }
    }
  }

  appState.ui.currentStep = stepNum;
  saveStateToStorage();

  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.remove('active');
  });
  const targetPanel = document.getElementById(`wizardStepPanel-${stepNum}`);
  if (targetPanel) targetPanel.classList.add('active');

  document.querySelectorAll('.step-item').forEach((item) => {
    const s = parseInt(item.getAttribute('data-step'), 10);
    item.classList.remove('active', 'completed');
    if (s < stepNum) {
      item.classList.add('completed');
      item.querySelector('.step-circle').innerHTML = '✓';
    } else if (s === stepNum) {
      item.classList.add('active');
      item.querySelector('.step-circle').textContent = s;
    } else {
      item.querySelector('.step-circle').textContent = s;
    }
  });

  if (stepNum === STEP_PRODUCT) {
    renderStep1ProductSelection();
    updateLiveSummaryBar();
  } else if (stepNum === STEP_PARTICIPANT) {
    setupParticipantFormValidation();
  } else if (stepNum === STEP_PAYMENT) {
    setupPaymentStep();
  } else if (stepNum === STEP_CONFIRM) {
    renderConfirmationReview();
  }

  const wizardEl = document.getElementById('order-section');
  if (wizardEl) wizardEl.scrollIntoView({ behavior: 'smooth' });

  for (let i = 1; i <= 5; i++) {
    const cEl = document.getElementById(`controlsStep${i}`);
    if (cEl) cEl.style.display = (i === stepNum) ? 'flex' : 'none';
  }
  const footerEl = document.getElementById('wizardControlsFooter');
  if (footerEl) {
    footerEl.style.display = (stepNum === STEP_SUCCESS) ? 'none' : 'flex';
  }
};

window.goToStep = goToStep;

// ============================================================================
// 7. COUNTDOWN TIMER ENGINE
// ============================================================================
const startCountdownTimer = () => {
  const updateTimer = () => {
    const now = new Date().getTime();
    const diff = APP_CONFIG.deadlineTimestamp - now;

    if (diff <= 0) {
      const cdEl = document.getElementById('countdownTimerGrid');
      if (cdEl) cdEl.innerHTML = `<div style="color:var(--error); font-weight:800; font-size:1.25rem;">Pemesanan Ditutup</div>`;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-minutes');
    const sEl = document.getElementById('cd-seconds');

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
  };

  updateTimer();
  setInterval(updateTimer, 1000);
};

// ============================================================================
// 8. FAQ ACCORDION ENGINE
// ============================================================================
const setupFaqAccordion = () => {
  document.querySelectorAll('.faq-header').forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.faq-body');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach((other) => {
        other.classList.remove('active');
        other.querySelector('.faq-body').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
};

// ============================================================================
// 9. DOM CONTENT LOADED INITIALIZER
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log(`🏛️ ${APP_CONFIG.appName} (${APP_CONFIG.version}) Initialized`);

  restoreStateFromStorage();
  startCountdownTimer();
  renderStep1ProductSelection();
  updateLiveSummaryBar();
  setupParticipantFormValidation();
  setupFaqAccordion();

  document.getElementById('btnNextToStep2')?.addEventListener('click', () => goToStep(STEP_PARTICIPANT));
  document.getElementById('btnBackToStep1')?.addEventListener('click', () => goToStep(STEP_PRODUCT));
  document.getElementById('btnNextToStep3')?.addEventListener('click', () => goToStep(STEP_PAYMENT));
  document.getElementById('btnBackToStep2')?.addEventListener('click', () => goToStep(STEP_PARTICIPANT));
  document.getElementById('btnNextToStep4')?.addEventListener('click', () => goToStep(STEP_CONFIRM));
  document.getElementById('btnBackToStep3')?.addEventListener('click', () => goToStep(STEP_PAYMENT));
  document.getElementById('btnSubmitOrder')?.addEventListener('click', submitOrderToBackend);

  if (appState.ui.currentStep >= STEP_PRODUCT && appState.ui.currentStep <= STEP_CONFIRM) {
    goToStep(appState.ui.currentStep);
  } else {
    goToStep(STEP_PRODUCT);
  }
});
