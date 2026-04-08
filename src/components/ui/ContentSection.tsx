'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
interface ContentSectionProps {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: any;
}

export function ContentSection({ title, icon, action, children, sx }: ContentSectionProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
        overflow: 'hidden',
        ...sx
      }}
    >
      {title && (
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            backdropFilter: 'blur(20px)',
            backgroundColor: alpha(theme.palette.primary.light, 0.86),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {icon && <Box sx={{ display: 'flex', color: 'primary.main' }}>{icon}</Box>}
            <Typography
              variant="subtitle1"
              component="h2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Typography>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}
