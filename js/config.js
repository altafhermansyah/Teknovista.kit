/**
 * AMERTA 2026 Official Order Website — Application Configuration
 * Senior Frontend Architecture — Centralized Application Settings
 */

const APP_CONFIG = {
  appName: 'TEKNOVISTA.KIT — Official Order Portal Kit Penugasan AMERTA Universitas Airlangga 2026',
  version: '1.2.0-PROD',
  currency: 'IDR',
  locale: 'id-ID',
  deadlineTimestamp: new Date('2026-07-25T23:59:59+07:00').getTime(),
  adminWhatsapp: '62881036633600',
  qrisImage: 'assets/images/qris_fix.jpeg',
  bankAccounts: [
    { bankName: 'Bank Mandiri', accountNumber: '141-00-1029384-7', accountHolder: 'AMERTA UNAIR' },
    { bankName: 'Bank BNI', accountNumber: '0987654321', accountHolder: 'PANITIA AMERTA' }
  ],
  gasApiUrl: 'https://script.google.com/macros/s/AKfycbzW1YgYp-QaQU2ShGkImlTTHBBu7BQ8sxGiYOq8ZHx8j3AqbgIrLKU4dnipaXXq0iMTBg/exec',
  googleDriveFolderId: '1paV-WaWfp9jlhXzo4FqnRiKgSjIpPQsM',
  googleSheetId: '1a3c6ecHQoy8vv_sshORm-2lphP5UxGjqjWTseYbgznk'
};
