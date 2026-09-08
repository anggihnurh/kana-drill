import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'kana_drill_theme';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Fallback if localStorage access is restricted
  }
  return 'light'; // Default mode is light
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  // Apply initial theme on startup
  applyThemeClass(initialTheme);

  return {
    theme: initialTheme,

    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // Safe fallback
      }
      applyThemeClass(theme);
      set({ theme });
    },

    toggleTheme: () => {
      const nextTheme = get().theme === 'light' ? 'dark' : 'light';
      get().setTheme(nextTheme);
    },
  };
});
