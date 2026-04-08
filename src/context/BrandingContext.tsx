'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface Branding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

const defaultBranding: Branding = {
  logoUrl: '',
  primaryColor: '#FFC600',
  secondaryColor: '#000000',
};

const BrandingContext = createContext<Branding>(defaultBranding);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaultBranding);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';
    fetch(`${api}/system/branding`)
      .then((r) => r.json())
      .then((data) => setBranding({ ...defaultBranding, ...data }))
      .catch(() => {});
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}

export function getLogoUrl(logoUrl: string): string {
  if (!logoUrl) return '';
  if (logoUrl.startsWith('http')) return logoUrl;
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';
  const root = api.replace('/api', '');
  return `${root}/${logoUrl.replace(/^\/+/, '')}`;
}
