'use client';

import { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { InfoCard } from '@/src/components/ui/InfoCard';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { getFinancialRecords, getAffairsRecords, createFee, getFeePayments, reviewFeePayment, apiClient } from '@/src/lib/api';
import { getSystemDepartments } from '@/src/lib/api/superadminApi';
import type { FinancialRecord, StudentAffairsRecord } from '@/src/types/staff.types';

// ─── QR Code (canvas) ────────────────────────────────────────────────────────
function genMatrix(data: string): boolean[][] {
  const sz = 21;
  const m: boolean[][] = Array.from({ length: sz }, () => Array(sz).fill(false));
  const f = (r: number, c: number) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) if (r + i < sz && c + j < sz) m[r + i][c + j] = true; } };
  f(0, 0); f(0, 14); f(14, 0);
  let h = 0; for (let k = 0; k < data.length; k++) h = (h * 31 + data.charCodeAt(k)) >>> 0;
  for (let i = 8; i < 13; i++) for (let j = 8; j < 13; j++) m[i][j] = !!((h >> ((i * 5 + j) % 32)) & 1);
  for (let i = 1; i < 20; i += 2) { m[6][i] = !!(i % 4 === 0); m[i][6] = !!(i % 4 === 0); }
  return m;
}
function QRCanvas({ data, size = 100 }: { data: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const m = genMatrix(data); const cs = size / 21;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000';
    m.forEach((row, r) => row.forEach((cell, c2) => { if (cell) ctx.fillRect(c2 * cs, r * cs, cs - 0.5, cs - 0.5); }));
  }, [data, size]);
  return <canvas ref={ref} width={size} height={size} style={{ borderRadius: 4 }} />;
}

// ─── Status pill ─────────────────────────────────────────────────────────────
const PAY_STATUS: Record<string, { color: string; label: string }> = {
  PENDING: { color: '#f59e0b', label: '⏳ Pending Review' },
  APPROVED: { color: '#10b981', label: '✅ Approved' },
  REJECTED: { color: '#ef4444', label: '❌ Rejected' },
};

export default function AdminFinancesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [students, setStudents] = useState<StudentAffairsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<'single' | 'batch'>('single');
  const [selectedStudent, setSelectedStudent] = useState<StudentAffairsRecord | null>(null);
  const [batchCohort, setBatchCohort] = useState<{ year: string; department: string }>({ year: '', department: '' });
  const [newInvoiceData, setNewInvoiceData] = useState({ title: '', description: '', amount: '', dueDate: '' });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('Action completed successfully!');
  const [mainTab, setMainTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feeCategories, setFeeCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [departmentsMaster, setDepartmentsMaster] = useState<any[]>([]);

  const showSuccess = (msg: string) => { setSnackbarMsg(msg); setSnackbarOpen(true); };

  const fetchPayments = async () => {
    try { const data = await getFeePayments(); setPayments(data); } catch { }
  };

  useEffect(() => {
    Promise.all([
      getFinancialRecords(),
      getAffairsRecords(),
      getFeePayments(),
      apiClient<any[]>('/finance/categories').catch(() => []),
      apiClient<any[]>('/finance/payment-methods').catch(() => []),
      getSystemDepartments().catch(() => []),
    ])
      .then(([fin, aff, pay, cats, methods, depts]) => {
        setRecords(fin);
        setStudents(aff);
        setPayments(pay);
        setFeeCategories(cats || []);
        setPaymentMethods((methods || []).filter((m: any) => m.isActive !== false));
        setDepartmentsMaster(depts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleReview = async (status: string) => {
    if (!selectedPayment) return;
    setReviewLoading(true);
    try {
      await reviewFeePayment(selectedPayment.id, status, reviewNote);
      await fetchPayments();
      setReviewModalOpen(false); setSelectedPayment(null); setReviewNote('');
      showSuccess(`Payment ${status === 'APPROVED' ? 'approved ✅' : 'rejected'} successfully`);
    } catch { } finally { setReviewLoading(false); }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoiceData.amount || !newInvoiceData.dueDate) return;
    try {
      const category = feeCategories.find((c) => c.id === selectedCategoryId);
      const paymentMethod = paymentMethods.find((m) => m.id === selectedPaymentMethodId);
      if (invoiceMode === 'single' && selectedStudent) {
        await createFee({
          title: newInvoiceData.title || `Tuition Fee - ${selectedStudent.name}`,
          description: newInvoiceData.description || `Fee for ${selectedStudent.name}`,
          amount: newInvoiceData.amount,
          dueDate: newInvoiceData.dueDate,
          categoryLabel: category?.name,
          paymentMethodLabel: paymentMethod?.label,
          targetUserIds: [selectedStudent.id],
        });
      } else if (invoiceMode === 'batch') {
        const targets = students.filter(s => s.year === batchCohort.year && s.department === batchCohort.department);
        if (targets.length === 0) { alert('No students in this cohort.'); return; }
        await createFee({
          title: newInvoiceData.title || `Tuition Fee - ${batchCohort.year} - ${batchCohort.department}`,
          description: newInvoiceData.description || `Batch fee`,
          amount: newInvoiceData.amount,
          dueDate: newInvoiceData.dueDate,
          categoryLabel: category?.name,
          paymentMethodLabel: paymentMethod?.label,
          targetUserIds: targets.map((s) => s.id),
        });
      }
      const fin = await getFinancialRecords(); setRecords(fin);
      setCreateModalOpen(false);
      setNewInvoiceData({ title: '', description: '', amount: '', dueDate: '' });
      setSelectedStudent(null);
      setSelectedCategoryId('');
      setSelectedPaymentMethodId('');
      showSuccess('Invoice(s) created successfully!');
    } catch { }
  };

  const totalCollected = records.filter(r => r.status === 'Paid').reduce((s, r) => s + r.amount, 0);
  const totalOutstanding = records.filter(r => r.status !== 'Paid').reduce((s, r) => s + r.amount, 0);
  const overdueRecords = records.filter(r => r.status === 'Overdue');
  const pendingPayments = payments.filter(p => p.status === 'PENDING');

  // Dynamic cohort options based on real data
  const yearOptions = Array.from(new Set(students.map((s) => s.year).filter((y): y is string => !!y && y !== 'N/A')));
  const deptOptions = departmentsMaster.length
    ? departmentsMaster.map((d: any) => d.name)
    : Array.from(new Set(students.map((s) => s.department).filter((d): d is string => !!d && d !== 'N/A')));

  useEffect(() => {
    // Initialize batch cohort once students are loaded
    if (students.length > 0 && (!batchCohort.year || !batchCohort.department)) {
      setBatchCohort({
        year: yearOptions[0] || '',
        department: deptOptions[0] || '',
      });
    }
  }, [students, yearOptions.length, deptOptions.length]);

  const filteredPayments = payments.filter(p => {
    const matchSearch = !searchQuery || (p.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.fee?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const accent = '#6366f1';
  const cardBg = isDark ? alpha('#1e1e3f', 0.7) : '#ffffff';

  const invoiceColumns: Column<any>[] = [
    { id: 'title', label: 'Fee Title' },
    { id: 'id', label: 'Invoice ID', render: (row) => <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: alpha(accent, 0.1), px: 1, py: 0.25, borderRadius: 1, color: accent, fontWeight: 700 }}>{row.id}</Typography> },
    { id: 'amount', label: 'Amount', render: (row) => <Typography fontWeight={700} color={accent}>${row.amount.toLocaleString()}</Typography> },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={(row.status || 'UNPAID').toLowerCase() as any} /> },
    // Manual "Record" flow is disabled for now to avoid confusing non-persistent state.
    // All official payments should go through the student portal + admin review.
  ];

  const paymentColumns: Column<any>[] = [
    {
      id: 'student', label: 'Student', render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={700}>{row.user?.name || 'Unknown'}</Typography>
          <Typography variant="caption" color="text.secondary">{row.user?.email}</Typography>
        </Box>
      )
    },
    { id: 'fee', label: 'Fee', render: (row) => row.fee?.title || 'Unknown' },
    { id: 'amountPaid', label: 'Amount', render: (row) => <Typography fontWeight={700} color="success.main">${row.amountPaid || 0}</Typography> },
    {
      id: 'status', label: 'Status', render: (row) => {
        const sc = PAY_STATUS[row.status] || PAY_STATUS.PENDING;
        return <Chip label={sc.label} size="small" sx={{ bgcolor: alpha(sc.color, 0.1), color: sc.color, fontWeight: 700, fontSize: '0.7rem' }} />;
      }
    },
    { id: 'date', label: 'Submitted', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      id: 'actions', label: 'Action', render: (row) => row.status === 'PENDING' ? (
        <Button size="small" variant="contained" onClick={() => { setSelectedPayment(row); setReviewNote(''); setReviewModalOpen(true); }} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent }}>Review</Button>
      ) : (
        <Tooltip title={row.adminNote || ''}>
          <Typography variant="caption" color="text.secondary">{row.adminNote ? '📝 Note' : '—'}</Typography>
        </Tooltip>
      )
    }
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeader
        title="Financial System Management"
        description="Manage student invoices, review payment submissions, and monitor balances"
      />

      {/* KPI Cards */}
      <Grid container spacing={3}>
        {[
          { title: 'Total Collected (YTD)', value: `$${totalCollected.toLocaleString()}`, icon: <CheckCircleOutlineIcon color="success" />, color: '#10b981' },
          { title: 'Total Outstanding', value: `$${totalOutstanding.toLocaleString()}`, icon: <AccountBalanceWalletIcon color="warning" />, color: '#f59e0b' },
          { title: 'Overdue Accounts', value: overdueRecords.length, icon: <WarningIcon color="error" />, color: '#ef4444' },
          { title: 'Pending Approvals', value: pendingPayments.length, icon: <ReceiptLongIcon color="info" />, color: '#3b82f6' },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: cardBg, border: `1px solid ${alpha(card.color, 0.15)}`, transition: 'all 0.2s', '&:hover': { borderColor: alpha(card.color, 0.4), boxShadow: `0 4px 20px ${alpha(card.color, 0.1)}` } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>{card.icon}<Typography variant="caption" color="text.secondary" fontWeight={600}>{card.title}</Typography></Box>
              <Typography variant="h5" fontWeight={900} sx={{ color: card.color, fontFamily: 'monospace' }}>{card.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Tabs */}
      <Box sx={{ borderBottom: `1px solid ${alpha(accent, 0.2)}` }}>
        <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ '& .Mui-selected': { color: `${accent} !important` }, '& .MuiTabs-indicator': { bgcolor: accent } }}>
          <Tab icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" label="Invoices Database" />
          <Tab icon={<TrendingUpIcon fontSize="small" />} iconPosition="start" label={`Payment Submissions ${pendingPayments.length > 0 ? `(${pendingPayments.length} pending)` : ''}`} />
        </Tabs>
      </Box>

      {/* Invoices Tab */}
      {mainTab === 0 && (
        <ContentSection title="Invoices Database">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => { setReportLoading(true); setTimeout(() => { setReportLoading(false); setReportDialogOpen(true); }, 1500); }} disabled={reportLoading}>
              {reportLoading ? <CircularProgress size={20} /> : 'Delinquency Report'}
            </Button>
            <Button variant="contained" onClick={() => setCreateModalOpen(true)} sx={{ bgcolor: accent, borderRadius: 2, fontWeight: 700 }}>
              + Create Invoice
            </Button>
          </Box>
          <DataTable columns={invoiceColumns} rows={records} />
        </ContentSection>
      )}

      {/* Payment Submissions Tab */}
      {mainTab === 1 && (
        <ContentSection title="Student Payment Submissions">
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField placeholder="Search by student or fee..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <DataTable columns={paymentColumns} rows={filteredPayments} emptyMessage="No payment submissions found." />
        </ContentSection>
      )}

      {/* Payment Record Modal */}
      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}>
        <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 480 }, p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>Record Manual Payment</Typography>
            <IconButton onClick={() => setPaymentModalOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          {selectedRecord && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(accent, 0.04) }}>
                <Typography variant="body2">Student: <strong>{selectedRecord.studentName}</strong></Typography>
                <Typography variant="body2">Invoice ID: <strong>{selectedRecord.id}</strong></Typography>
                <Typography variant="body2">Amount Due: <strong>${selectedRecord.amount.toLocaleString()}</strong></Typography>
              </Paper>
              <TextField label="Payment Amount ($)" type="number" defaultValue={selectedRecord.amount} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="Receipt Reference / Notes" multiline rows={2} placeholder="Bank transfer ID or receipt number..." fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button fullWidth variant="outlined" onClick={() => setPaymentModalOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                <Button fullWidth variant="contained" color="success" onClick={() => { setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, status: 'Paid' } : r)); setPaymentModalOpen(false); showSuccess('Payment recorded successfully!'); }} sx={{ borderRadius: 2, fontWeight: 700 }}>Confirm</Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', sm: 520 }, p: 4, borderRadius: 3, maxHeight: '90vh', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Issue New Invoice</Typography>
            <IconButton onClick={() => setCreateModalOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['single', 'batch'] as const).map(mode => (
                <Button key={mode} fullWidth variant={invoiceMode === mode ? 'contained' : 'outlined'} onClick={() => setInvoiceMode(mode)} sx={{ borderRadius: 2, fontWeight: 700, ...(invoiceMode === mode ? { bgcolor: accent } : {}) }}>
                  {mode === 'single' ? '👤 Single Student' : '👥 Batch (Cohort)'}
                </Button>
              ))}
            </Box>
            <Divider />
            {invoiceMode === 'single' ? (
              <Autocomplete
                options={students}
                getOptionLabel={(o) => o.name ? `${o.name}${o.email ? ` (${o.email})` : ''}` : o.email || ''}
                value={selectedStudent}
                onChange={(_, v) => setSelectedStudent(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Student by name or email"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Academic Year</InputLabel>
                    <Select
                      value={batchCohort.year}
                      label="Academic Year"
                      onChange={(e) => setBatchCohort({ ...batchCohort, year: e.target.value })}
                    >
                      {yearOptions.map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={batchCohort.department}
                      label="Department"
                      onChange={(e) => setBatchCohort({ ...batchCohort, department: e.target.value })}
                    >
                      {deptOptions.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Fee Category</InputLabel>
              <Select
                label="Fee Category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value as string)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">None</MenuItem>
                {feeCategories.map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                label="Payment Method"
                value={selectedPaymentMethodId}
                onChange={(e) => setSelectedPaymentMethodId(e.target.value as string)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">None</MenuItem>
                {paymentMethods.map((m: any) => (
                  <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Invoice Title" value={newInvoiceData.title} onChange={(e) => setNewInvoiceData(p => ({ ...p, title: e.target.value }))} fullWidth placeholder="e.g. Tuition Fee - Term 1" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Description" value={newInvoiceData.description} onChange={(e) => setNewInvoiceData(p => ({ ...p, description: e.target.value }))} fullWidth multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Amount ($)" type="number" value={newInvoiceData.amount} onChange={(e) => setNewInvoiceData(p => ({ ...p, amount: e.target.value }))} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Due Date" type="date" value={newInvoiceData.dueDate} onChange={(e) => setNewInvoiceData(p => ({ ...p, dueDate: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => setCreateModalOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
              <Button fullWidth variant="contained" onClick={handleCreateInvoice} disabled={(invoiceMode === 'single' && !selectedStudent) || !newInvoiceData.amount || !newInvoiceData.dueDate} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent }}>
                Issue {invoiceMode === 'batch' ? 'Batch Invoices' : 'Invoice'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Modal>

      {/* Review Payment Modal */}
      <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        <DialogTitle sx={{ fontWeight: 800 }}>Review Payment Submission</DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(accent, 0.04) }}>
                <Grid container spacing={1}>
                  {[
                    { label: 'Student', value: selectedPayment.user?.name },
                    { label: 'Email', value: selectedPayment.user?.email },
                    { label: 'Fee', value: selectedPayment.fee?.title },
                    { label: 'Fee Amount', value: `$${selectedPayment.fee?.amount}` },
                    { label: 'Amount Paid', value: `$${selectedPayment.amountPaid}` },
                    { label: 'Submitted', value: new Date(selectedPayment.createdAt).toLocaleDateString() },
                  ].map(item => (
                    <Grid key={item.label} size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
              {selectedPayment.receiptImage && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Payment Receipt</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const raw = selectedPayment.receiptImage as string;
                        if (!raw) return;
                        if (raw.startsWith('http')) {
                          window.open(raw, '_blank');
                          return;
                        }
                        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                        const root = apiBase.replace('/api', '');
                        const url = `${root}/${raw.replace(/^\/+/, '')}`;
                        window.open(url, '_blank');
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      🖼️ View Receipt Image
                    </Button>
                    <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <QRCanvas data={`${selectedPayment.id}-${selectedPayment.user?.name}-${selectedPayment.amountPaid}`} size={80} />
                    </Box>
                  </Box>
                </Box>
              )}
              {selectedPayment.amountPaid < selectedPayment.fee?.amount && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  ⚠️ Student paid <strong>${selectedPayment.amountPaid}</strong> but fee is <strong>${selectedPayment.fee?.amount}</strong>. Difference: <strong>${selectedPayment.fee?.amount - selectedPayment.amountPaid}</strong>
                </Alert>
              )}
              <TextField label="Admin Note (optional)" multiline rows={2} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReviewModalOpen(false)} disabled={reviewLoading} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="outlined" color="error" onClick={() => handleReview('REJECTED')} disabled={reviewLoading} sx={{ borderRadius: 2, fontWeight: 700 }}>Reject</Button>
          <Button variant="contained" color="success" onClick={() => handleReview('APPROVED')} disabled={reviewLoading} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {reviewLoading ? <CircularProgress size={18} color="inherit" /> : 'Approve ✓'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delinquency Report */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningIcon color="error" /><Typography variant="h6" fontWeight={700}>Delinquency Report</Typography></Box></DialogTitle>
        <DialogContent dividers>
          {overdueRecords.length > 0 ? <DataTable columns={[{ id: 'studentName', label: 'Student Name' }, { id: 'id', label: 'Invoice ID' }, { id: 'amount', label: 'Overdue Amount', render: (r) => `$${r.amount}` }, { id: 'dueDate', label: 'Originally Due' }]} rows={overdueRecords} /> : <Typography color="text.secondary">No overdue accounts found.</Typography>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReportDialogOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
          <Button variant="contained" color="error" disabled={overdueRecords.length === 0} sx={{ borderRadius: 2, fontWeight: 700 }}>Export PDF</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ borderRadius: 2 }}>{snackbarMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
