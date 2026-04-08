import { apiClient } from './client';

export interface Activity {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location?: string;
    capacity: number;
    attendeesCount: number;
    isRegistered?: boolean;
}

export async function getEvents(): Promise<Activity[]> {
    return apiClient<Activity[]>('/events');
}

export async function joinEvent(id: string): Promise<any> {
    return apiClient(`/events/${id}/join`, {
        method: 'POST'
    });
}

export async function leaveEvent(id: string): Promise<any> {
    return apiClient(`/events/${id}/leave`, {
        method: 'POST'
    });
}
