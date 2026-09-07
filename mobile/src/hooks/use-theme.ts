import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  return { isDark: scheme === 'dark', scheme };
}