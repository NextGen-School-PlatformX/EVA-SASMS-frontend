import { apiClient } from './client';

export interface AcademicYear {
    id: string;
    name: string;
    createdAt: string;
    _count?: {
        departments: number;
        users: number;
    }
}

export interface Department {
    id: string;
    name: string;
    yearId: string;
    description?: string;
    icon?: string;
    _count?: {
        classes: number;
        users: number;
    }
}

export interface AcademicClass {
    id: string;
    name: string;
    departmentId: string;
    _count?: {
        users: number;
    }
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
    return apiClient<AcademicYear[]>('/academic/years');
}

export async function createAcademicYear(name: string): Promise<AcademicYear> {
    return apiClient<AcademicYear>('/academic/years', {
        method: 'POST',
        body: JSON.stringify({ name })
    });
}

export async function deleteAcademicYear(id: string): Promise<any> {
    return apiClient(`/academic/years/${id}`, { method: 'DELETE' });
}

export async function getDepartmentsByYear(yearId: string): Promise<Department[]> {
    return apiClient<Department[]>(`/academic/years/${yearId}/departments`);
}

export async function createDepartment(yearId: string, data: { name: string; description?: string; icon?: string }): Promise<Department> {
    return apiClient<Department>(`/academic/years/${yearId}/departments`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function deleteDepartment(id: string): Promise<any> {
    return apiClient(`/academic/departments/${id}`, { method: 'DELETE' });
}

export async function getClassesByDepartment(departmentId: string): Promise<AcademicClass[]> {
    return apiClient<AcademicClass[]>(`/academic/departments/${departmentId}/classes`);
}

export async function createClass(departmentId: string, name: string): Promise<AcademicClass> {
    return apiClient<AcademicClass>(`/academic/departments/${departmentId}/classes`, {
        method: 'POST',
        body: JSON.stringify({ name })
    });
}

export async function deleteClass(id: string): Promise<any> {
    return apiClient(`/academic/classes/${id}`, { method: 'DELETE' });
}

export async function getStudentsByClass(classId: string): Promise<any[]> {
    return apiClient<any[]>(`/academic/classes/${classId}/students`);
}
