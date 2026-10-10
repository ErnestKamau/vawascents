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
import { Themes, ThemeName, AppTheme, SemanticColors } from '@/design';

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

/** Convenience: full AppTheme tokens */
export const useAppTheme = (): AppTheme => useTheme().theme;
