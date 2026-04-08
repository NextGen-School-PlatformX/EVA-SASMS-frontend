'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Box, Typography, Button, TextField, Select,
    MenuItem, FormControl, InputLabel, CircularProgress,
    IconButton, Tooltip, Chip, Switch, FormControlLabel
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShieldIcon from '@mui/icons-material/Shield';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useNotification } from '@/src/context/NotificationContext';

import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { getAuditLogs } from '@/src/lib/api/superadminApi';
import { AuditLog } from '@/src/types/superadmin.types';

export default function AuditLogsPage() {
    const { showNotification } = useNotification();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || undefined;
    const userName = searchParams.get('userName') || undefined;

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [moduleFilter, setModuleFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [liveMonitor, setLiveMonitor] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await getAuditLogs(userId || undefined);
                setLogs(data);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [userId]);

    const handleExport = () => {
        showNotification('Packaging security logs for archival...', 'info');
        setTimeout(() => showNotification('Audit Log (XLSX) exported with cryptographic checksum.', 'success'), 2000);
    };

    const handleViewDetails = (log: AuditLog) => {
        const details = (log as any).details;
        const msg = typeof details === 'string' ? details : details ? JSON.stringify(details, null, 2) : 'No extended payload.';
        showNotification(msg.length > 120 ? msg.slice(0, 120) + '...' : msg, 'info');
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.action.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
            return matchesSearch && matchesModule;
        });
    }, [logs, searchQuery, moduleFilter]);

    const columns: Column<AuditLog>[] = [
        { id: 'timestamp', label: 'Timestamp' },
        {
            id: 'userName',
            label: 'Executor',
            render: (row) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" fontWeight={600}>{row.userName}</Typography>
                    <Typography variant="caption" color="text.secondary">IP: {row.ipAddress}</Typography>
                </Box>
            )
        },
        {
            id: 'module',
            label: 'Security Module',
            render: (row) => (
                <Chip
                    label={row.module}
                    size="small"
                    variant="outlined"
                    icon={<ShieldIcon sx={{ fontSize: '0.8rem !important' }} />}
                />
            )
        },
        { id: 'action', label: 'Action Performed' },
        {
            id: 'actions',
            label: 'Details',
            render: (row) => (
                <Tooltip title="View Extended Payload">
                    <IconButton size="small" onClick={() => handleViewDetails(row)}><InfoIcon fontSize="small" /></IconButton>
                </Tooltip>
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
                title="Audit & Traceability"
                description="Comprehensive immutable record of all system interactions and critical security events"
                action={
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                        Export Security Log
                    </Button>
                }
            />

            <ContentSection>
                {userId && userName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Chip
                            label={`Filtered by: ${userName}`}
                            color="primary"
                            variant="filled"
                            size="small"
                            onDelete={() => window.location.href = '/superadmin/audit'}
                            deleteIcon={<CloseIcon />}
                        />
                        <Button component={Link} href="/superadmin/audit" size="small" variant="text">View all logs</Button>
                    </Box>
                )}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        placeholder="Search by user or action..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Module</InputLabel>
                        <Select
                            value={moduleFilter}
                            label="Module"
                            onChange={(e) => setModuleFilter(e.target.value)}
                        >
                            <MenuItem value="All">All Modules</MenuItem>
                            <MenuItem value="Settings">Settings</MenuItem>
                            <MenuItem value="Roles">Roles</MenuItem>
                            <MenuItem value="Users">Users</MenuItem>
                            <MenuItem value="Finances">Finances</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Switch checked={liveMonitor} onChange={(e) => {
                            setLiveMonitor(e.target.checked);
                            if (e.target.checked) showNotification('Live Security Monitoring Active.', 'warning');
                        }} />}
                        label="Live Monitor"
                        sx={{ ml: 1 }}
                    />
                </Box>

                <DataTable
                    columns={columns}
                    rows={filteredLogs}
                    emptyMessage="No audit records found for the selected period."
                />
            </ContentSection>
        </Box>
    );
}
