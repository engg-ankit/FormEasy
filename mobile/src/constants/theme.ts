// ClickNsit brand — matches the web app (navy + indigo + orange)

export const colors = {
  navy: '#1B2559',
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  primaryLight: '#eef2ff',
  accent: '#f26338',
  accentLight: '#fef3e2',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',

  text: '#111827',
  textMuted: '#6b7280',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e5e7eb',

  dark: {
    text: '#f9fafb',
    textMuted: '#9ca3af',
    background: '#111827',
    card: '#1f2937',
    border: '#374151',
  },
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  DRAFT: { bg: '#fff7ed', fg: '#c2410c', label: 'Draft' },
  SUBMITTED: { bg: '#eff6ff', fg: '#1d4ed8', label: 'Submitted' },
  IN_PROCESS: { bg: '#fefce8', fg: '#a16207', label: 'In Process' },
  FORM_FILLED: { bg: '#f5f3ff', fg: '#6d28d9', label: 'Form Filled' },
  COMPLETED: { bg: '#f0fdf4', fg: '#15803d', label: 'Completed' },
  REJECTED: { bg: '#fef2f2', fg: '#b91c1c', label: 'Rejected' },
};

export function statusInfo(status: string) {
  return (
    STATUS_COLORS[status] || { bg: '#f3f4f6', fg: '#4b5563', label: status.replace(/_/g, ' ') }
  );
}

export function formatINR(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}