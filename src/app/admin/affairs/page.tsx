'use client';

import { useEffect, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { getAffairsRecords, updateStudent } from '@/src/lib/api';
import type { StudentAffairsRecord } from '@/src/types/staff.types';
import { useTheme } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AdminAffairsPage() {
    const theme = useTheme();
    const [records, setRecords] = useState<StudentAffairsRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Drawer state
    const [selectedStudent, setSelectedStudent] = useState<StudentAffairsRecord | null>(null);
    const [editForm, setEditForm] = useState({ department: '', status: '', year: '' });

    // Register Modal state
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [newStudentData, setNewStudentData] = useState({
        name: '',
        nationalId: '',
        studentPhone: '',
        parentPhone: '',
        department: 'Software',
        year: 'Junior',
        birthCertUploaded: false,
        middleSchoolCertUploaded: false
    });

    useEffect(() => {
        getAffairsRecords().then((data) => {
            setRecords(data);
            setLoading(false);
        });
    }, []);

    const filteredRecords = useMemo(() => {
        return records.filter(record =>
            record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.studentPhone?.includes(searchQuery) ||
            record.parentPhone?.includes(searchQuery)
        );
    }, [records, searchQuery]);

    const handleOpenEdit = (student: StudentAffairsRecord) => {
        setSelectedStudent(student);
        setEditForm({
            department: student.department,
            status: student.status,
            year: student.year
        });
    };

    const handleSaveChanges = async () => {
        if (!selectedStudent) return;

        try {
            const updated = await updateStudent(selectedStudent.id, {
                status: editForm.status,
                // In a real app we'd need to map these to DB IDs if they aren't already
                // For now assuming the backend handles the mapping or they are strings
            });
            setRecords(prev => prev.map(r => r.id === selectedStudent.id ? { ...r, ...updated } : r));
            setSelectedStudent(null);
        } catch (err) {
            console.error('Failed to update student:', err);
        }
    };

    const handleRegisterStudent = () => {
        if (!newStudentData.name || !newStudentData.department || !newStudentData.year) return;

        // Generate ID like: J2024001, S2024002
        const yearInitial = newStudentData.year.charAt(0);
        const newId = `${yearInitial}24${String(records.length + 1).padStart(3, '0')}`;

        const newRecord: StudentAffairsRecord = {
            id: newId,
            name: newStudentData.name,
            nationalId: newStudentData.nationalId,
            studentPhone: newStudentData.studentPhone,
            parentPhone: newStudentData.parentPhone,
            department: newStudentData.department as 'Software' | 'OM',
            year: newStudentData.year as 'Junior' | 'Senior' | 'Wheeler',
            attendanceRate: 100,
            status: 'Active',
            birthCertUploaded: newStudentData.birthCertUploaded,
            middleSchoolCertUploaded: newStudentData.middleSchoolCertUploaded
        };

        setRecords([newRecord, ...records]);
        setRegisterModalOpen(false);
        setNewStudentData({
            name: '', nationalId: '', studentPhone: '', parentPhone: '',
            department: 'Software', year: 'Junior',
            birthCertUploaded: false, middleSchoolCertUploaded: false
        });
    };

    const handleSimulateUpload = (field: 'birthCertUploaded' | 'middleSchoolCertUploaded') => {
        setNewStudentData(prev => ({ ...prev, [field]: true }));
    };

    const columns: Column<any>[] = [
        { id: 'name', label: 'Name' },
        { id: 'studentId', label: 'Student ID' },
        { id: 'year', label: 'Year' },
        { id: 'department', label: 'Department' },
        {
            id: 'attendancePercentage',
            label: 'Attendance %',
            render: (row) => (
                <Typography
                    variant="body2"
                    color={(row.attendancePercentage || 0) < 75 ? 'error.main' : 'text.primary'}
                    fontWeight={(row.attendancePercentage || 0) < 75 ? 600 : 400}
                >
                    {row.attendancePercentage || 0}%
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <Typography variant="caption" sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: row.status === 'ACTIVE' || row.status === 'Active' ? 'success.main' : row.status === 'SUSPENDED' || row.status === 'Suspended' ? 'error.main' : 'info.main',
                    color: '#fff',
                }}>
                    {row.status}
                </Typography>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenEdit(row)}
                >
                    Manage Profile
                </Button>
            )
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PageHeader
                title="Student Affairs & Records"
                description="Manage enrolled students, update statuses, transfer departments, and monitor attendance"
            />

            <ContentSection title="Enrolled Students Roster">
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: { sm: 300 } }}
                    />
                    <Button variant="contained" onClick={() => setRegisterModalOpen(true)}>
                        Register New Student
                    </Button>
                </Box>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataTable
                        columns={columns}
                        rows={filteredRecords}
                        emptyMessage="No students found matching the criteria."
                    />
                )}
            </ContentSection>

            {/* Profile Management Drawer */}
            <Drawer
                anchor="right"
                open={Boolean(selectedStudent)}
                onClose={() => setSelectedStudent(null)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 }, p: 3 }
                }}
            >
                {selectedStudent && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>Student Profile</Typography>
                            <IconButton onClick={() => setSelectedStudent(null)} edge="end"><CloseIcon /></IconButton>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography variant="overline" color="text.secondary">Identity Details</Typography>
                                <Typography variant="body1" fontWeight={500}>{selectedStudent.name}</Typography>
                                <Typography variant="body2" color="text.secondary">ID: {selectedStudent.studentId}</Typography>
                                <Typography variant="body2" color="text.secondary">Email: {selectedStudent.email}</Typography>
                                <Typography variant="body2" color="text.secondary">Phone: {selectedStudent.phoneNumber || 'N/A'}</Typography>
                            </Box>

                            <FormControl fullWidth size="small">
                                <InputLabel>Academic Year</InputLabel>
                                <Select
                                    value={editForm.year}
                                    label="Academic Year"
                                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                >
                                    <MenuItem value="Junior">Junior</MenuItem>
                                    <MenuItem value="Senior">Senior</MenuItem>
                                    <MenuItem value="Wheeler">Wheeler</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={editForm.department}
                                    label="Department"
                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                >
                                    <MenuItem value="Software">Software</MenuItem>
                                    <MenuItem value="OM">Operation & Maintenance (OM)</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Academic Status</InputLabel>
                                <Select
                                    value={editForm.status}
                                    label="Academic Status"
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Suspended">Suspended</MenuItem>
                                    <MenuItem value="Transferred">Transferred</MenuItem>
                                    <MenuItem value="Graduated">Graduated</MenuItem>
                                </Select>
                            </FormControl>

                            <Box>
                                <Typography variant="overline" color="text.secondary">Attendance Overview</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                    <Typography variant="body2">Current Rate:</Typography>
                                    <Typography variant="h6" color={(selectedStudent.attendancePercentage || 0) < 75 ? 'error.main' : 'success.main'}>
                                        {selectedStudent.attendancePercentage || 0}%
                                    </Typography>
                                </Box>
                                <Button variant="text" size="small" sx={{ mt: 1 }}>View Detailed Log</Button>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Button fullWidth variant="outlined" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                            <Button fullWidth variant="contained" onClick={handleSaveChanges}>Save Changes</Button>
                        </Box>
                    </Box>
                )}
            </Drawer>

            {/* Register New Student Modal */}
            <Modal
                open={registerModalOpen}
                onClose={() => setRegisterModalOpen(false)}
                aria-labelledby="register-student-title"
            >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: '80%', md: 700 },
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        p: 4,
                        borderRadius: 3,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography id="register-student-title" variant="h6" fontWeight={600}>
                            Register New Student
                        </Typography>
                        <IconButton onClick={() => setRegisterModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Personal Information</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Full Name"
                                value={newStudentData.name}
                                onChange={(e) => setNewStudentData(prev => ({ ...prev, name: e.target.value }))}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="National ID (الرقم القومي)"
                                value={newStudentData.nationalId}
                                onChange={(e) => setNewStudentData(prev => ({ ...prev, nationalId: e.target.value }))}
                                fullWidth size="small"
                                inputProps={{ maxLength: 14 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Student Phone Number"
                                value={newStudentData.studentPhone}
                                onChange={(e) => setNewStudentData(prev => ({ ...prev, studentPhone: e.target.value }))}
                                fullWidth size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Parent Phone Number"
                                value={newStudentData.parentPhone}
                                onChange={(e) => setNewStudentData(prev => ({ ...prev, parentPhone: e.target.value }))}
                                fullWidth size="small"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Academic Enrollment</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Academic Year</InputLabel>
                                <Select
                                    value={newStudentData.year}
                                    label="Academic Year"
                                    onChange={(e) => setNewStudentData(prev => ({ ...prev, year: e.target.value }))}
                                >
                                    <MenuItem value="Junior">Junior</MenuItem>
                                    <MenuItem value="Senior">Senior</MenuItem>
                                    <MenuItem value="Wheeler">Wheeler</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Program / Department</InputLabel>
                                <Select
                                    value={newStudentData.department}
                                    label="Program / Department"
                                    onChange={(e) => setNewStudentData(prev => ({ ...prev, department: e.target.value }))}
                                >
                                    <MenuItem value="Software">Software</MenuItem>
                                    <MenuItem value="OM">Operation & Maintenance (OM)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Required Documents</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Button
                                variant={newStudentData.birthCertUploaded ? "contained" : "outlined"}
                                color={newStudentData.birthCertUploaded ? "success" : "primary"}
                                fullWidth
                                startIcon={newStudentData.birthCertUploaded ? <CheckCircleIcon /> : <UploadFileIcon />}
                                onClick={() => handleSimulateUpload('birthCertUploaded')}
                            >
                                {newStudentData.birthCertUploaded ? "Birth Certificate Uploaded" : "Upload Birth Certificate"}
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Button
                                variant={newStudentData.middleSchoolCertUploaded ? "contained" : "outlined"}
                                color={newStudentData.middleSchoolCertUploaded ? "success" : "primary"}
                                fullWidth
                                startIcon={newStudentData.middleSchoolCertUploaded ? <CheckCircleIcon /> : <UploadFileIcon />}
                                onClick={() => handleSimulateUpload('middleSchoolCertUploaded')}
                            >
                                {newStudentData.middleSchoolCertUploaded ? "Middle School Cert. Uploaded" : "Upload Middle School Cert. (الشهادة الاعدادية)"}
                            </Button>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, mt: 5, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => setRegisterModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRegisterStudent}
                            disabled={!newStudentData.name || !newStudentData.nationalId || !newStudentData.birthCertUploaded || !newStudentData.middleSchoolCertUploaded}
                        >
                            Finalize Registration
                        </Button>
                    </Box>
                </Paper>
            </Modal>
        </Box>
    );
}






