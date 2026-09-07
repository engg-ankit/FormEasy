import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { pushApi } from '@/lib/api';

// expo-notifications only works on native — no web implementation.
const isNative = Platform.OS !== 'web';

// Expo Go (the "store client") does NOT support remote push tokens since SDK 53.
// Push notifications require a development/production build (`expo run:*` / EAS).
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Requests notification permission and returns an Expo push token,
 * or null when unavailable (web / Expo Go / simulator / permission denied).
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!isNative || isExpoGo) return null;
  if (!Device.isDevice) return null;

  try {
    const Notifications = await import('expo-notifications');

    // Defensive: every API below may be missing in unusual environments
    if (typeof Notifications.getPermissionsAsync !== 'function') return null;

    // Android 13+ requires a runtime permission
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted' && typeof Notifications.requestPermissionsAsync === 'function') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    // Android notification channel
    if (
      Platform.OS === 'android' &&
      typeof Notifications.setNotificationChannelAsync === 'function'
    ) {
      await Notifications.setNotificationChannelAsync('status', {
        name: 'Application Status',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4f46e5',
      });
    }

    if (typeof Notifications.getExpoPushTokenAsync !== 'function') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const result = await Notifications.getExpoPushTokenAsync({ projectId });

    // Newer SDKs return { data }, older ones return the token string
    const token = typeof result === 'string' ? result : result?.data ?? null;
    return typeof token === 'string' && token.length > 0 ? token : null;
  } catch {
    // Push is a progressive enhancement — never crash the app over it
    return null;
  }
}

/**
 * Registers the device push token with the backend for the logged-in user.
 * Call this right after login. No-ops in Expo Go.
 */
export async function registerPushToken(): Promise<void> {
  if (!isNative || isExpoGo) return;
  const token = await getExpoPushToken();
  if (!token) return;
  try {
    await pushApi.register(token, Platform.OS as 'ios' | 'android');
  } catch {
    // ignore — token will be re-registered on next login
  }
}

/** Removes the device push token from the backend (on logout). */
export async function unregisterPushToken(): Promise<void> {
  if (!isNative || isExpoGo) return;
  const token = await getExpoPushToken();
  if (!token) return;
  try {
    await pushApi.unregister(token);
  } catch {
    // ignore
  }
}

/**
 * Configures how notifications behave while the app is open
 * (banner + sound). Call once from the root layout.
 */
export async function configureNotifications(): Promise<void> {
  // CRITICAL: expo-notifications THROWS at module import time in Expo Go (SDK 53+),
  // so it must never be imported there — guard before the dynamic import.
  if (!isNative || isExpoGo) return;
  try {
    const Notifications = await import('expo-notifications');
    if (typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  } catch {
    // ignore
  }
}