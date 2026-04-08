'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

interface InfoCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function InfoCard({ title, value, icon }: InfoCardProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 3,
        p: 3,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2],
        }
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight={700}>
          {value}
        </Typography>
      </Box>
      {icon && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: 'action.hover',
        }}>
          {icon}
        </Box>
      )}
    </Paper>
  );
}
