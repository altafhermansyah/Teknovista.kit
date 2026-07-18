/**
 * AMERTA 2026 Official Order Website — Validation Engine
 * Senior Frontend Architecture — Real-time Custom Validation
 */

const startsWithFormula = (value) =>
  /^[=+\-@]/.test(String(value).trim());

const validationRules = {
  nama: {
    validate: (val) => {
      const value = String(val).trim();

      if (value.length < 3) {
        return {
          isValid: false,
          errorMsg: "Nama lengkap minimal 3 karakter."
        };
      }

      if (value.length > 100) {
        return {
          isValid: false,
          errorMsg: "Nama lengkap maksimal 100 karakter."
        };
      }

      if (startsWithFormula(value)) {
        return {
          isValid: false,
          errorMsg: "Nama mengandung format yang tidak diperbolehkan."
        };
      }

      return {
        isValid: true,
        errorMsg: ""
      };
    }
  },

  nim: {
    validate: (val) => {
      const value = String(val).trim();

      if (!/^[0-9]{9,15}$/.test(value)) {
        return {
          isValid: false,
          errorMsg: "NIM harus berupa angka 9–15 digit."
        };
      }

      if (startsWithFormula(value)) {
        return {
          isValid: false,
          errorMsg: "NIM mengandung format yang tidak diperbolehkan."
        };
      }

      return {
        isValid: true,
        errorMsg: ""
      };
    }
  },

  fakultas: {
    validate: (val) => {
      const value = String(val).trim();

      if (value === "") {
        return {
          isValid: false,
          errorMsg: "Silakan pilih Fakultas Anda."
        };
      }

      if (startsWithFormula(value)) {
        return {
          isValid: false,
          errorMsg: "Nama fakultas tidak valid."
        };
      }

      return {
        isValid: true,
        errorMsg: ""
      };
    }
  },

  garuda: {
    validate: (val) => {
      const value = String(val).trim();

      if (!/^[0-9]+$/.test(value)) {
        return {
          isValid: false,
          errorMsg: "Nomor Garuda harus berupa angka."
        };
      }

      if (startsWithFormula(value)) {
        return {
          isValid: false,
          errorMsg: "Nomor Garuda tidak valid."
        };
      }

      return {
        isValid: true,
        errorMsg: ""
      };
    }
  },

  ksatria: {
    validate: (val) => {
      const value = String(val).trim();

      if (!/^[0-9]+$/.test(value)) {
        return {
          isValid: false,
          errorMsg: "Nomor Ksatria harus berupa angka."
        };
      }

      if (startsWithFormula(value)) {
        return {
          isValid: false,
          errorMsg: "Nomor Ksatria tidak valid."
        };
      }

      return {
        isValid: true,
        errorMsg: ""
      };
    }
  },

  whatsapp: {
    validate: (val) => {
      const value = String(val).trim().replace(/\s+/g, "");

      if (!/^(\+62|62|0)8[1-9][0-9]{6,12}$/.test(value)) {
        return {
          isValid: false,
          errorMsg: "Nomor WhatsApp tidak valid (contoh: 081234567890)."
        };
      }

      if (startsWithFormula(value)) {
        return {
          isValid: false,
          errorMsg: "Nomor WhatsApp tidak valid."
        };
      }

      return {
        isValid: true,
        errorMsg: ""
      };
    }
  },

  alamat: {
    validate: (val) => {
      const value = String(val).trim();

      // Alamat bersifat opsional
      if (value === "") {
        return {
          isValid: true,
          errorMsg: ""
        };
      }

      if (value.length > 255) {
        return {
          isValid: false,
          errorMsg: "Alamat maksimal 255 karakter."
        };
      }

      if (startsWithFormula(value)) {
        return {
          isValid: false,
          errorMsg: "Alamat mengandung format yang tidak diperbolehkan."
        };
      }

      return {
        isValid: true,
        errorMsg: ""
      };
    }
  }
};

const validateField = (fieldName, val) => {
  const rule = validationRules[fieldName];

  if (!rule) {
    return {
      isValid: true,
      errorMsg: ""
    };
  }

  return rule.validate(val);
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
