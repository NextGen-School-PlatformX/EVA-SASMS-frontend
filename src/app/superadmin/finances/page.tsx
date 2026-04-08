'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, Grid, Paper, Divider,
    IconButton, Tooltip, CircularProgress, TextField,
    Chip, List, ListItem, ListItemText,
    ListItemSecondaryAction, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem,
    Tab, Tabs, Alert, Switch, FormControlLabel, Avatar, Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import QrCodeIcon from '@mui/icons-material/QrCode';
import BankIcon from '@mui/icons-material/AccountBalance';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useNotification } from '@/src/context/NotificationContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { InfoCard } from '@/src/components/ui/InfoCard';
import { getFeeCategories, getSystemKPIs, getSystemDepartments } from '@/src/lib/api/superadminApi';
import { getFinancialRecords } from '@/src/lib/api/staffApi';
import { apiClient } from '@/src/lib/api/client';
import { FeeCategory, SystemKPIs, SystemDepartment } from '@/src/types/superadmin.types';
import { FinancialRecord } from '@/src/types/staff.types';

function genQRMatrix(data: string): boolean[][] {
    const sz = 21;
    const m: boolean[][] = Array.from({ length: sz }, () => Array(sz).fill(false));
    const f = (r: number, c: number) => {
        for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++)
            if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))
                if (r + i < sz && c + j < sz) m[r + i][c + j] = true;
    };
    f(0, 0); f(0, 14); f(14, 0);
    let h = 0; for (let k = 0; k < data.length; k++) h = (h * 31 + data.charCodeAt(k)) >>> 0;
    for (let i = 8; i < 13; i++) for (let j = 8; j < 13; j++) m[i][j] = !!((h >> ((i * 5 + j) % 32)) & 1);
    return m;
}

function QRCanvas({ data, size = 80 }: { data: string; size?: number }) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const m2 = genQRMatrix(data); const cs = size / 21;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000';
        m2.forEach((row, r) => row.forEach((cell, c2) => { if (cell) ctx.fillRect(c2 * cs, r * cs, cs - 0.5, cs - 0.5); }));
    }, [data, size]);
    return <canvas ref={ref} width={size} height={size} style={{ borderRadius: 4 }} />;
}

interface PaymentMethod {
    id: string;
    type: 'bank' | 'instapay' | 'vodafone_cash' | 'orange_cash' | 'etisalat_cash';
    label: string;
    accountNumber: string;
    accountName: string;
    bankName?: string;
    branchName?: string;
    instructionImageUrl?: string;
    isActive: boolean;
}

interface PendingPayment {
    id: string;
    studentName: string;
    studentId: string;
    amount: number;
    deptName: string;
    referenceNumber: string;
    submittedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const MOCK_PENDING: PendingPayment[] = [
    { id: 'p1', studentName: 'Ahmed Mohamed', studentId: 'STU-001', amount: 1500, deptName: 'Computer Science', referenceNumber: 'REF-20240115-001', submittedAt: '2024-01-15', status: 'PENDING' },
    { id: 'p2', studentName: 'Sara Ibrahim', studentId: 'STU-002', amount: 2000, deptName: 'Business Administration', referenceNumber: 'REF-20240115-002', submittedAt: '2024-01-15', status: 'PENDING' },
    { id: 'p3', studentName: 'Omar Hassan', studentId: 'STU-003', amount: 1200, deptName: 'Engineering', referenceNumber: 'REF-20240114-003', submittedAt: '2024-01-14', status: 'APPROVED' },
];

const PM_LABELS: Record<string, string> = {
    bank: 'Bank Transfer', instapay: 'InstaPay',
    vodafone_cash: 'Vodafone Cash', orange_cash: 'Orange Cash', etisalat_cash: 'Etisalat Cash',
};

export default function FinancialControlPage() {
    const { showNotification } = useNotification();
    const [tab, setTab] = useState(0);

    const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
    const [departments, setDepartments] = useState<SystemDepartment[]>([]);
    const [delinquentRecords, setDelinquentRecords] = useState<FinancialRecord[]>([]);
    const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
    const [kpis, setKpis] = useState<SystemKPIs | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const [feeOpen, setFeeOpen] = useState(false);
    const [newFee, setNewFee] = useState({ name: '', amount: '', frequency: 'Monthly', description: '', deptId: '' });

    const [pmOpen, setPmOpen] = useState(false);
    const [editingPm, setEditingPm] = useState<PaymentMethod | null>(null);
    const [pmForm, setPmForm] = useState<Partial<PaymentMethod>>({ type: 'bank', label: '', accountNumber: '', accountName: '', bankName: '', branchName: '', isActive: true });
    const [uploadingImg, setUploadingImg] = useState(false);
    const imgRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [fees, fin, kpiData, depts] = await Promise.all([getFeeCategories(), getFinancialRecords(), getSystemKPIs(), getSystemDepartments()]);
                setFeeCategories(fees);
                setDelinquentRecords(fin.filter((r: FinancialRecord) => r.status === 'Overdue'));
                setKpis(kpiData);
                setDepartments(depts);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        load();
        // Load payment methods from backend (shared with Admin)
        apiClient<PaymentMethod[]>('/finance/payment-methods')
            .then((methods) => setPaymentMethods(methods || []))
            .catch(() => setPaymentMethods([]));
        // Load real pending fee payments from backend
        apiClient<any[]>('/finance/fee-payments').then(data => {
            const mapped = data.map(fp => ({
                id: fp.id,
                studentName: fp.user?.name || 'Unknown',
                studentId: fp.user?.id || '',
                amount: fp.fee?.amount || fp.amountPaid || 0,
                deptName: fp.user?.department?.name || 'N/A',
                referenceNumber: fp.adminNote?.replace('REF#', '') || '—',
                submittedAt: fp.paidAt ? new Date(fp.paidAt).toLocaleDateString('ar-EG') : '—',
                status: fp.status as 'PENDING' | 'APPROVED' | 'REJECTED',
                receiptImage: fp.receiptImage,
                feeName: fp.fee?.title || '',
            }));
            setPendingPayments(mapped);
        }).catch(() => {});
    }, []);

    const handleReviewPayment = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await apiClient(`/finance/fee-payments/${id}/approve`, {
                method: 'PUT',
                body: JSON.stringify({ approve: status === 'APPROVED' })
            });
        } catch { /* optimistic */ }
        setPendingPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        showNotification(`Payment ${status === 'APPROVED' ? 'approved ✅' : 'rejected ❌'}`, status === 'APPROVED' ? 'success' : 'error');
    };

    const handleSavePm = () => {
        if (!pmForm.label || !pmForm.accountNumber || !pmForm.accountName) { showNotification('Fill all required fields.', 'warning'); return; }
        let updated: PaymentMethod[];
        if (editingPm) {
            updated = paymentMethods.map(m => m.id === editingPm.id ? { ...m, ...pmForm } as PaymentMethod : m);
            showNotification('Payment method updated!', 'success');
        } else {
            updated = [...paymentMethods, { id: `pm-${Date.now()}`, ...pmForm } as PaymentMethod];
            showNotification('Payment method added!', 'success');
        }
        // Persist to backend
        apiClient('/finance/payment-methods', {
            method: 'POST',
            body: JSON.stringify(updated),
        }).catch(() => { /* ignore, optimistic */ });
        setPaymentMethods(updated);
        setPmOpen(false);
        setEditingPm(null);
        setPmForm({ type: 'bank', label: '', accountNumber: '', accountName: '', bankName: '', branchName: '', isActive: true });
    };

    const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingImg(true);
        const url = URL.createObjectURL(file);
        setPmForm(p => ({ ...p, instructionImageUrl: url }));
        showNotification('Image attached!', 'success');
        setUploadingImg(false);
    };

    const delinqCols: Column<FinancialRecord>[] = [
        { id: 'studentName', label: 'Student Name' },
        { id: 'id', label: 'Invoice', render: (row) => <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: alpha('#ef4444', 0.1), px: 1, py: 0.25, borderRadius: 1, color: '#ef4444', fontWeight: 700 }}>{row.id}</Typography> },
        { id: 'amount', label: 'Amount', render: (row) => `EGP ${row.amount.toLocaleString()}` },
        { id: 'dueDate', label: 'Due Date' },
        {
            id: 'actions', label: 'Action',
            render: (row) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ p: 0.5, bgcolor: '#fff', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <QRCanvas data={`INV-${row.id}-${row.studentName}`} size={36} />
                    </Box>
                    <Tooltip title="Lock Account"><IconButton size="small" color="error" onClick={() => showNotification(`Locked: ${row.studentName}`, 'error')}><LockIcon /></IconButton></Tooltip>
                </Box>
            )
        }
    ];

    const pendingCols: Column<PendingPayment>[] = [
        { id: 'studentName', label: 'Student' },
        { id: 'deptName', label: 'Department' },
        { id: 'amount', label: 'Amount', render: (row) => `EGP ${row.amount.toLocaleString()}` },
        { id: 'referenceNumber', label: 'Reference', render: (row) => <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: alpha('#3b82f6', 0.1), px: 1, py: 0.25, borderRadius: 1, color: '#3b82f6', fontWeight: 700 }}>{row.referenceNumber}</Typography> },
        { id: 'submittedAt', label: 'Date' },
        {
            id: 'status', label: 'Status',
            render: (row) => <Chip label={row.status} size="small" color={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'warning'} />
        },
        {
            id: 'actions', label: 'Review',
            render: (row) => row.status === 'PENDING' ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" color="success" onClick={() => handleReviewPayment(row.id, 'APPROVED')}>Approve</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleReviewPayment(row.id, 'REJECTED')}>Reject</Button>
                </Box>
            ) : <Typography variant="caption" color="text.secondary">Done</Typography>
        }
    ];

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;

    const pendingCount = pendingPayments.filter(p => p.status === 'PENDING').length;

    return (
        <Box>
            <PageHeader
                title="Global Financial System Control"
                description="Configure fees, manage payment methods, review student receipts, and monitor delinquency"
                action={<Button variant="outlined" startIcon={<AssessmentIcon />} onClick={() => showNotification('Generating audit...', 'info')}>Generate Audit</Button>}
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 3 }}><InfoCard title="System Outstanding" value={`EGP ${(kpis?.outstandingFeesTotal ?? 0).toLocaleString()}`} icon={<WarningIcon color="error" />} /></Grid>
                <Grid size={{ xs: 12, md: 3 }}><InfoCard title="Delinquent Accounts" value={delinquentRecords.length} icon={<LockIcon color="warning" />} /></Grid>
                <Grid size={{ xs: 12, md: 3 }}><InfoCard title="Pending Receipts" value={pendingCount} icon={<PendingActionsIcon color="info" />} /></Grid>
                <Grid size={{ xs: 12, md: 3 }}><InfoCard title="Active Departments" value={departments.length} icon={<AccountBalanceWalletIcon color="success" />} /></Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Fee Configuration" />
                    <Tab label="Payment Methods" />
                    <Tab label={`Pending Receipts${pendingCount > 0 ? ` (${pendingCount})` : ''}`} />
                    <Tab label="Delinquent Accounts" />
                </Tabs>
            </Box>

            {/* Tab 0: Fee Config */}
            {tab === 0 && (
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <ContentSection title="Fee Categories" action={<Button size="small" startIcon={<AddIcon />} onClick={() => setFeeOpen(true)}>Add Category</Button>}>
                            <List>
                                {feeCategories.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No categories yet. Add one!</Typography>}
                                {feeCategories.map((fee, i) => (
                                    <Box key={fee.id}>
                                        <ListItem sx={{ px: 0, py: 2 }}>
                                            <ListItemText
                                                primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><Typography fontWeight={600}>{fee.name}</Typography><Chip label={fee.frequency} size="small" variant="outlined" /></Box>}
                                                secondary={fee.description}
                                            />
                                            <Typography variant="h6" color="primary" fontWeight={700} sx={{ mr: 4 }}>EGP {fee.amount}</Typography>
                                            <ListItemSecondaryAction><IconButton size="small"><EditIcon fontSize="small" /></IconButton></ListItemSecondaryAction>
                                        </ListItem>
                                        {i < feeCategories.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        </ContentSection>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <ContentSection title="Department Financial Status">
                            <List>
                                {departments.map((dept, i) => (
                                    <Box key={dept.id}>
                                        <ListItem sx={{ px: 0, py: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', mr: 2, fontWeight: 800 }}>{dept.name.charAt(0)}</Avatar>
                                            <ListItemText primary={<Typography fontWeight={700}>{dept.name}</Typography>} secondary={`${dept.studentCount} students · ${dept.staffCount} staff`} />
                                            <Chip label={dept.financialStatus} size="small" color={dept.financialStatus === 'Healthy' ? 'success' : dept.financialStatus === 'Deficit' ? 'error' : 'warning'} />
                                        </ListItem>
                                        {i < departments.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        </ContentSection>
                    </Grid>
                </Grid>
            )}

            {/* Tab 1: Payment Methods */}
            {tab === 1 && (
                <ContentSection title="Payment Methods & Instructions" action={<Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingPm(null); setPmOpen(true); }}>Add Method</Button>}>
                    {paymentMethods.length === 0 && (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                            <BankIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No payment methods configured</Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>Add bank accounts or e-wallet numbers. Students will see these when paying fees.</Typography>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPmOpen(true)}>Add First Method</Button>
                        </Box>
                    )}
                    <Grid container spacing={3}>
                        {paymentMethods.map((pm) => (
                            <Grid key={pm.id} size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, opacity: pm.isActive ? 1 : 0.55, borderColor: pm.isActive ? 'primary.main' : 'divider', borderWidth: pm.isActive ? 2 : 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800}>{pm.label}</Typography>
                                            <Chip label={PM_LABELS[pm.type] || pm.type} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                            <Switch checked={pm.isActive} onChange={() => { const u = paymentMethods.map(m => m.id === pm.id ? { ...m, isActive: !m.isActive } : m); setPaymentMethods(u); apiClient('/finance/payment-methods', { method: 'POST', body: JSON.stringify(u) }).catch(() => {}); }} size="small" />
                                            <IconButton size="small" onClick={() => { setEditingPm(pm); setPmForm({ ...pm }); setPmOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                                        </Box>
                                    </Box>
                                    <Stack spacing={1}>
                                        {pm.bankName && <Box sx={{ display: 'flex', gap: 1 }}><Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Bank:</Typography><Typography variant="caption" fontWeight={700}>{pm.bankName}</Typography></Box>}
                                        {pm.branchName && <Box sx={{ display: 'flex', gap: 1 }}><Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Branch:</Typography><Typography variant="caption" fontWeight={600}>{pm.branchName}</Typography></Box>}
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Account No.:</Typography>
                                            <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace', bgcolor: alpha('#3b82f6', 0.1), px: 1, py: 0.25, borderRadius: 1, color: '#3b82f6' }}>{pm.accountNumber}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}><Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Account Name:</Typography><Typography variant="caption" fontWeight={600}>{pm.accountName}</Typography></Box>
                                    </Stack>
                                    {pm.instructionImageUrl && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Instructions Image:</Typography>
                                            <Box component="img" src={pm.instructionImageUrl} alt="instructions" sx={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </ContentSection>
            )}

            {/* Tab 2: Pending Receipts */}
            {tab === 2 && (
                <ContentSection title="Student Payment Receipts — Pending Review">
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                        Students submit receipts and reference numbers here. Review and approve or reject each submission to confirm payment.
                    </Alert>
                    <DataTable columns={pendingCols} rows={pendingPayments} emptyMessage="No pending payment receipts." />
                </ContentSection>
            )}

            {/* Tab 3: Delinquent Accounts */}
            {tab === 3 && (
                <ContentSection title="Delinquent Accounts (System-Wide)">
                    <DataTable columns={delinqCols} rows={delinquentRecords} emptyMessage="No delinquent accounts found." />
                </ContentSection>
            )}

            {/* Add Fee Modal */}
            <Dialog open={feeOpen} onClose={() => setFeeOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Add Fee Category</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField fullWidth label="Fee Name *" value={newFee.name} onChange={(e) => setNewFee(p => ({ ...p, name: e.target.value }))} />
                        <TextField fullWidth label="Suggested Amount (EGP)" type="number" value={newFee.amount} onChange={(e) => setNewFee(p => ({ ...p, amount: e.target.value }))} />
                        <FormControl fullWidth>
                            <InputLabel>Billing Frequency</InputLabel>
                            <Select label="Billing Frequency" value={newFee.frequency} onChange={(e) => setNewFee(p => ({ ...p, frequency: e.target.value }))}>
                                <MenuItem value="One-time">One-time</MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Termly">Termly</MenuItem>
                                <MenuItem value="Annually">Annually</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Department (optional)</InputLabel>
                            <Select label="Department (optional)" value={newFee.deptId} onChange={(e) => setNewFee(p => ({ ...p, deptId: e.target.value }))}>
                                <MenuItem value="">All Departments</MenuItem>
                                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="Description" multiline rows={2} value={newFee.description} onChange={(e) => setNewFee(p => ({ ...p, description: e.target.value }))} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setFeeOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={async () => {
                        if (!newFee.name) { showNotification('Fee name is required.', 'warning'); return; }
                        try {
                            // Create logical category only (amount الحقيقي يحدد عند إصدار الفاتورة من الـAdmin)
                            const payload = {
                                name: newFee.name,
                                amount: newFee.amount ? parseFloat(newFee.amount) : 0,
                                description: newFee.description || '',
                            };
                            const created = await apiClient<FeeCategory>('/finance/categories', {
                                method: 'POST',
                                body: JSON.stringify(payload),
                            });
                            setFeeCategories(prev => [...prev, created]);
                            showNotification(`✅ Category "${newFee.name}" created.`, 'success');
                            setFeeOpen(false);
                            setNewFee({ name: '', amount: '', frequency: 'Monthly', description: '', deptId: '' });
                        } catch (e: any) {
                            showNotification(`Error: ${e.message}`, 'error');
                        }
                    }}>Add</Button>
                </DialogActions>
            </Dialog>

            {/* Payment Method Modal */}
            <Dialog open={pmOpen} onClose={() => setPmOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingPm ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField fullWidth label="Display Label *" placeholder="e.g. Banque Misr — Tuition Fees" value={pmForm.label || ''} onChange={(e) => setPmForm(p => ({ ...p, label: e.target.value }))} />
                        <FormControl fullWidth>
                            <InputLabel>Payment Type *</InputLabel>
                            <Select label="Payment Type *" value={pmForm.type || 'bank'} onChange={(e) => setPmForm(p => ({ ...p, type: e.target.value as PaymentMethod['type'] }))}>
                                <MenuItem value="bank">🏦 Bank Transfer</MenuItem>
                                <MenuItem value="instapay">💳 InstaPay</MenuItem>
                                <MenuItem value="vodafone_cash">📱 Vodafone Cash</MenuItem>
                                <MenuItem value="orange_cash">🟠 Orange Cash</MenuItem>
                                <MenuItem value="etisalat_cash">🔵 Etisalat Cash</MenuItem>
                            </Select>
                        </FormControl>
                        {pmForm.type === 'bank' && (
                            <>
                                <TextField fullWidth label="Bank Name" placeholder="e.g. Banque Misr" value={pmForm.bankName || ''} onChange={(e) => setPmForm(p => ({ ...p, bankName: e.target.value }))} />
                                <TextField fullWidth label="Branch Name" placeholder="e.g. Nasr City Branch" value={pmForm.branchName || ''} onChange={(e) => setPmForm(p => ({ ...p, branchName: e.target.value }))} />
                            </>
                        )}
                        <TextField fullWidth label="Account / Wallet Number *" placeholder={pmForm.type === 'bank' ? '1234567890' : '01012345678'} value={pmForm.accountNumber || ''} onChange={(e) => setPmForm(p => ({ ...p, accountNumber: e.target.value }))} />
                        <TextField fullWidth label="Account Holder Name *" value={pmForm.accountName || ''} onChange={(e) => setPmForm(p => ({ ...p, accountName: e.target.value }))} />
                        <Divider />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Instructions Image (Optional)</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>Upload a screenshot or QR code — shown to the student when they pay.</Typography>
                            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgUpload} />
                            <Button variant="outlined" startIcon={uploadingImg ? <CircularProgress size={16} /> : <UploadIcon />} onClick={() => imgRef.current?.click()} disabled={uploadingImg} sx={{ mb: 1.5 }}>
                                Upload Image
                            </Button>
                            {pmForm.instructionImageUrl && (
                                <Box component="img" src={pmForm.instructionImageUrl} alt="preview" sx={{ display: 'block', width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPmOpen(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSavePm}>{editingPm ? 'Update' : 'Add Method'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
