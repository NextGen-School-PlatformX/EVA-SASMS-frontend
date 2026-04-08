'use client';

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { alpha, useTheme } from '@mui/material/styles';
import { getStudentFees, payStudentFee } from '@/src/lib/api/studentPortalApi';

// ─── QR Code Canvas ─────────────────────────────────────────────────────────
function generateQRMatrix(data: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const finder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))
        if (r + i < size && c + j < size) matrix[r + i][c + j] = true;
    }
  };
  finder(0, 0); finder(0, 14); finder(14, 0);
  let hash = 0;
  for (let k = 0; k < data.length; k++) hash = (hash * 31 + data.charCodeAt(k)) >>> 0;
  for (let i = 8; i < 13; i++) for (let j = 8; j < 13; j++) {
    matrix[i][j] = !!((hash >> ((i * 5 + j) % 32)) & 1);
  }
  for (let i = 1; i < 20; i += 2) { matrix[6][i] = !!(i % 4 === 0); matrix[i][6] = !!(i % 4 === 0); }
  return matrix;
}

function QRCodeCanvas({ data, size = 120, color = '#1a1a2e', bg = '#ffffff' }: { data: string; size?: number; color?: string; bg?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const matrix = generateQRMatrix(data);
    const cellSize = size / 21;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = color;
    matrix.forEach((row, r) => row.forEach((cell, c) => {
      if (cell) ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
    }));
  }, [data, size, color, bg]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 4 }} />;
}

// ─── Postal Barcode ──────────────────────────────────────────────────────────
function PostalBarcode({ value, width = 240, height = 50, color = '#1a1a2e' }: { value: string; width?: number; height?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    const bars: number[] = [];
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      bars.push(1 + (code % 3));
      bars.push(1);
    }
    const allBars = [2, 1, ...bars, 2];
    const totalUnits = allBars.reduce((a, b) => a + b, 0);
    const unitWidth = (width - 10) / totalUnits;
    let x = 5;
    ctx.fillStyle = color;
    allBars.forEach((units, i) => {
      if (i % 2 === 0) ctx.fillRect(x, 4, units * unitWidth - 0.5, height - 10);
      x += units * unitWidth;
    });
    ctx.font = `bold ${Math.max(8, height * 0.18)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(value, width / 2, height - 1);
  }, [value, width, height, color]);
  return <canvas ref={canvasRef} width={width} height={height} />;
}

// ─── Download Receipt ────────────────────────────────────────────────────────
function downloadReceipt(fee: any, studentName: string) {
  const receiptId = `RCPT-${(fee.feeId || 'XXXX').toString().toUpperCase().slice(0, 8)}`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${receiptId}</title>
  <style>body{font-family:'Courier New',monospace;max-width:380px;margin:40px auto;padding:24px;background:#fff;border:2px solid #000;}
  .h{text-align:center;border-bottom:2px dashed #000;padding-bottom:12px;margin-bottom:12px}
  .logo{font-size:22px;font-weight:900;letter-spacing:3px}.r{display:flex;justify-content:space-between;margin:5px 0;font-size:12px}
  .v{font-weight:700}.t{border-top:2px dashed #000;margin-top:10px;padding-top:10px;font-size:15px;font-weight:900}
  .bc{text-align:center;margin:16px 0;font-family:monospace;font-size:28px;letter-spacing:3px}
  .f{text-align:center;font-size:9px;color:#888;margin-top:12px;border-top:1px solid #ddd;padding-top:8px}</style></head>
  <body><div class="h"><div class="logo">SASMS</div><div style="font-size:10px;color:#555">Student Financial Receipt</div>
  <div style="font-size:10px;color:#555">${new Date().toLocaleString()}</div></div>
  <div class="r"><span>Receipt ID:</span><span class="v">${receiptId}</span></div>
  <div class="r"><span>Student:</span><span class="v">${studentName}</span></div>
  <div class="r"><span>Fee:</span><span class="v">${fee.fee?.title || 'N/A'}</span></div>
  <div class="r"><span>Due:</span><span class="v">${fee.fee?.dueDate ? new Date(fee.fee.dueDate).toLocaleDateString() : 'N/A'}</span></div>
  <div class="r"><span>Status:</span><span class="v">${fee.status}</span></div>
  <div class="r t"><span>AMOUNT:</span><span>$${fee.fee?.amount?.toLocaleString() || '0'}</span></div>
  <div class="bc">||||| ||||| ||| ||||</div>
  <div style="text-align:center;font-size:9px;font-family:monospace">${receiptId}</div>
  <div class="f">Auto-generated receipt • SASMS Financial System • ${new Date().getFullYear()}</div>
  </body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = `${receiptId}.html`;
  a.click();
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  UNPAID: { color: '#ef4444', bg: alpha('#ef4444', 0.1), label: 'Unpaid' },
  PENDING: { color: '#f59e0b', bg: alpha('#f59e0b', 0.1), label: 'Under Review' },
  APPROVED: { color: '#10b981', bg: alpha('#10b981', 0.1), label: 'Paid ✓' },
  PAID: { color: '#10b981', bg: alpha('#10b981', 0.1), label: 'Paid ✓' },
  REJECTED: { color: '#8b5cf6', bg: alpha('#8b5cf6', 0.1), label: 'Rejected' },
};

export default function StudentFeesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studentName = 'Student';

  const fetchFees = async () => {
    try {
      const data = await getStudentFees();
      setFees(data);
    } catch (err) {
      setError('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  const handleOpenPayModal = (fp: any) => {
    setSelectedFee(fp); setAmountPaid(fp.fee.amount.toString());
    setReceiptFile(null); setReceiptNumber(''); setSubmitSuccess(false); setPayModalOpen(true);
  };
  const handleOpenReceiptModal = (fp: any) => { setSelectedFee(fp); setReceiptModalOpen(true); };

  const handleSubmitPayment = async () => {
    if (!selectedFee || !receiptFile || !amountPaid || !receiptNumber) return;
    setSubmitting(true);
    try {
      await payStudentFee(selectedFee.feeId, parseFloat(amountPaid), receiptFile, receiptNumber);
      setSubmitSuccess(true);
      setTimeout(async () => { setPayModalOpen(false); setLoading(true); await fetchFees(); }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit payment');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress size={44} />
      <Typography variant="body2" color="text.secondary">Loading financial data...</Typography>
    </Box>
  );

  const total = fees.reduce((a, f) => a + (f.fee?.amount || 0), 0);
  const paid = fees.filter(f => f.status === 'APPROVED' || f.status === 'PAID').reduce((a, f) => a + (f.fee?.amount || 0), 0);
  const pendingAmt = fees.filter(f => f.status === 'PENDING').reduce((a, f) => a + (f.fee?.amount || 0), 0);
  const remaining = total - paid;
  const progress = total > 0 ? (paid / total) * 100 : 0;
  const accent = '#4f46e5';
  const cardBg = isDark ? alpha('#1e1e3f', 0.8) : '#ffffff';

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Header Hero */}
      <Box sx={{
        background: isDark ? 'linear-gradient(135deg, #1e1e3f 0%, #2d1b69 50%, #1a0a3c 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
        borderRadius: 3, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: alpha('#fff', 0.05) },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AccountBalanceIcon sx={{ color: '#a5b4fc', fontSize: 28 }} />
            <Typography variant="overline" sx={{ color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.15em' }}>FINANCIAL PORTAL</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 0.5, letterSpacing: '-0.03em' }}>My Financial Wallet</Typography>
          <Typography sx={{ color: alpha('#fff', 0.7), fontSize: '0.9rem' }}>Manage tuition payments, upload receipts & track your balance</Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), fontWeight: 600 }}>Payment Progress</Typography>
              <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 700 }}>{progress.toFixed(0)}% Complete</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#fff', 0.15), '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #a5b4fc, #34d399)', borderRadius: 4 } }} />
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Total Fees', value: `$${total.toLocaleString()}`, color: '#4f46e5', icon: '📋' },
          { label: 'Amount Paid', value: `$${paid.toLocaleString()}`, color: '#10b981', icon: '✅' },
          { label: 'Pending Review', value: `$${pendingAmt.toLocaleString()}`, color: '#f59e0b', icon: '⏳' },
          { label: 'Outstanding', value: `$${remaining.toLocaleString()}`, color: remaining > 0 ? '#ef4444' : '#10b981', icon: remaining > 0 ? '⚠️' : '🎉' },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: cardBg, border: `1px solid ${alpha(card.color, 0.15)}`, transition: 'all 0.2s', '&:hover': { borderColor: alpha(card.color, 0.4), transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(card.color, 0.1)}` } }}>
              <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{card.icon}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: card.color, fontFamily: 'monospace' }}>{card.value}</Typography>
              <Typography variant="body2" fontWeight={700}>{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Fee List */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em' }}>Detailed Fee List</Typography>
      <Stack spacing={2}>
        {fees.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: cardBg, border: `1px dashed ${alpha(accent, 0.2)}` }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>🎉</Typography>
            <Typography variant="h6" fontWeight={700}>No fees assigned yet</Typography>
            <Typography variant="body2" color="text.secondary">You're all clear!</Typography>
          </Paper>
        ) : fees.map((feeItem) => {
          const sc = STATUS_CONFIG[feeItem.status] || STATUS_CONFIG.UNPAID;
          const isPaid = feeItem.status === 'APPROVED' || feeItem.status === 'PAID';
          const isPending = feeItem.status === 'PENDING';
          return (
            <Paper key={feeItem.feeId} elevation={0} sx={{ borderRadius: 3, bgcolor: cardBg, border: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07)}`, overflow: 'hidden', transition: 'all 0.2s', '&:hover': { borderColor: alpha(accent, 0.25), boxShadow: `0 4px 20px ${alpha(accent, 0.07)}` } }}>
              <Box sx={{ height: 3, background: `linear-gradient(90deg, ${sc.color}, ${alpha(sc.color, 0.3)})` }} />
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(sc.color, 0.12), color: sc.color, display: 'flex', mt: 0.25 }}>
                        <CreditScoreIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800}>{feeItem.fee?.title || 'Fee'}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{feeItem.fee?.description}</Typography>
                        <Chip size="small" label={sc.label} sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: accent, fontFamily: 'monospace' }}>${feeItem.fee?.amount?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Due Date</Typography>
                    <Typography variant="body2" fontWeight={700}>{feeItem.fee?.dueDate ? new Date(feeItem.fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Stack direction="row" spacing={1} justifyContent={{ md: 'flex-end' }}>
                      {isPaid && (
                        <>
                          <Button size="small" variant="outlined" startIcon={<QrCodeIcon />} onClick={() => handleOpenReceiptModal(feeItem)} sx={{ borderRadius: 2, borderColor: alpha('#10b981', 0.4), color: '#10b981', fontSize: '0.75rem' }}>Receipt</Button>
                          <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => downloadReceipt(feeItem, studentName)} sx={{ borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontSize: '0.75rem' }}>Download</Button>
                        </>
                      )}
                      {isPending && <Chip label="⏳ Awaiting Review" color="warning" size="small" sx={{ fontWeight: 700 }} />}
                      {!isPaid && !isPending && (
                        <Button variant="contained" startIcon={<PaymentIcon />} onClick={() => handleOpenPayModal(feeItem)} sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', '&:hover': { background: 'linear-gradient(135deg, #4338ca, #6d28d9)' } }}>Pay Now</Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          );
        })}
      </Stack>

      {/* Payment Modal */}
      <Dialog open={payModalOpen} onClose={() => setPayModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #2563eb)' }} />
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#4f46e5', 0.1) }}><PaymentIcon sx={{ color: '#4f46e5', fontSize: 22 }} /></Box>
            Submit Payment
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {submitSuccess ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha('#10b981', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="success.main" gutterBottom>Payment Submitted!</Typography>
              <Typography variant="body2" color="text.secondary">Your receipt is pending admin approval. You'll be notified once confirmed.</Typography>
            </Box>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {selectedFee && (
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha('#4f46e5', 0.04), borderColor: alpha('#4f46e5', 0.2) }}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>Fee Details</Typography>
                  <Grid container spacing={1}>
                    {[{ label: 'Fee Name', value: selectedFee.fee?.title }, { label: 'Amount Due', value: `$${selectedFee.fee?.amount?.toLocaleString()}` }, { label: 'Due Date', value: selectedFee.fee?.dueDate ? new Date(selectedFee.fee.dueDate).toLocaleDateString() : 'N/A' }].map(item => (
                      <Grid key={item.label} size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
              <TextField label="Amount Paid (EGP)" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="Receipt / Reference Number *" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} fullWidth required placeholder="e.g. TXN-123456789" helperText="Enter the transaction/receipt number from your payment" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <Box>
                <input type="file" accept="image/jpeg,image/png,application/pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                <Button variant="outlined" fullWidth startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current?.click()} sx={{ py: 2, borderStyle: 'dashed', borderRadius: 2, borderColor: receiptFile ? '#10b981' : undefined, color: receiptFile ? '#10b981' : undefined }}>
                  {receiptFile ? `✓ ${receiptFile.name}` : 'Upload Payment Receipt (Image / PDF)'}
                </Button>
              </Box>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="caption">After submitting, your payment will be reviewed. Approval typically takes 1–2 business days.</Typography>
              </Alert>
            </Stack>
          )}
        </DialogContent>
        {!submitSuccess && (
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setPayModalOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitPayment} disabled={!amountPaid || !receiptFile || !receiptNumber || submitting} startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ReceiptIcon />} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', fontWeight: 700 }}>
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Receipt / QR Modal */}
      <Dialog open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #10b981, #059669)' }} />
        <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <QrCodeIcon sx={{ color: '#10b981' }} /> Payment Receipt
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFee && (() => {
            const rid = `RCPT-${(selectedFee.feeId || 'XXXX').toString().toUpperCase().slice(0, 8)}`;
            const qrData = JSON.stringify({ id: rid, fee: selectedFee.fee?.title, amount: selectedFee.fee?.amount, status: selectedFee.status });
            return (
              <Box>
                <Box sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography variant="h6" fontWeight={900}>🎓 SASMS Finance</Typography>
                  <Typography variant="caption" color="text.secondary">Official Payment Confirmation</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.75} sx={{ py: 1.5 }}>
                  {[{ label: 'Receipt ID', value: rid }, { label: 'Fee', value: selectedFee.fee?.title }, { label: 'Amount', value: `$${selectedFee.fee?.amount?.toLocaleString()}` }, { label: 'Status', value: '✅ Approved' }, { label: 'Date', value: new Date().toLocaleDateString() }].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.label}</Typography>
                      <Typography variant="caption" fontWeight={700}>{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scan to Verify</Typography>
                  <Box sx={{ p: 1.5, border: '2px solid', borderColor: alpha('#10b981', 0.3), borderRadius: 2, bgcolor: '#ffffff' }}>
                    <QRCodeCanvas data={qrData} size={130} color="#1a1a2e" bg="#ffffff" />
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase' }}>Postal Barcode</Typography></Divider>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <PostalBarcode value={rid.replace('RCPT-', '')} width={260} height={55} color="#1a1a2e" />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontSize: '0.65rem' }}>
                  {rid} • SASMS • {new Date().getFullYear()}
                </Typography>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setReceiptModalOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => selectedFee && downloadReceipt(selectedFee, studentName)} sx={{ borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }}>Download</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
