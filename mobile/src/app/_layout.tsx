import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/lib/auth';
import { colors } from '@/constants/theme';
import { configureNotifications, registerPushToken } from '@/lib/push';

SplashScreen.preventAutoHideAsync();

// Registers the device push token once the user logs in
function SessionPusher() {
  const { user } = useAuth();
  const registeredFor = React.useRef<string | null>(null);

  useEffect(() => {
    if (user && registeredFor.current !== user.id) {
      registeredFor.current = user.id;
      registerPushToken();
    }
    if (!user) registeredFor.current = null;
  }, [user]);

  return null;
}

function RootNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      primary: colors.primary,
      background: isDark ? colors.dark.background : colors.background,
      card: isDark ? colors.dark.card : '#ffffff',
      text: isDark ? colors.dark.text : colors.text,
      border: isDark ? colors.dark.border : colors.border,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: isDark ? colors.dark.text : colors.primaryDark,
          headerTitleStyle: { fontWeight: '700' },
          headerStyle: { backgroundColor: isDark ? colors.dark.card : '#ffffff' },
          contentStyle: { backgroundColor: isDark ? colors.dark.background : colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="exam/[id]" options={{ title: 'Form Details' }} />
        <Stack.Screen name="apply/[examId]" options={{ title: 'Apply for Form', headerBackButtonDisplayMode: 'minimal' }} />
        <Stack.Screen name="payment/[applicationId]" options={{ title: 'Pay & Submit' }} />
        <Stack.Screen name="applications-detail/[id]" options={{ title: 'Application', headerBackButtonDisplayMode: 'minimal' }} />
        <Stack.Screen name="login" options={{ title: 'Login', presentation: 'modal' }} />
        <Stack.Screen name="signup" options={{ title: 'Create Account', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <SessionPusher />
      <RootNavigator />
    </AuthProvider>
  );
}