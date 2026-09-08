import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, type ColorValue } from 'react-native';
import { colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap)} size={size} color={color} />
  );
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: isDark ? colors.dark.card : '#ffffff',
          borderTopColor: isDark ? colors.dark.border : colors.border,
          paddingTop: 4,
          paddingBottom: 6,
        },
        headerStyle: { backgroundColor: isDark ? colors.dark.card : '#ffffff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: isDark ? colors.dark.text : colors.primaryDark },
        sceneStyle: { backgroundColor: isDark ? colors.dark.background : colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="forms" options={{ title: 'Forms', tabBarIcon: tabIcon('search') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Updates', tabBarIcon: tabIcon('notifications') }} />
      <Tabs.Screen
        name="applications"
        options={{ title: 'My Forms', tabBarIcon: tabIcon('document-text') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: user ? 'Profile' : 'Login', tabBarIcon: tabIcon('person-circle') }}
      />
    </Tabs>
  );
}
