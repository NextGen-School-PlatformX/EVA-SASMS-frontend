 'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Divider,
  Slider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { useNotification } from '@/src/context/NotificationContext';
import { apiClient } from '@/src/lib/api/client';

const GOLD = '#FFC600';

interface TeacherOfMonth {
  name: string;
  title?: string;
  imageUrl?: string; // can be "uploads/..." or full URL
  quote?: string;
  month?: string;
  year?: string;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

function resolveImage(src?: string) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const root = apiBase.replace('/api', '');
  return `${root}/${src.replace(/^\/+/, '')}`;
}

export default function TeacherOfMonthPage() {
  const { showNotification } = useNotification();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    baseOffsetX: number;
    baseOffsetY: number;
  }>({ dragging: false, startX: 0, startY: 0, baseOffsetX: 0, baseOffsetY: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<TeacherOfMonth>({
    name: '',
    title: '',
    imageUrl: '',
    quote: '',
    month: '',
    year: '',
    imageOffsetX: 0,
    imageOffsetY: 0,
  });

  useEffect(() => {
    apiClient<TeacherOfMonth>('/system/teacher-of-month')
      .then((data) => setForm(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const previewSrc = useMemo(() => resolveImage(form.imageUrl), [form.imageUrl]);

  const handleDownloadPdf = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const url = `${apiBase}/system/teacher-of-month/pdf`;

    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('sasms_token');

    fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to download PDF (${res.status})`);
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'teacher-of-month.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => {
        showNotification(err.message || 'Failed to download PDF.', 'error');
      });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiClient<{ path: string }>('/system/teacher-of-month/upload', {
        method: 'POST',
        body: fd,
      });
      setForm((p) => ({ ...p, imageUrl: res.path }));
      showNotification('Image uploaded successfully.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to upload image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      showNotification('Name is required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const saved = await apiClient<TeacherOfMonth>('/system/teacher-of-month', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(saved);
      showNotification('Teacher of the Month updated successfully.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to save teacher of the month.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeader
        title="Teacher of the Month"
        description="This controls the public homepage spotlight card."
        action={
          <Button variant="outlined" onClick={handleDownloadPdf}>
            Download PDF
          </Button>
        }
      />

      <ContentSection title="Template Preview (matches your example)">
        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: 2.5, bgcolor: alpha(GOLD, 0.25), border: `1px solid ${alpha(GOLD, 0.6)}` }} />
              <Typography sx={{ fontWeight: 900, fontSize: 16, color: '#111' }}>
                SASMS
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, color: '#111', fontSize: 14 }}>
              {form.month || 'Month'} {form.year || new Date().getFullYear()}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ fontSize: { xs: 38, md: 52 }, fontWeight: 900, color: '#111', lineHeight: 1 }}>
            Congratulations !
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: alpha('#111', 0.7), mt: 1 }}>
            Teacher of the Month
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4, mt: 4 }}>
            <Box sx={{ position: 'relative', width: 240, height: 240, flex: '0 0 auto' }}>
              <Box sx={{
                position: 'absolute', inset: -10, borderRadius: '50%',
                border: `2px dashed ${alpha(GOLD, 0.8)}`
              }} />
              <Box sx={{
                width: 240, height: 240, borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${alpha(GOLD, 0.7)}`,
                bgcolor: alpha('#000', 0.04),
                cursor: 'grab',
              }}
                onMouseDown={(e) => {
                  dragState.current = {
                    dragging: true,
                    startX: e.clientX,
                    startY: e.clientY,
                    baseOffsetX: form.imageOffsetX ?? 0,
                    baseOffsetY: form.imageOffsetY ?? 0,
                  };
                }}
                onMouseMove={(e) => {
                  if (!dragState.current.dragging) return;
                  const dx = e.clientX - dragState.current.startX;
                  const dy = e.clientY - dragState.current.startY;
                  setForm((p) => ({
                    ...p,
                    imageOffsetX: dragState.current.baseOffsetX + dx / 4,
                    imageOffsetY: dragState.current.baseOffsetY + dy / 4,
                  }));
                }}
                onMouseUp={() => {
                  dragState.current.dragging = false;
                }}
                onMouseLeave={() => {
                  dragState.current.dragging = false;
                }}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  dragState.current = {
                    dragging: true,
                    startX: touch.clientX,
                    startY: touch.clientY,
                    baseOffsetX: form.imageOffsetX ?? 0,
                    baseOffsetY: form.imageOffsetY ?? 0,
                  };
                }}
                onTouchMove={(e) => {
                  if (!dragState.current.dragging) return;
                  const touch = e.touches[0];
                  const dx = touch.clientX - dragState.current.startX;
                  const dy = touch.clientY - dragState.current.startY;
                  setForm((p) => ({
                    ...p,
                    imageOffsetX: dragState.current.baseOffsetX + dx / 4,
                    imageOffsetY: dragState.current.baseOffsetY + dy / 4,
                  }));
                }}
                onTouchEnd={() => {
                  dragState.current.dragging = false;
                }}
              >
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt={form.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `translate(${form.imageOffsetX ?? 0}%, ${form.imageOffsetY ?? 0}%)`,
                    }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: alpha('#111', 0.5), fontWeight: 800 }}>
                    Upload photo
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#111' }}>
                {form.name || 'Name'}
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: alpha('#111', 0.75), mt: 0.5 }}>
                {form.title || 'Title / Position'}
              </Typography>
              {form.quote && (
                <Typography sx={{ mt: 2, fontSize: 14, color: alpha('#111', 0.7), lineHeight: 1.8 }}>
                  {form.quote}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </ContentSection>

      <ContentSection title="Edit Content">
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Month"
                value={form.month || ''}
                onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Year"
                value={form.year || ''}
                onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                fullWidth
              />
            </Stack>

            <TextField
              label="Name *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Title / Position"
              value={form.title || ''}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Quote"
              value={form.quote || ''}
              onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />

            <Box>
              <Typography fontWeight={800} sx={{ mb: 1 }}>
                Photo
              </Typography>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || loading}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <TextField
                  label="Or paste Image URL / uploads path"
                  value={form.imageUrl || ''}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  fullWidth
                />
              </Stack>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Adjust image position
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                      Horizontal
                    </Typography>
                    <Slider
                      size="small"
                      value={form.imageOffsetX ?? 0}
                      min={-50}
                      max={50}
                      step={1}
                      onChange={(_, value) =>
                        setForm((p) => ({ ...p, imageOffsetX: Array.isArray(value) ? value[0] : value }))
                      }
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                      Vertical
                    </Typography>
                    <Slider
                      size="small"
                      value={form.imageOffsetY ?? 0}
                      min={-50}
                      max={50}
                      step={1}
                      onChange={(_, value) =>
                        setForm((p) => ({ ...p, imageOffsetY: Array.isArray(value) ? value[0] : value }))
                      }
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
                {saving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </ContentSection>
    </Box>
  );
}

