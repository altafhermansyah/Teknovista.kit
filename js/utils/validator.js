/**
 * AMERTA 2026 Official Order Website — Validation Engine
 * Senior Frontend Architecture — Real-time Custom Validation
 */

const validationRules = {
  nama: {
    validate: (val) => val.trim().length >= 3,
    errorMsg: 'Nama lengkap minimal 3 karakter'
  },
  nim: {
    validate: (val) => /^[0-9]{9,15}$/.test(val.trim()),
    errorMsg: 'NIM harus berupa angka 9-15 digit'
  },
  fakultas: {
    validate: (val) => val.trim() !== '',
    errorMsg: 'Silakan pilih Fakultas Anda'
  },
  garuda: {
    validate: (val) => /^[0-9]+$/.test(val.trim()),
    errorMsg: 'Nomor Garuda harus berupa angka'
  },
  ksatria: {
    validate: (val) => /^[0-9]+$/.test(val.trim()),
    errorMsg: 'Nomor Ksatria harus berupa angka'
  },
  whatsapp: {
    validate: (val) => /^(\+62|62|0)8[1-9][0-9]{6,12}$/.test(val.trim().replace(/\s+/g, '')),
    errorMsg: 'Nomor WhatsApp tidak valid (contoh: 081234567890)'
  }
};

const validateField = (fieldName, val) => {
  const rule = validationRules[fieldName];
  if (!rule) return { isValid: true };
  const isValid = rule.validate(val);
  return {
    isValid,
    errorMsg: isValid ? '' : rule.errorMsg
  };
};

const updateFieldUI = (inputEl, isValid, errorMsg) => {
  if (!inputEl) return;
  const errorEl = document.getElementById(`error-${inputEl.id}`);
  if (isValid) {
    inputEl.classList.remove('error');
    if (inputEl.value.trim() !== '') {
      inputEl.classList.add('success');
    } else {
      inputEl.classList.remove('success');
    }
    if (errorEl) errorEl.textContent = '';
  } else {
    inputEl.classList.remove('success');
    inputEl.classList.add('error');
    if (errorEl) errorEl.textContent = errorMsg;
  }
};

const setupParticipantFormValidation = () => {
  Object.keys(validationRules).forEach((fieldName) => {
    const inputEl = document.getElementById(`input-${fieldName}`);
    if (!inputEl) return;
    
    // Set restored value if any
    if (appState.participant[fieldName]) {
      inputEl.value = appState.participant[fieldName];
    }
    
    const runValidation = () => {
      if (fieldName === 'garuda' || fieldName === 'ksatria') {
        const cleaned = inputEl.value.replace(/[^0-9]/g, '');
        if (inputEl.value !== cleaned) {
          inputEl.value = cleaned;
        }
      }
      const val = inputEl.value;
      appState.participant[fieldName] = val;
      if (fieldName === 'garuda' || fieldName === 'ksatria') {
        appState.participant.kelompok = (typeof getCombinedKelompok === 'function')
          ? getCombinedKelompok(appState.participant)
          : (appState.participant.garuda && appState.participant.ksatria
              ? `Garuda ${appState.participant.garuda} / Ksatria ${appState.participant.ksatria}`
              : '');
      }
      const res = validateField(fieldName, val);
      updateFieldUI(inputEl, res.isValid, res.errorMsg);
      saveStateToStorage();
    };
    
    inputEl.addEventListener('input', runValidation);
    inputEl.addEventListener('blur', runValidation);
  });
  
  const alamatEl = document.getElementById('input-alamat');
  if (alamatEl) {
    if (appState.participant.alamat) alamatEl.value = appState.participant.alamat;
    alamatEl.addEventListener('input', () => {
      appState.participant.alamat = alamatEl.value;
      saveStateToStorage();
    });
  }
};

const isParticipantFormValid = () => {
  let allValid = true;
  Object.keys(validationRules).forEach((fieldName) => {
    const inputEl = document.getElementById(`input-${fieldName}`);
    if (!inputEl) return;
    if (fieldName === 'garuda' || fieldName === 'ksatria') {
      const cleaned = inputEl.value.replace(/[^0-9]/g, '');
      if (inputEl.value !== cleaned) {
        inputEl.value = cleaned;
      }
      appState.participant[fieldName] = inputEl.value;
    }
    const res = validateField(fieldName, inputEl.value);
    updateFieldUI(inputEl, res.isValid, res.errorMsg);
    if (!res.isValid) allValid = false;
  });
  appState.participant.kelompok = (typeof getCombinedKelompok === 'function')
    ? getCombinedKelompok(appState.participant)
    : (appState.participant.garuda && appState.participant.ksatria
        ? `Garuda ${appState.participant.garuda} / Ksatria ${appState.participant.ksatria}`
        : '');
  return allValid;
};
