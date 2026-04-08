'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Chip, Grid,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Divider, Switch, FormControlLabel, Tooltip, CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import { useNotification } from '@/src/context/NotificationContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { apiClient } from '@/src/lib/api/client';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: '📝', color: '#3b82f6' },
  { value: 'textarea', label: 'Long Text', icon: '📄', color: '#6366f1' },
  { value: 'phone', label: 'Phone Number', icon: '📱', color: '#10b981' },
  { value: 'email', label: 'Email', icon: '📧', color: '#f59e0b' },
  { value: 'number', label: 'Number', icon: '#️⃣', color: '#8b5cf6' },
  { value: 'date', label: 'Date', icon: '📅', color: '#ec4899' },
  { value: 'link', label: 'URL / Link', icon: '🔗', color: '#0ea5e9' },
  { value: 'select', label: 'Dropdown', icon: '🔽', color: '#14b8a6' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️', color: '#64748b' },
  { value: 'file', label: 'File Upload', icon: '📎', color: '#0ea5e9' },
];

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  visibleToAdmin: boolean;
  order: number;
}

const DEFAULT_FIELDS: FormField[] = [
  { id: 'def-name', label: 'Full Name', type: 'text', required: true, visibleToAdmin: true, order: 0 },
  { id: 'def-email', label: 'Email Address', type: 'email', required: true, visibleToAdmin: true, order: 1 },
  { id: 'def-phone', label: 'Phone Number', type: 'phone', required: true, visibleToAdmin: true, order: 2 },
  { id: 'def-dob', label: 'Date of Birth', type: 'date', required: true, visibleToAdmin: true, order: 3 },
  { id: 'def-natid', label: 'National ID', type: 'text', required: true, visibleToAdmin: true, order: 4 },
  { id: 'def-dept', label: 'Preferred Department', type: 'select', required: true, visibleToAdmin: true, order: 5 },
];

export default function AdmissionFormFieldsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { showNotification } = useNotification();
  const [customFields, setCustomFields] = useState<FormField[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newField, setNewField] = useState<Partial<FormField>>({
    label: '', type: 'text', required: false, placeholder: '', visibleToAdmin: true, options: []
  });
  const [optionInput, setOptionInput] = useState('');

  // Load from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const fields = await apiClient<FormField[]>('/system/form-fields');
        setCustomFields(fields || []);
      } catch {
        setCustomFields([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient('/system/form-fields', { method: 'POST', body: JSON.stringify(customFields) });
      showNotification('Form fields saved successfully! ✅ Applicants will see the updated form.', 'success');
    } catch {
      showNotification('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.label) return;
    const field: FormField = {
      id: `custom-${Date.now()}`,
      label: newField.label!,
      type: newField.type || 'text',
      required: newField.required || false,
      placeholder: newField.placeholder,
      options: newField.options,
      visibleToAdmin: newField.visibleToAdmin !== false,
      order: customFields.length + DEFAULT_FIELDS.length,
    };
    const updated = [...customFields, field];
    setCustomFields(updated);
    // Auto-save when adding
    try {
      await apiClient('/system/form-fields', { method: 'POST', body: JSON.stringify(updated) });
      showNotification(`Field "${field.label}" added and saved!`, 'success');
    } catch {
      showNotification(`Field "${field.label}" added (save manually to persist).`, 'info');
    }
    setAddOpen(false);
    setNewField({ label: '', type: 'text', required: false, placeholder: '', visibleToAdmin: true, options: [] });
    setOptionInput('');
  };

  const handleDelete = async (id: string) => {
    const updated = customFields.filter(f => f.id !== id);
    setCustomFields(updated);
    try {
      await apiClient('/system/form-fields', { method: 'POST', body: JSON.stringify(updated) });
      showNotification('Field removed.', 'info');
    } catch {
      showNotification('Field removed locally (save to persist).', 'warning');
    }
  };

  const handleToggleRequired = (id: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const handleToggleAdmin = (id: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, visibleToAdmin: !f.visibleToAdmin } : f));
  };

  const accent = '#6366f1';
  const allFields = [...DEFAULT_FIELDS, ...customFields];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeader
        title="Admission Form Builder"
        description="Customize the fields shown to applicants during the admission process"
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" startIcon={<PreviewIcon />} onClick={() => setPreviewOpen(true)} sx={{ borderRadius: 2 }}>Preview Form</Button>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={handleSave} disabled={saving} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent }}>Save Changes</Button>
          </Box>
        }
      />

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        الحقول المخصصة تُحفظ في السيرفر وتظهر فوراً لجميع المتقدمين في نموذج التقديم.
      </Alert>

      <Grid container spacing={3}>
        {/* Default Fields */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: isDark ? alpha('#1e1e3f', 0.7) : '#fff', border: `1px solid ${alpha(accent, 0.15)}` }}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha(accent, 0.1)}` }}>
              <Typography variant="subtitle1" fontWeight={800}>🔒 Default Fields</Typography>
              <Typography variant="caption" color="text.secondary">These fields are always required and cannot be removed</Typography>
            </Box>
            <Stack divider={<Divider />}>
              {DEFAULT_FIELDS.map((field) => {
                const ft = FIELD_TYPES.find(t => t.value === field.type);
                return (
                  <Box key={field.id} sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(ft?.color || '#64748b', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                      {ft?.icon || '📝'}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{field.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{ft?.label || field.type}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <Chip label="Required" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
                      <Chip label="Admin Visible" size="small" sx={{ bgcolor: alpha(accent, 0.1), color: accent, fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Custom Fields */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: isDark ? alpha('#1e1e3f', 0.7) : '#fff', border: `1px solid ${alpha(accent, 0.15)}` }}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha(accent, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>✏️ Custom Fields</Typography>
                <Typography variant="caption" color="text.secondary">Additional fields you've added ({customFields.length} total)</Typography>
              </Box>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent }}>Add Field</Button>
            </Box>
            {customFields.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '2rem', mb: 1 }}>📋</Typography>
                <Typography variant="body2" color="text.secondary">No custom fields yet. Click "Add Field" to create one.</Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />}>
                {customFields.map((field) => {
                  const ft = FIELD_TYPES.find(t => t.value === field.type);
                  return (
                    <Box key={field.id} sx={{ px: 2.5, py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <DragIndicatorIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(ft?.color || '#64748b', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                          {ft?.icon || '📝'}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={700}>{field.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{ft?.label || field.type}{field.placeholder ? ` • "${field.placeholder}"` : ''}</Typography>
                        </Box>
                        <Tooltip title="Delete field">
                          <IconButton size="small" onClick={() => handleDelete(field.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.75, ml: 6.5 }}>
                        <FormControlLabel
                          control={<Switch size="small" checked={field.required} onChange={() => handleToggleRequired(field.id)} />}
                          label={<Typography variant="caption" fontWeight={600}>Required</Typography>}
                          sx={{ m: 0 }}
                        />
                        <FormControlLabel
                          control={<Switch size="small" checked={field.visibleToAdmin} onChange={() => handleToggleAdmin(field.id)} />}
                          label={<Typography variant="caption" fontWeight={600}>Admin Visible</Typography>}
                          sx={{ m: 0 }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Field Modal */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        <DialogTitle fontWeight={800}>Add New Form Field</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <TextField fullWidth label="Field Label *" value={newField.label || ''} onChange={(e) => setNewField(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Guardian Name, City of Birth..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select label="Field Type" value={newField.type || 'text'} onChange={(e) => setNewField(p => ({ ...p, type: e.target.value }))} sx={{ borderRadius: 2 }}>
                {FIELD_TYPES.map(ft => <MenuItem key={ft.value} value={ft.value}>{ft.icon} {ft.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Placeholder Text" value={newField.placeholder || ''} onChange={(e) => setNewField(p => ({ ...p, placeholder: e.target.value }))} placeholder="Hint text shown inside the field..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            {newField.type === 'select' && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Dropdown Options</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" value={optionInput} onChange={(e) => setOptionInput(e.target.value)} placeholder="Add option..." onKeyDown={(e) => { if (e.key === 'Enter' && optionInput) { setNewField(p => ({ ...p, options: [...(p.options || []), optionInput] })); setOptionInput(''); } }} sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <Button variant="outlined" onClick={() => { if (optionInput) { setNewField(p => ({ ...p, options: [...(p.options || []), optionInput] })); setOptionInput(''); } }} sx={{ borderRadius: 2 }}>Add</Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {(newField.options || []).map((opt, i) => <Chip key={i} label={opt} size="small" onDelete={() => setNewField(p => ({ ...p, options: (p.options || []).filter((_, j) => j !== i) }))} sx={{ borderRadius: 1.5 }} />)}
                </Box>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel control={<Switch checked={newField.required || false} onChange={(e) => setNewField(p => ({ ...p, required: e.target.checked }))} />} label={<Typography variant="body2" fontWeight={600}>Required Field</Typography>} />
              <FormControlLabel control={<Switch checked={newField.visibleToAdmin !== false} onChange={(e) => setNewField(p => ({ ...p, visibleToAdmin: e.target.checked }))} />} label={<Typography variant="body2" fontWeight={600}>Visible to Admin</Typography>} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddField} disabled={!newField.label} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent }}>Add Field</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>👁️ Form Preview</DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            This is how the admission form appears to applicants ({allFields.length} fields total)
          </Typography>
          <Stack spacing={2}>
            {allFields.map((field) => {
              return (
                <Box key={field.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={700}>{field.label}</Typography>
                    {field.required && <Chip label="*required" size="small" sx={{ height: 16, fontSize: '0.58rem', bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 700 }} />}
                  </Box>
                  {field.type === 'select' ? (
                    <Box sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', color: 'text.secondary', fontSize: '0.85rem' }}>
                      Select {field.label}... ▾
                    </Box>
                  ) : field.type === 'textarea' ? (
                    <Box sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', height: 64, color: 'text.secondary', fontSize: '0.85rem' }}>
                      {field.placeholder || `Enter ${field.label}...`}
                    </Box>
                  ) : field.type === 'checkbox' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 16, height: 16, border: '1px solid', borderColor: 'divider', borderRadius: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">{field.placeholder || field.label}</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', color: 'text.secondary', fontSize: '0.85rem' }}>
                      {field.placeholder || `Enter ${field.label}...`}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
