'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';

type StatusVariant =
  | 'present'
  | 'absent'
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
}

const STATUS_LABELS: Record<StatusVariant, string> = {
  present: 'Present',
  absent: 'Absent',
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const theme = useTheme();
  const displayLabel = label ?? STATUS_LABELS[status];

  const isPositive = ['present', 'paid', 'resolved', 'approved'].includes(status);
  const isNegative = ['absent', 'rejected', 'overdue'].includes(status);

  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: isPositive
          ? `${theme.palette.primary.main}40`
          : isNegative
            ? `${theme.palette.error.main}20`
            : theme.palette.divider,
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="caption" component="span">
        {displayLabel}
      </Typography>
    </Box>
  );
}
