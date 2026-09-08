import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { authApi, profileApi, setAuthToken, type UserProfile } from '@/lib/api';

const TOKEN_KEY = 'clicknsit.token';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  signup: (data: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          try {
            const { user: profile } = await profileApi.me();
            setUser(profile);
          } catch {
            // Token expired / invalid — clear it
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setAuthToken(null);
          }
        }
      } catch {
        // SecureStore unavailable (web) — ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyToken = useCallback(async (token: string) => {
    setAuthToken(token);
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      await applyToken(res.token);
      setUser(res.user);
    },
    [applyToken]
  );

  const loginWithToken = useCallback(
    async (token: string) => {
      await applyToken(token);
      try {
        const { user: profile } = await profileApi.me();
        setUser(profile);
      } catch {
        // Token invalid — clear it
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setAuthToken(null);
      }
    },
    [applyToken]
  );

  const signup = useCallback(
    async (data: { fullName: string; mobile: string; email: string; password: string; referralCode?: string }) => {
      const res = await authApi.signup(data);
      // Backend returns token — auto-login after signup
      if (res.token) {
        await applyToken(res.token);
        setUser(res.user);
      } else {
        // Fallback: login separately if no token returned
        await login(data.email, data.password);
      }
    },
    [applyToken, login]
  );

  const logout = useCallback(async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
    if (token) {
      try {
        // Unregister push token (best-effort)
        const { unregisterPushToken } = await import('@/lib/push');
        await unregisterPushToken();
      } catch {
        // ignore
      }
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    setAuthToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { user: profile } = await profileApi.me();
      setUser(profile);
    } catch {
      // keep current user
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, loginWithToken, signup, logout, refreshProfile }),
    [user, loading, login, loginWithToken, signup, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}