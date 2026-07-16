/**
 * AMERTA 2026 Official Order Website — LocalStorage Wrapper
 * Senior Frontend Architecture — Safe Persistent Storage Synchronization
 */

const dataUrlToFile = (dataUrl, filename, mimeType) => {
  try {
    const arr = dataUrl.split(',');
    const mime = mimeType || (arr[0].match(/:(.*?);/) ? arr[0].match(/:(.*?);/)[1] : 'image/jpeg');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename || 'proof_upload', { type: mime });
  } catch (e) {
    console.warn('Unable to reconstruct File from dataUrl:', e);
    return null;
  }
};

const isStateEmpty = () => {
  if (!appState) return true;
  const p = appState.participant || {};
  const isParticipantEmpty = !p.nama && !p.nim && !p.fakultas && !p.kelompok && !p.garuda && !p.ksatria && !p.whatsapp && !p.alamat;
  const isProductsEmpty = !appState.products?.bundleActive && (!appState.products?.selected || Object.keys(appState.products.selected).length === 0);
  const isPaymentEmpty = !appState.payment?.proofFile;
  return isParticipantEmpty && isProductsEmpty && isPaymentEmpty;
};

const saveStateToStorage = () => {
  try {
    if (appState.ui && appState.ui.isResetting) return;
    if (appState.order && appState.order.status !== STATUS_DRAFT) return;
    if (isStateEmpty()) return;

    let paymentToSave = { ...appState.payment };
    if (appState.payment && appState.payment.proofFile) {
      const { originalFile, ...serializableProof } = appState.payment.proofFile;
      paymentToSave = {
        ...appState.payment,
        proofFile: serializableProof
      };
    }

    const dataToSave = {
      version: STORAGE_VERSION,
      participant: appState.participant,
      products: appState.products,
      payment: paymentToSave,
      currentStep: appState.ui.currentStep
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.warn('Unable to save state to localStorage:', err);
  }
};

const restoreStateFromStorage = () => {
  try {
    if (appState.order && appState.order.status !== STATUS_DRAFT) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    
    // Check storage version compatibility
    if (parsed.version && parsed.version !== STORAGE_VERSION) {
      console.info('Storage version mismatch. Resetting stale state.');
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (parsed.participant) {
      appState.participant = { ...appState.participant, ...parsed.participant };
      if (!appState.participant.garuda && !appState.participant.ksatria && appState.participant.kelompok) {
        const matches = appState.participant.kelompok.match(/\b(\d+)\b/g);
        if (matches && matches.length >= 2) {
          appState.participant.garuda = matches[0];
          appState.participant.ksatria = matches[1];
        } else if (matches && matches.length === 1) {
          appState.participant.garuda = matches[0];
        }
      }
      if (appState.participant.garuda && appState.participant.ksatria) {
        appState.participant.kelompok = `Garuda ${appState.participant.garuda} / Ksatria ${appState.participant.ksatria}`;
      }
    }
    if (parsed.products) appState.products = { ...appState.products, ...parsed.products };
    if (parsed.payment) {
      appState.payment = { ...appState.payment, ...parsed.payment };
      if (appState.payment.proofFile && !appState.payment.proofFile.originalFile && appState.payment.proofFile.dataUrl) {
        const fileObj = dataUrlToFile(
          appState.payment.proofFile.dataUrl,
          appState.payment.proofFile.name,
          appState.payment.proofFile.type
        );
        if (fileObj) {
          appState.payment.proofFile.originalFile = fileObj;
        }
      }
    }
    if (parsed.currentStep && parsed.currentStep >= STEP_PRODUCT && parsed.currentStep <= STEP_CONFIRM) {
      appState.ui.currentStep = parsed.currentStep;
    }
  } catch (err) {
    console.warn('Unable to restore state from localStorage:', err);
  }
};

const clearStorageAfterOrder = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Unable to clear localStorage:', err);
  }
};
