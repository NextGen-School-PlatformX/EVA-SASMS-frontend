'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, TextField, Select,
    MenuItem, FormControl, InputLabel, InputAdornment,
    IconButton, Chip, Tooltip, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import HistoryIcon from '@mui/icons-material/History';
import { useNotification } from '@/src/context/NotificationContext';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { getAllUsers, createSystemUser, requestPasswordReset, updateUserStatus, deleteUser } from '@/src/lib/api/superadminApi';
import { SystemUser } from '@/src/types/superadmin.types';

export default function UserManagementPage() {
    const { showNotification } = useNotification();
    const router = useRouter();
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Modal State
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: SystemUser | null }>({ open: false, user: null });
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Admin', department: '', password: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'All' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const handleToggleStatus = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        const newStatus = user?.status === 'Active' ? 'INACTIVE' : 'ACTIVE';
        try {
            await updateUserStatus(userId, newStatus);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, status: newStatus === 'ACTIVE' ? 'Active' : 'Inactive' } : u
            ));
            showNotification(`User account ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`, 'success');
        } catch {
            showNotification('Failed to update user status.', 'error');
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirm.user) return;
        try {
            await deleteUser(deleteConfirm.user.id);
            setUsers(prev => prev.filter(u => u.id !== deleteConfirm.user!.id));
            showNotification(`Account for ${deleteConfirm.user.name} has been permanently deleted.`, 'success');
        } catch (e: any) {
            showNotification(e?.message || 'Failed to delete user.', 'error');
        }
        setDeleteConfirm({ open: false, user: null });
    };

    const handleResetPassword = async (name: string, email: string) => {
        try {
            await requestPasswordReset(email);
            showNotification(`Password reset instructions sent to ${name} (${email}).`, 'success');
        } catch (error) {
            showNotification(`Failed to send password reset for ${name}.`, 'error');
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        try {
            const createdUser = await createSystemUser({
                name: newUser.name,
                email: newUser.email,
                role: newUser.role as any,
                department: newUser.department,
                status: 'Active',
                password: newUser.password || undefined,
            } as any);
            setUsers(prev => [...prev, createdUser]);
            const genPw = (createdUser as any).generatedPassword;
            showNotification(
                `Account for ${newUser.name} created!${genPw ? ` Generated password: ${genPw}` : ''}`,
                'success'
            );
            setCreateModalOpen(false);
            setNewUser({ name: '', email: '', role: 'Admin', department: '', password: '' });
        } catch (error) {
            console.error('Failed to create user:', error);
            showNotification('Failed to create user. Please check credentials.', 'error');
        }
    };

    const columns: Column<SystemUser>[] = [
        {
            id: 'name',
            label: 'System User',
            render: (row) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                </Box>
            )
        },
        {
            id: 'role',
            label: 'Role',
            render: (row) => (
                <Chip
                    label={row.role}
                    size="small"
                    color={row.role === 'SUPER_ADMIN' ? 'secondary' : row.role === 'ADMIN' ? 'primary' : 'default'}
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            id: 'department',
            label: 'Department',
            render: (row) => row.department || <Typography variant="caption" color="text.disabled">N/A (Global)</Typography>
        },
        {
            id: 'status',
            label: 'Account Status',
            render: (row) => <StatusBadge status={row.status.toLowerCase() as any} />
        },
        {
            id: 'lastActive',
            label: 'Last Session'
        },
        {
            id: 'actions',
            label: 'Governance Actions',
            render: (row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={row.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}>
                        <IconButton
                            size="small"
                            color={row.status === 'Active' ? 'error' : 'success'}
                            onClick={() => handleToggleStatus(row.id)}
                        >
                            {row.status === 'Active' ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                        <IconButton size="small" color="primary" onClick={() => handleResetPassword(row.name, row.email)}>
                            <LockResetIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="View Activity Log">
                        <IconButton size="small" color="inherit" onClick={() => router.push(`/superadmin/audit?userId=${encodeURIComponent(row.id)}&userName=${encodeURIComponent(row.name)}`)}>
                            <HistoryIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Account">
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, user: row })} disabled={row.role === 'SUPER_ADMIN'}>
                            <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

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
                title="User & Security Governance"
                description="Manage system access, roles, and monitor user activity across all departments"
                action={
                    <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setCreateModalOpen(true)}>
                        Create User Account
                    </Button>
                }
            />

            <ContentSection>
                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search by name or email..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Filter Role</InputLabel>
                        <Select
                            value={roleFilter}
                            label="Filter Role"
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <MenuItem value="All">All Roles</MenuItem>
                            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="STUDENT">Student</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        startIcon={<FilterListIcon />}
                        variant="outlined"
                        color="inherit"
                        onClick={() => showNotification('Advanced filters modal coming soon!', 'info')}
                    >
                        Advanced Filters
                    </Button>
                </Box>

                <DataTable
                    columns={columns}
                    rows={filteredUsers}
                    emptyMessage="No system users found matching your criteria."
                />
            </ContentSection>

            {/* Create User Modal */}
            <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create New System Account</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                variant="outlined"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                variant="outlined"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Assign Role</InputLabel>
                                <Select
                                    label="Assign Role"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                                    <MenuItem value="Admin">Admin</MenuItem>
                                    <MenuItem value="Student">Student</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Department (Optional)"
                                variant="outlined"
                                value={newUser.department}
                                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Password (leave empty to auto-generate)"
                                variant="outlined"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                helperText="If left empty, a secure password will be auto-generated and shown after creation."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateUser}>Create Account</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, user: null })}>
                <DialogTitle>Permanently Delete Account?</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will permanently delete <strong>{deleteConfirm.user?.name}</strong> ({deleteConfirm.user?.email}).
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, user: null })}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteUser}>Delete Permanently</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
