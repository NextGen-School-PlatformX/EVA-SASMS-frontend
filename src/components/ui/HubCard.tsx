'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface HubCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

export function HubCard({ title, description, href, icon, badge }: HubCardProps) {
  const theme = useTheme();

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          p: 3,
          height: '100%',
          minHeight: 140,
          border: `1px solid ${theme.palette.divider}`,
   
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}08`,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
       
              backgroundColor: `${theme.palette.primary.main}20`,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          {badge != null && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.text.primary,
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                {badge}
              </Typography>
            </Box>
          )}
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}
