import { apiClient } from './client';
import {
    SystemUser,
    SystemDepartment,
    SystemKPIs,
    AuditLog,
    FeeCategory,
    SystemSettings
} from '@/src/types/superadmin.types';

export async function getSystemKPIs(): Promise<SystemKPIs> {
    return apiClient<SystemKPIs>('/system/kpis');
}

export async function getAllUsers(): Promise<SystemUser[]> {
    return apiClient<SystemUser[]>('/users');
}

export async function getSystemDepartments(): Promise<SystemDepartment[]> {
    return apiClient<SystemDepartment[]>('/departments');
}

export async function getAuditLogs(userId?: string): Promise<AuditLog[]> {
    const url = userId ? `/system/audit-logs?userId=${encodeURIComponent(userId)}` : '/system/audit-logs';
    return apiClient<AuditLog[]>(url);
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<any> {
    return apiClient<any>(`/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}

export async function deleteUser(userId: string): Promise<void> {
    return apiClient<void>(`/users/${userId}`, {
        method: 'DELETE',
    });
}

export async function getFeeCategories(): Promise<FeeCategory[]> {
    // Backend route is /api/finance/categories
    return apiClient<FeeCategory[]>('/finance/categories');
}

export async function getSystemSettings(): Promise<SystemSettings> {
    return apiClient<SystemSettings>('/system/settings');
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    return apiClient<SystemSettings>('/system/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
    });
}

export async function uploadSystemLogo(file: File): Promise<{ logoUrl: string; settings: SystemSettings }> {
    const formData = new FormData();
    formData.append('logo', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('sasms_token') : null;
    const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:5001/api')}/system/settings/logo`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function resetSystemSettings(): Promise<SystemSettings> {
    const res = await apiClient<{ message: string; settings: SystemSettings }>('/system/settings/reset', { method: 'POST' });
    return res.settings;
}

export async function createSystemUser(user: Partial<SystemUser>): Promise<SystemUser> {
    return apiClient<SystemUser>('/users', {
        method: 'POST',
        body: JSON.stringify(user)
    });
}

export async function createDepartment(dept: any): Promise<SystemDepartment> {
    return apiClient<SystemDepartment>('/departments', {
        method: 'POST',
        body: JSON.stringify(dept)
    });
}

export async function updateDepartment(id: string, dept: any): Promise<SystemDepartment> {
    return apiClient<SystemDepartment>(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dept)
    });
}

export async function deleteDepartment(id: string): Promise<void> {
    return apiClient<void>(`/departments/${id}`, {
        method: 'DELETE'
    });
}

export async function getNotifications(): Promise<any[]> {
    return apiClient<any[]>('/notifications');
}

export async function markNotificationRead(id: string): Promise<any> {
    return apiClient<any>(`/notifications/${id}/read`, {
        method: 'PATCH',
    });
}

export async function markAllNotificationsRead(): Promise<any> {
    return apiClient<any>('/notifications/read-all', {
        method: 'PATCH',
    });
}

export async function requestPasswordReset(email: string): Promise<any> {
    return apiClient<any>('/auth/request-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function resetPassword(token: string, newPassword: string): Promise<any> {
    return apiClient<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    });
}

export async function updateProfile(data: { name?: string; phoneNumber?: string; currentPassword?: string; newPassword?: string }): Promise<any> {
    return apiClient<any>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string; user: any }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('sasms_token') : null;
    const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:5001/api')}/auth/profile/avatar`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
