// API client for the existing ClickNsit backend.
// Set EXPO_PUBLIC_API_URL in .env to point at your deployed Next.js app.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://clickandsit.vercel.app';

export interface Exam {
  id: string;
  title: string;
  category: string;
  description: string;
  lastDate: string;
  officialFee: number;
  serviceFee: number;
  requiredDocuments?: string;
  portalUrl?: string | null;
}

export interface PaymentInfo {
  id: string;
  amount: number;
  status: string;
  razorpayOrderId: string;
  createdAt: string;
}

export interface Application {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  formData?: string;
  exam: Exam;
  payment?: PaymentInfo | null;
}

export interface ApplicationDocument {
  id: string;
  docType: string;
  fileName?: string | null;
  fileUrl: string;
}

export interface ApplicationDetail extends Application {
  documents?: ApplicationDocument[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  referralCode: string;
  referralBonus: number;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
};

// ---- Typed endpoints used by the app ----

export const examsApi = {
  list: () => api.get<{ exams: Exam[] }>('/api/exams'),
  detail: (id: string) => api.get<{ exam: Exam }>(`/api/exams/${id}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; token: string; user: UserProfile }>('/api/mobile/login', { email, password }),
  signup: (data: { fullName: string; mobile: string; email: string; password: string; referralCode?: string }) =>
    api.post<{ success: boolean; user: UserProfile }>('/api/auth/signup', data),
};

export const applicationsApi = {
  mine: () => api.get<{ applications: Application[] }>('/api/applications/user'),
  detail: (id: string) => api.get<{ application: ApplicationDetail }>(`/api/applications/${id}`),
  create: (examId: string, formData: unknown, totalAmount: number) =>
    api.post<{ applicationId: string }>('/api/applications', { examId, formData, totalAmount }),
};

export const paymentApi = {
  createOrder: (applicationId: string, amount?: number) =>
    api.post<{
      success: boolean;
      order: { id: string; amount: number };
      keyId: string;
      exam: { title: string; officialFee: number; serviceFee: number };
    }>('/api/payment/create-order', { applicationId, amount }),
  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    applicationId: string;
  }) => api.post<{ success: boolean }>('/api/payment/verify', data),
};

export const profileApi = {
  me: () => api.get<{ user: UserProfile }>('/api/user/profile'),
};

export const referralApi = {
  info: () =>
    api.get<{
      referralCode: string;
      referralBonus: number;
      totalReferrals: number;
      referrals: { name: string; joinedAt: string; bonus: number }[];
    }>('/api/referral'),
};

export const pushApi = {
  register: (expoPushToken: string, platform: 'ios' | 'android') =>
    api.post('/api/mobile/push-token', { expoPushToken, platform }),
  unregister: (expoPushToken: string) => api.delete('/api/mobile/push-token', { expoPushToken }),
};

export { ApiError };