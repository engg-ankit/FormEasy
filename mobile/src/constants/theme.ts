// ClickNsit brand — mirrors the web app (navy + indigo + orange)

export const colors = {
  // Brand
  navy: '#1B2559', // header / hero (web theme_color)
  navyDeep: '#111736', // deeper navy for hero layers
  primary: '#4f46e5', // indigo — main action color (web primary-600)
  primaryDark: '#4338ca',
  primaryLight: '#eef2ff',
  accent: '#f26338', // orange (web accent-500)
  accentLight: '#fef3e2',

  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',

  text: '#111827',
  textMuted: '#6b7280',
  background: '#f4f6ff', // cool light tint like web primary-50
  card: '#ffffff',
  border: '#e3e8f7',
  header: '#1B2559',

  dark: {
    text: '#fafaf9',
    textMuted: '#a8a29e',
    background: '#1c1917', // web neutral-900
    card: '#292524', // web neutral-800
    border: '#44403c', // web neutral-700
    header: '#171235',
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