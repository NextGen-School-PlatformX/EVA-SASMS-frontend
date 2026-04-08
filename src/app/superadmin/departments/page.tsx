'use client';

import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, Paper, Divider,
    Chip, IconButton, CircularProgress, LinearProgress,
    Tooltip, Card, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useNotification } from '@/src/context/NotificationContext';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { getSystemDepartments, createDepartment, deleteDepartment, updateDepartment } from '@/src/lib/api/superadminApi';
import { SystemDepartment } from '@/src/types/superadmin.types';

export default function DepartmentManagementPage() {
    const { showNotification } = useNotification();
    const router = useRouter();
    const [departments, setDepartments] = useState<SystemDepartment[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [headModalOpen, setHeadModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [bulkTransferOpen, setBulkTransferOpen] = useState(false);
    const [reassignStaffOpen, setReassignStaffOpen] = useState(false);
    const [dataOverrideOpen, setDataOverrideOpen] = useState(false);

    const [selectedDept, setSelectedDept] = useState<SystemDepartment | null>(null);
    const [newDept, setNewDept] = useState({ name: '', headName: '' });
    const [editDeptParams, setEditDeptParams] = useState({ name: '', headName: '' });

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const data = await getSystemDepartments();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

    const handleDeleteDept = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the ${name} department? This action is irreversible.`)) {
            try {
                await deleteDepartment(id);
                setDepartments(prev => prev.filter(d => d.id !== id));
                showNotification(`${name} department has been deleted.`, 'success');
            } catch (error) {
                showNotification('Failed to delete department.', 'error');
            }
        }
    };

    const handleAssignHead = () => {
        if (selectedDept && newDept.headName) {
            setDepartments(prev => prev.map(d =>
                d.id === selectedDept.id ? { ...d, headName: newDept.headName } : d
            ));
            showNotification(`Head of ${selectedDept.name} updated to ${newDept.headName}.`, 'success');
            setHeadModalOpen(false);
            setNewDept({ ...newDept, headName: '' });
        }
    };

    const handleCreateDept = async () => {
        if (newDept.name) {
            try {
                const created = await createDepartment({
                    name: newDept.name,
                    description: 'Administrative department created by SuperAdmin.',
                    icon: 'Business'
                });
                setDepartments(prev => [...prev, created as unknown as SystemDepartment]);
                showNotification(`${newDept.name} department created successfully.`, 'success');
                setCreateModalOpen(false);
                setNewDept({ name: '', headName: '' });
            } catch (error) {
                showNotification('Failed to create department.', 'error');
            }
        }
    };

    const handleEditDept = async () => {
        if (selectedDept && editDeptParams.name) {
            try {
                await updateDepartment(selectedDept.id, {
                    name: editDeptParams.name,
                    headId: editDeptParams.headName // Mock relation update string
                });
                setDepartments(prev => prev.map(d =>
                    d.id === selectedDept.id ? { ...d, name: editDeptParams.name, headName: editDeptParams.headName } : d
                ));
                showNotification(`Department ${editDeptParams.name} updated.`, 'success');
                setEditModalOpen(false);
            } catch (error) {
                showNotification('Failed to update department.', 'error');
            }
        }
    };

    const handleBulkAction = (actionName: string, setter: (val: boolean) => void) => {
        // Mocks a global system action execution
        showNotification(`${actionName} processing started. Tracking via Audit Log.`, 'info');
        setTimeout(() => {
            showNotification(`${actionName} completed successfully.`, 'success');
            setter(false);
        }, 1500);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Healthy': return 'success';
            case 'Warning': return 'warning';
            case 'Deficit': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader
                title="Departmental Governance"
                description="Oversee department performance, manage leadership, and authorize cross-department resource transfers"
                action={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)}>
                        New Department
                    </Button>
                }
            />

            <Grid container spacing={3}>
                {departments.map((dept) => (
                    <Grid size={{ xs: 12, md: 6 }} key={dept.id}>
                        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', color: 'white' }}>
                                            <BusinessIcon />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>{dept.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">ID: {dept.id}</Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={dept.financialStatus}
                                        size="small"
                                        color={getStatusColor(dept.financialStatus)}
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <SupervisorAccountIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        Head: <strong>{dept.headName || 'Unassigned'}</strong>
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="text"
                                        sx={{ textTransform: 'none', ml: 'auto' }}
                                        onClick={() => {
                                            setSelectedDept(dept);
                                            setHeadModalOpen(true);
                                        }}
                                    >
                                        Change
                                    </Button>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Students</Typography>
                                        <Typography variant="h6" fontWeight={600}>{dept.studentCount}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Staff</Typography>
                                        <Typography variant="h6" fontWeight={600}>{dept.staffCount}</Typography>
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" fontWeight={600}>Attendance Rate</Typography>
                                        <Typography variant="caption" fontWeight={600}>{dept.attendanceRate}%</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={dept.attendanceRate}
                                        color={dept.attendanceRate > 85 ? 'success' : 'warning'}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </Box>
                            </CardContent>
                            <CardActions sx={{ px: 3, pb: 2, justifyContent: 'flex-end', gap: 1 }}>
                                <Tooltip title="Departmental Data Override">
                                    <IconButton size="small" onClick={() => { setSelectedDept(dept); setDataOverrideOpen(true); }}><SwapHorizIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="View Full Report">
                                    <IconButton size="small" color="primary" onClick={() => router.push('/superadmin/reports')}><AssessmentIcon /></IconButton>
                                </Tooltip>
                                <IconButton size="small" onClick={() => {
                                    setSelectedDept(dept);
                                    setEditDeptParams({ name: dept.name, headName: dept.headName || '' });
                                    setEditModalOpen(true);
                                }}><EditIcon /></IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteDept(dept.id, dept.name)}><DeleteIcon /></IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Cross-Department Resource Management Section */}
            <ContentSection title="Global Resource Override" sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Perform administrative overrides for student transfers and staff reassignments across the entire system.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<SwapHorizIcon />} onClick={() => setBulkTransferOpen(true)}>Bulk Transfer Students</Button>
                    <Button variant="outlined" startIcon={<SupervisorAccountIcon />} onClick={() => setReassignStaffOpen(true)}>Reassign Staff Leaders</Button>
                </Box>
            </ContentSection>

            {/* Create Modal */}
            <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>New Department Profile</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Department Name"
                            variant="outlined"
                            value={newDept.name}
                            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Selection Initial Head</InputLabel>
                            <Select
                                label="Selection Initial Head"
                                value={newDept.headName}
                                onChange={(e) => setNewDept({ ...newDept, headName: e.target.value })}
                            >
                                <MenuItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</MenuItem>
                                <MenuItem value="Prof. Michael Chen">Prof. Michael Chen</MenuItem>
                                <MenuItem value="Dr. Elena Rodriguez">Dr. Elena Rodriguez</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateDept}>Create Department</Button>
                </DialogActions>
            </Dialog>

            {/* Assign Head Modal */}
            <Dialog open={headModalOpen} onClose={() => setHeadModalOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Assign Department Leadership</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Reassigning leadership for <strong>{selectedDept?.name}</strong>. The previous head will be moved to senior staff status.
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Choose New Head</InputLabel>
                            <Select
                                label="Choose New Head"
                                value={newDept.headName}
                                onChange={(e) => setNewDept({ ...newDept, headName: e.target.value })}
                            >
                                <MenuItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</MenuItem>
                                <MenuItem value="Prof. Michael Chen">Prof. Michael Chen</MenuItem>
                                <MenuItem value="Dr. Elena Rodriguez">Dr. Elena Rodriguez</MenuItem>
                                <MenuItem value="Dr. James Wilson">Dr. James Wilson</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setHeadModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssignHead}>Confirm Assignment</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Department Modal */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Edit Department Details</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Department Name"
                            variant="outlined"
                            value={editDeptParams.name}
                            onChange={(e) => setEditDeptParams({ ...editDeptParams, name: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Update Department Head</InputLabel>
                            <Select
                                label="Update Department Head"
                                value={editDeptParams.headName}
                                onChange={(e) => setEditDeptParams({ ...editDeptParams, headName: e.target.value })}
                            >
                                <MenuItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</MenuItem>
                                <MenuItem value="Prof. Michael Chen">Prof. Michael Chen</MenuItem>
                                <MenuItem value="Dr. Elena Rodriguez">Dr. Elena Rodriguez</MenuItem>
                                <MenuItem value="Dr. James Wilson">Dr. James Wilson</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditDept}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Data Override Modal */}
            <Dialog open={dataOverrideOpen} onClose={() => setDataOverrideOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Force System Data Override: {selectedDept?.name}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
                        WARNING: Direct data manipulation bypasses standard workflows and will be permanently recorded in the immutable audit log under your ID.
                    </Typography>
                    <TextField fullWidth multiline rows={3} label="Justification / Override Parameters (JSON format expected)" placeholder='{ "attendanceRateOverride": 95 }' />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDataOverrideOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('Data Override', setDataOverrideOpen)}>Execute Override</Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Transfer Modal */}
            <Dialog open={bulkTransferOpen} onClose={() => setBulkTransferOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Bulk Student Transfer Tool</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select a CSV file containing Student IDs and destination Department IDs to process bulk transfers.
                    </Typography>
                    <Button variant="outlined" component="label">
                        Upload CSV
                        <input type="file" hidden accept=".csv" />
                    </Button>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setBulkTransferOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => handleBulkAction('Bulk Transfer', setBulkTransferOpen)}>Process Transfers</Button>
                </DialogActions>
            </Dialog>

            {/* Reassign Staff Modal */}
            <Dialog open={reassignStaffOpen} onClose={() => setReassignStaffOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Global Staff Reassignment</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Use this matrix to re-route staff assignments across facilities instantly.
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Staff Group</InputLabel>
                        <Select label="Select Staff Group" defaultValue="academic">
                            <MenuItem value="academic">Academic Faculty</MenuItem>
                            <MenuItem value="admin">Administrative Officers</MenuItem>
                            <MenuItem value="support">Technical Support</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setReassignStaffOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => handleBulkAction('Staff Reassignment', setReassignStaffOpen)}>Initialize Reassignment</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
