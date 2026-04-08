'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, type PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '../../theme/theme';

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

interface ColorModeContextValue {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode must be used within ThemeProviderWrapper');
  }
  return ctx;
}

export function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  // Default to dark mode; user can toggle to light
  const [mode, setMode] = useState<PaletteMode>('dark');

  // Hydrate from localStorage (if available)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('sasms-color-mode') as PaletteMode | null;
    if (stored === 'light' || stored === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(stored);
    }
  }, []);

  // Sync CSS custom properties for background/foreground to keep global styles consistent
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'light') {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#000000');
    } else {
      root.style.setProperty('--background', '#050509');
      root.style.setProperty('--foreground', '#ffffff');
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sasms-color-mode', mode);
    }
  }, [mode]);

  const colorMode = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
