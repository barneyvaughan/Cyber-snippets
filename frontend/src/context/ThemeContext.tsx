import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { type Theme, themes, grandfatherOak } from '../themes';
import { useConfig } from './ConfigContext';
import { useSocket } from './SocketContext';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  setTheme: (themeId: string) => void;
  availableThemes: Array<{ id: string; name: string }>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { config } = useConfig();
  const { emit } = useSocket();
  const [themeId, setThemeId] = useState<string>(
    config?.theme?.active || 'grandfather-oak'
  );
  const [theme, setThemeState] = useState<Theme>(grandfatherOak);

  // Update theme when config changes
  useEffect(() => {
    if (config?.theme?.active) {
      setThemeId(config.theme.active);
    }
  }, [config?.theme?.active]);

  // Apply theme when themeId changes
  useEffect(() => {
    const newTheme = themes[themeId] || grandfatherOak;
    setThemeState(newTheme);

    // Inject CSS variables
    const root = document.documentElement;

    // Colors
    Object.entries(newTheme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--color-${cssKey}`, value);
    });

    // Fonts
    Object.entries(newTheme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    // Spacing
    Object.entries(newTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Border radius
    root.style.setProperty('--border-radius', newTheme.borderRadius);
  }, [themeId]);

  const setTheme = useCallback(
    (newThemeId: string) => {
      if (themes[newThemeId]) {
        setThemeId(newThemeId);
        emit('theme:change', { themeId: newThemeId });
      }
    },
    [emit]
  );

  const availableThemes = Object.values(themes).map((t) => ({
    id: t.id,
    name: t.name,
  }));

  return (
    <ThemeContext.Provider
      value={{ theme, themeId, setTheme, availableThemes }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
