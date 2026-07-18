/**
 * AMERTA 2026 Official Order Website — Application Constants
 * Senior Frontend Architecture — Centralized Immutable Constants
 */

const STEP_PRODUCT = 1;
const STEP_PARTICIPANT = 2;
const STEP_PAYMENT = 3;
const STEP_CONFIRM = 4;
const STEP_SUCCESS = 5;

const STORAGE_KEY = 'AMERTA_2026_ORDER_STATE';
const STORAGE_VERSION = 'v1.2';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const STATUS_DRAFT = 'DRAFT';
const STATUS_PENDING_VERIFICATION = 'VERIFICATION_PENDING';
const STATUS_VERIFIED = 'VERIFIED';

const TOAST_DURATION_MS = 3500;
const ANIMATION_TRANSITION_MS = 300;
