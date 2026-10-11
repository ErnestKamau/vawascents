/**
 * ThemeContext — Aura
 * light | dark | system only. Exposes full AppTheme token object.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { Themes, ThemeName, AppTheme, SemanticColors, auraLightAuth, auraDarkAuth } from '@/design';

interface ThemeContextType {
  /** Full token object (preferred) */
  theme: AppTheme;
  /** Flat color aliases */
  currentTheme: SemanticColors;
  themeName: ThemeName;
  isSystemTheme: boolean;
  changeTheme: (theme: ThemeName) => Promise<void>;
  toggleSystemTheme: () => Promise<void>;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@vawascents_theme_preference';
const SYSTEM_THEME_KEY = '@vawascents_use_system_theme';

const VALID_THEMES: ThemeName[] = ['light', 'dark'];

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const theme = Themes[themeName];
  const currentTheme = theme.colors;
  const availableThemes = VALID_THEMES;

  const getSystemTheme = useCallback((colorScheme: ColorSchemeName | null | undefined): ThemeName => {
    return colorScheme === 'dark' ? 'dark' : 'light';
  }, []);

  const loadThemePreference = useCallback(async () => {
    try {
      const [savedTheme, savedSystemPreference] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(SYSTEM_THEME_KEY),
      ]);

      const useSystemTheme = savedSystemPreference === 'true';
      setIsSystemTheme(useSystemTheme);

      if (useSystemTheme) {
        setThemeName(getSystemTheme(Appearance.getColorScheme()));
      } else if (savedTheme && VALID_THEMES.includes(savedTheme as ThemeName)) {
        setThemeName(savedTheme as ThemeName);
      } else {
        setThemeName('light');
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      setThemeName('light');
    } finally {
      setIsLoading(false);
    }
  }, [getSystemTheme]);

  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  useEffect(() => {
    if (!isSystemTheme) return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeName(getSystemTheme(colorScheme));
    });

    return () => subscription?.remove();
  }, [isSystemTheme, getSystemTheme]);

  const changeTheme = useCallback(async (newTheme: ThemeName) => {
    try {
      const resolved = VALID_THEMES.includes(newTheme) ? newTheme : 'light';
      setThemeName(resolved);
      setIsSystemTheme(false);
      await Promise.all([
        AsyncStorage.setItem(THEME_STORAGE_KEY, resolved),
        AsyncStorage.setItem(SYSTEM_THEME_KEY, 'false'),
      ]);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  const toggleSystemTheme = useCallback(async () => {
    try {
      const next = !isSystemTheme;
      setIsSystemTheme(next);
      if (next) {
        setThemeName(getSystemTheme(Appearance.getColorScheme()));
      }
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, next.toString());
    } catch (error) {
      console.warn('Failed to toggle system theme:', error);
    }
  }, [isSystemTheme, getSystemTheme]);

  const contextValue: ThemeContextType = useMemo(
    () => ({
      theme,
      currentTheme,
      themeName,
      isSystemTheme,
      changeTheme,
      toggleSystemTheme,
      availableThemes,
    }),
    [theme, currentTheme, themeName, isSystemTheme, changeTheme, toggleSystemTheme, availableThemes],
  );

  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Onboarding/auth/OTP/forgot-password/unlock keep the violet brand palette while
 * the rest of the app (inside this provider) is green — still following the
 * user's light/dark mode choice, just with the auth-flow color variant.
 */
const AuthThemeContext = createContext<AppTheme | null>(null);

export function AuthThemeProvider({ children }: { children: ReactNode }) {
  const { themeName } = useTheme();
  const authTheme = themeName === 'dark' ? auraDarkAuth : auraLightAuth;
  return <AuthThemeContext.Provider value={authTheme}>{children}</AuthThemeContext.Provider>;
}

/** Convenience: full AppTheme tokens — resolves to the violet auth palette inside AuthThemeProvider. */
export const useAppTheme = (): AppTheme => {
  const authOverride = useContext(AuthThemeContext);
  const { theme } = useTheme();
  return authOverride ?? theme;
};
