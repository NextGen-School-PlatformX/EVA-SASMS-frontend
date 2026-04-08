import { apiClient } from './client';

export interface Notification {
    id: string;
    text: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
    return apiClient<Notification[]>('/notifications');
}

export async function markNotificationRead(id: string): Promise<any> {
    return apiClient(`/notifications/${id}/read`, {
        method: 'PATCH',
    });
}

export async function markAllNotificationsRead(): Promise<any> {
    return apiClient('/notifications/read-all', {
        method: 'PATCH',
    });
}
