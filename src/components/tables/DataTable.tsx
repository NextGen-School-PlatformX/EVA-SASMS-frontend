'use client';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string;
}

export function DataTable<T extends object>({
  columns,
  rows,
  emptyMessage = 'No data',
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId = (row) => (row as { id?: string }).id ?? '',
}: DataTableProps<T>) {
  const theme = useTheme();
  const allIds = rows.map(getRowId).filter(Boolean);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : allIds);
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,

        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            {selectable && (
              <TableCell padding="checkbox" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                <Checkbox
                  indeterminate={someSelected && !allSelected}
                  checked={allSelected}
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
            )}
            {columns.map((col, colIdx) => (
              <TableCell
                key={`${String(col.id)}-${colIdx}`}
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 4 }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => {
              const rowId = getRowId(row);
              return (
                <TableRow
                  key={idx}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(rowId)}
                        onChange={() => handleSelectRow(rowId)}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {columns.map((col, colIdx) => (
                    <TableCell key={`${String(col.id)}-${colIdx}`}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.id as string] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
