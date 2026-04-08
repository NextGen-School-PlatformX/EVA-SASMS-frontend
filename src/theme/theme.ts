import { createTheme, type PaletteMode } from '@mui/material';
import { palette } from './palette';
import { typography } from './typography';

const CARD_SHADOW = '0 2px 12px rgba(0, 0, 0, 0.06)';
const HOVER_SHADOW = '0 8px 32px rgba(25, 118, 210, 0.12)';

export function createAppTheme(mode: PaletteMode) {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      background: {
        default: isLight ? '#f8faff' : '#0d1117',
        paper: isLight ? '#ffffff' : '#161b22',
      },
      primary: {
        main: palette.brand.primary,
        light: palette.brand.secondary,
        dark: '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        light: palette.brand.primary,
        main: palette.brand.secondary,
        contrastText: isLight ? palette.text.primary : palette.text.inverse,
      },
      text: {
        primary: isLight ? palette.text.primary : palette.text.inverse,
        secondary: isLight ? palette.text.secondary : palette.text.inverseSecondary,
      },
      divider: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)',
      error: { main: '#f44336' },
      success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
      warning: { main: '#ff9800', light: '#ffb74d' },
      info: { main: '#2196f3' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: typography.h1.fontSize, fontWeight: 900, letterSpacing: '-0.02em' },
      h2: { fontSize: typography.h2.fontSize, fontWeight: 800, letterSpacing: '-0.01em' },
      h3: { fontSize: typography.h3.fontSize, fontWeight: 800 },
      h4: { fontSize: typography.h4.fontSize, fontWeight: 700 },
      h5: { fontSize: typography.h5.fontSize, fontWeight: 700 },
      h6: { fontSize: typography.h6.fontSize, fontWeight: 700 },
      body1: { fontSize: typography.body.fontSize, fontWeight: 400, lineHeight: 1.7 },
      body2: { fontSize: typography.body2.fontSize, fontWeight: 400, lineHeight: 1.6 },
      caption: { fontSize: typography.caption.fontSize, fontWeight: 500 },
      button: { fontWeight: 700, letterSpacing: 0 },
    },
    shape: { borderRadius: 12 },
    shadows: [
      'none',
      '0 1px 3px rgba(0,0,0,0.05)',
      '0 2px 8px rgba(0,0,0,0.06)',
      CARD_SHADOW, CARD_SHADOW, CARD_SHADOW,
      '0 4px 20px rgba(0,0,0,0.08)',
      '0 6px 24px rgba(0,0,0,0.09)',
      HOVER_SHADOW, HOVER_SHADOW, HOVER_SHADOW,
      '0 12px 40px rgba(0,0,0,0.12)', '0 12px 40px rgba(0,0,0,0.12)',
      '0 16px 48px rgba(0,0,0,0.14)', '0 16px 48px rgba(0,0,0,0.14)',
      '0 20px 60px rgba(0,0,0,0.16)', '0 20px 60px rgba(0,0,0,0.16)',
      '0 24px 64px rgba(0,0,0,0.18)', '0 24px 64px rgba(0,0,0,0.18)',
      '0 28px 72px rgba(0,0,0,0.20)', '0 28px 72px rgba(0,0,0,0.20)',
      '0 32px 80px rgba(0,0,0,0.22)', '0 32px 80px rgba(0,0,0,0.22)',
      '0 36px 88px rgba(0,0,0,0.24)', '0 36px 88px rgba(0,0,0,0.24)',
    ] as const,
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            fontWeight: 700,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 6px 20px rgba(25,118,210,0.35)' },
          },
          containedSuccess: { '&:hover': { boxShadow: '0 6px 20px rgba(76,175,80,0.35)' } },
          containedError: { '&:hover': { boxShadow: '0 6px 20px rgba(244,67,54,0.35)' } },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            transition: 'box-shadow 0.25s, border-color 0.25s',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
            transition: 'box-shadow 0.25s, transform 0.25s',
            '&:hover': { boxShadow: HOVER_SHADOW },
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'box-shadow 0.2s',
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
              '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(25,118,210,0.1)' },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRadius: '0 !important' },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.15s',
            '&:hover': { backgroundColor: isLight ? 'rgba(25,118,210,0.03)' : 'rgba(255,255,255,0.03)' },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
  });
}
