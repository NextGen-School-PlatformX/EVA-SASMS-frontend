'use client';

import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, Paper, Divider,
    IconButton, CircularProgress, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Breadcrumbs, Link, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClassIcon from '@mui/icons-material/Class';
import GroupIcon from '@mui/icons-material/Group';

import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import {
    getAcademicYears, createAcademicYear, deleteAcademicYear,
    getDepartmentsByYear, createDepartment, deleteDepartment,
    getClassesByDepartment, createClass, deleteClass,
    AcademicYear, Department, AcademicClass
} from '@/src/lib/api/academicApi';

export default function AcademicHierarchyPage() {
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [classes, setClasses] = useState<AcademicClass[]>([]);

    const [loading, setLoading] = useState({ years: true, depts: false, classes: false });
    const [selection, setSelection] = useState<{ year?: AcademicYear; dept?: Department }>({});

    const [modal, setModal] = useState<{ open: boolean; type: 'YEAR' | 'DEPT' | 'CLASS', name: string }>({
        open: false, type: 'YEAR', name: ''
    });

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        setLoading(prev => ({ ...prev, years: true }));
        try {
            const data = await getAcademicYears();
            setYears(data);
        } catch (error) {
            console.error('Error fetching years:', error);
        } finally {
            setLoading(prev => ({ ...prev, years: false }));
        }
    };

    const fetchDepartments = async (yearId: string) => {
        setLoading(prev => ({ ...prev, depts: true }));
        try {
            const data = await getDepartmentsByYear(yearId);
            setDepartments(data);
            setClasses([]);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(prev => ({ ...prev, depts: false }));
        }
    };

    const fetchClasses = async (deptId: string) => {
        setLoading(prev => ({ ...prev, classes: true }));
        try {
            const data = await getClassesByDepartment(deptId);
            setClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(prev => ({ ...prev, classes: false }));
        }
    };

    const handleSelectYear = (year: AcademicYear) => {
        setSelection({ year });
        fetchDepartments(year.id);
    };

    const handleSelectDept = (dept: Department) => {
        setSelection(prev => ({ ...prev, dept }));
        fetchClasses(dept.id);
    };

    const handleCreate = async () => {
        try {
            if (modal.type === 'YEAR') {
                await createAcademicYear(modal.name);
                fetchYears();
            } else if (modal.type === 'DEPT' && selection.year) {
                await createDepartment(selection.year.id, { name: modal.name });
                fetchDepartments(selection.year.id);
            } else if (modal.type === 'CLASS' && selection.dept) {
                await createClass(selection.dept.id, modal.name);
                fetchClasses(selection.dept.id);
            }
            setModal({ ...modal, open: false, name: '' });
        } catch (error) {
            console.error('Error creating academic entity:', error);
        }
    };

    const handleDelete = async (id: string, type: 'YEAR' | 'DEPT' | 'CLASS') => {
        if (!window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}? This will affect all relative data.`)) return;
        try {
            if (type === 'YEAR') {
                await deleteAcademicYear(id);
                fetchYears();
                setSelection({});
            } else if (type === 'DEPT') {
                await deleteDepartment(id);
                if (selection.year) fetchDepartments(selection.year.id);
                setSelection(prev => ({ year: prev.year }));
            } else if (type === 'CLASS') {
                await deleteClass(id);
                if (selection.dept) fetchClasses(selection.dept.id);
            }
        } catch (error) {
            console.error('Error deleting academic entity:', error);
        }
    };

    return (
        <Box>
            <PageHeader
                title="Academic Hierarchy"
                description="Manage the structure of Academic Years, Departments, and Classes"
            />

            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => { setSelection({}); setDepartments([]); setClasses([]); }}>
                        <Typography fontWeight={600}>All Years</Typography>
                    </Link>
                    {selection.year && (
                        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => { setSelection({ year: selection.year }); setClasses([]); }}>
                            {selection.year.name}
                        </Link>
                    )}
                    {selection.dept && (
                        <Typography color="text.primary">{selection.dept.name}</Typography>
                    )}
                </Breadcrumbs>
            </Paper>

            <Grid container spacing={3}>
                {/* Years Column */}
                {!selection.year && (
                    <Grid size={{ xs: 12 }}>
                        <ContentSection
                            title="Academic Years"
                            action={<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setModal({ open: true, type: 'YEAR', name: '' })}>Add Year</Button>}
                        >
                            {loading.years ? <CircularProgress /> : (
                                <Grid container spacing={2}>
                                    {years.map(year => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={year.id}>
                                            <Card onClick={() => handleSelectYear(year)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <CalendarTodayIcon color="primary" />
                                                            <Typography variant="h6">{year.name}</Typography>
                                                        </Box>
                                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(year.id, 'YEAR'); }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                        {year._count?.departments || 0} Departments · {year._count?.users || 0} Students
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </ContentSection>
                    </Grid>
                )}

                {/* Departments Column */}
                {selection.year && !selection.dept && (
                    <Grid size={{ xs: 12 }}>
                        <ContentSection
                            title={`Departments in ${selection.year.name}`}
                            action={<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setModal({ open: true, type: 'DEPT', name: '' })}>Add Department</Button>}
                        >
                            {loading.depts ? <CircularProgress /> : (
                                <Grid container spacing={2}>
                                    {departments.length === 0 && <Typography sx={{ m: 2, fontStyle: 'italic' }}>No departments found for this year.</Typography>}
                                    {departments.map(dept => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
                                            <Card onClick={() => handleSelectDept(dept)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <BusinessIcon color="primary" />
                                                            <Typography variant="h6">{dept.name}</Typography>
                                                        </Box>
                                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(dept.id, 'DEPT'); }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                        {dept._count?.classes || 0} Classes · {dept._count?.users || 0} Students
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </ContentSection>
                    </Grid>
                )}

                {/* Classes Column */}
                {selection.dept && (
                    <Grid size={{ xs: 12 }}>
                        <ContentSection
                            title={`Classes in ${selection.dept.name}`}
                            action={<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setModal({ open: true, type: 'CLASS', name: '' })}>Add Class</Button>}
                        >
                            {loading.classes ? <CircularProgress /> : (
                                <Grid container spacing={2}>
                                    {classes.length === 0 && <Typography sx={{ m: 2, fontStyle: 'italic' }}>No classes found for this department.</Typography>}
                                    {classes.map(cls => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cls.id}>
                                            <Card>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <ClassIcon color="primary" />
                                                            <Typography variant="h6">{cls.name}</Typography>
                                                        </Box>
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(cls.id, 'CLASS')}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                                                        <GroupIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {cls._count?.users || 0} Students Enrolled
                                                        </Typography>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </ContentSection>
                    </Grid>
                )}
            </Grid>

            {/* Creation Modal */}
            <Dialog open={modal.open} onClose={() => setModal({ ...modal, open: false })} fullWidth maxWidth="xs">
                <DialogTitle>Add New {modal.type === 'DEPT' ? 'Department' : modal.type === 'CLASS' ? 'Class' : 'Academic Year'}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Name"
                        value={modal.name}
                        onChange={(e) => setModal({ ...modal, name: e.target.value })}
                        variant="outlined"
                        autoFocus
                        placeholder={modal.type === 'YEAR' ? 'e.g., 2024-2025' : modal.type === 'DEPT' ? 'e.g., Computer Science' : 'e.g., Year 1 - Sec A'}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModal({ ...modal, open: false })}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!modal.name.trim()}>Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
