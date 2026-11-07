import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppThemeMode = 'light' | 'dark' | 'solar';
export type AppFontSize = 'normal' | 'large' | 'xlarge';
export type AppFontFamily = 'default' | 'rounded' | 'mono';

export interface AppearancePreferences {
  theme: AppThemeMode;
  fontSize: AppFontSize;
  fontFamily: AppFontFamily;
}

interface AppearanceContextType extends AppearancePreferences {
  setTheme: (theme: AppThemeMode) => void;
  setFontSize: (size: AppFontSize) => void;
  setFontFamily: (family: AppFontFamily) => void;
  resetAppearance: () => void;
}

const STORAGE_KEY = 'terragest_appearance_prefs_v1';

const DEFAULT_PREFS: AppearancePreferences = {
  theme: 'light',
  fontSize: 'normal',
  fontFamily: 'default',
};

const FONT_SIZE_MAP: Record<AppFontSize, string> = {
  normal: '100%',
  large: '108%',
  xlarge: '116%',
};

const FONT_FAMILY_MAP: Record<AppFontFamily, string> = {
  default: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  rounded: "Verdana, 'Trebuchet MS', Geneva, Arial, sans-serif",
  mono: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace",
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

function loadSavedPrefs(): AppearancePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<AppearancePreferences>;
    return {
      theme: parsed.theme === 'dark' || parsed.theme === 'solar' ? parsed.theme : 'light',
      fontSize: parsed.fontSize === 'large' || parsed.fontSize === 'xlarge' ? parsed.fontSize : 'normal',
      fontFamily: parsed.fontFamily === 'rounded' || parsed.fontFamily === 'mono' ? parsed.fontFamily : 'default',
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AppearancePreferences>(loadSavedPrefs);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-solar', 'dark');

    if (prefs.theme === 'dark') {
      root.classList.add('theme-dark', 'dark');
    } else if (prefs.theme === 'solar') {
      root.classList.add('theme-solar');
    } else {
      root.classList.add('theme-light');
    }

    root.style.fontSize = FONT_SIZE_MAP[prefs.fontSize];
    root.style.setProperty('--app-font-family', FONT_FAMILY_MAP[prefs.fontFamily]);
    document.body.style.fontFamily = FONT_FAMILY_MAP[prefs.fontFamily];
  }, [prefs]);

  const setTheme = (theme: AppThemeMode) => setPrefs((p) => ({ ...p, theme }));
  const setFontSize = (fontSize: AppFontSize) => setPrefs((p) => ({ ...p, fontSize }));
  const setFontFamily = (fontFamily: AppFontFamily) => setPrefs((p) => ({ ...p, fontFamily }));
  const resetAppearance = () => setPrefs(DEFAULT_PREFS);

  return (
    <AppearanceContext.Provider
      value={{
        ...prefs,
        setTheme,
        setFontSize,
        setFontFamily,
        resetAppearance,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = (): AppearanceContextType => {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error('useAppearance deve ser usado dentro de AppearanceProvider');
  }
  return ctx;
};

