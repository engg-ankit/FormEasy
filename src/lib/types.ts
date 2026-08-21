export type ApplicationStatus = 'SUBMITTED' | 'IN_PROCESS' | 'FORM_FILLED' | 'COMPLETED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type DiscountType = 'PERCENT' | 'FLAT';

export const APPLICATION_STATUS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_PROCESS: 'In Process',
  FORM_FILLED: 'Form Filled',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const DISCOUNT_TYPE: Record<DiscountType, string> = {
  PERCENT: 'Percentage',
  FLAT: 'Flat',
};