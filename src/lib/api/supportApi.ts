import { apiClient } from './client';

export interface SupportMessage {
    id: string;
    senderId: string;
    content: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
}

export interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    messages: SupportMessage[];
    createdAt: string;
    updatedAt: string;
}

export async function getMyTickets(): Promise<SupportTicket[]> {
    return apiClient<SupportTicket[]>('/support/tickets');
}

export async function createTicket(data: { subject: string; category: string; message: string }): Promise<SupportTicket> {
    return apiClient<SupportTicket>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function respondToTicket(id: string, content: string): Promise<SupportTicket> {
    return apiClient<SupportTicket>(`/support/tickets/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ content })
    });
}
