'use client';

import { useTheme } from '@mui/material';

interface PageBackgroundProps {
  children: React.ReactNode;
  variant?: 'dark' | 'auto';
}

/**
 * Wraps any page with the SASMS branded background:
 * - The uploaded background image at full visibility
 * - A subtle dark/light overlay
 * - Animated ambient orbs
 * - Grid line texture
 */
export function PageBackground({ children, variant = 'auto' }: PageBackgroundProps) {
  const theme = useTheme();
  const isDark = variant === 'dark' || theme.palette.mode === 'dark';
  const GOLD = '#FFC600';

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background image - very visible */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url("/download 1.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: isDark ? 0.32 : 0.22,
      }} />

      {/* Base color layer */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: isDark
          ? 'linear-gradient(135deg, #08080f 0%, #0f0f18 50%, #080c12 100%)'
          : 'linear-gradient(135deg, #f0f2ff 0%, #fff9e6 50%, #f0f8ff 100%)',
      }} />

      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', top: -100, right: -80, width: 500, height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLD}22, transparent 70%)`,
        zIndex: 0, pointerEvents: 'none',
        animation: 'orb1 12s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'fixed', bottom: -120, left: -80, width: 450, height: 450,
        borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle, #7c3aed1a, transparent 70%)' : 'radial-gradient(circle, #3b82f615, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
        animation: 'orb2 15s ease-in-out infinite alternate',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: isDark
          ? 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)'
          : 'linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      <style>{`
        @keyframes orb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,-30px) scale(1.1); } }
        @keyframes orb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-20px,20px) scale(1.08); } }
      `}</style>
    </div>
  );
}
