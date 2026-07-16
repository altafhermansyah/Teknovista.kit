/**
 * AMERTA 2026 Official Order Website — Modal Confirmation Utility
 * Senior Frontend Architecture — Accessible Dialog Management
 */

const showConfirm = (title, desc, onConfirm) => {
  let modalOverlay = document.getElementById('customConfirmModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'customConfirmModal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'confirmModalTitle');
    modalOverlay.setAttribute('aria-describedby', 'confirmModalDesc');
    modalOverlay.innerHTML = `
      <div class="modal-box">
        <h4 class="modal-title" id="confirmModalTitle"></h4>
        <p class="modal-desc" id="confirmModalDesc"></p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="confirmBtnCancel">Batal</button>
          <button type="button" class="btn btn-primary btn-sm" id="confirmBtnOk">Lanjutkan</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }
  
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalDesc').textContent = desc;
  
  modalOverlay.classList.add('active');
  
  const cancelBtn = document.getElementById('confirmBtnCancel');
  const okBtn = document.getElementById('confirmBtnOk');
  
  const closeModal = () => modalOverlay.classList.remove('active');
  
  cancelBtn.onclick = closeModal;
  okBtn.onclick = () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  };
};
