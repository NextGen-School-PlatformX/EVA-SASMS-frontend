import { apiClient } from './client';
import type {
    ApplicantProfile,
    StudentAffairsRecord,
    FinancialRecord,
    EventRecord,
} from '@/src/types/staff.types';
import type { Complaint } from '@/src/types/complaint.types';

export async function getApplicants(): Promise<ApplicantProfile[]> {
    const apps = await apiClient<any[]>('/admissions');
    return apps.map(app => ({
        id: app.id,
        name: app.applicant?.name || 'Unknown',
        email: app.applicant?.email || 'Unknown',
        applicantId: app.applicantId,
        appliedDate: new Date(app.submittedAt || app.createdAt).toLocaleDateString(),
        submittedAt: app.submittedAt || app.createdAt,
        status: (app.status === 'ACCEPTED' ? 'Approved' : app.status === 'REJECTED' ? 'Rejected' : 'Pending') as 'Pending' | 'Approved' | 'Rejected',
        notes: app.feedback,
        feedback: app.feedback,
        department: app.preferredDept?.name || 'N/A',
        preferredDeptId: app.preferredDeptId,
        ministryScore: app.ministryScore,
        nationalId: app.nationalId,
        birthCertificateUrl: app.birthCertificateUrl,
        idCardUrl: app.idCardUrl,
        ministryResultUrl: app.ministryResultUrl,
        receiptUrl: app.receiptUrl,
        selectionReason: app.selectionReason,
        examDate: app.examDate,
        examLocation: app.examLocation,
        examNotes: app.examNotes,
        interviewDate: app.interviewDate,
        interviewLocation: app.interviewLocation,
        interviewNotes: app.interviewNotes,
    }));
}

export async function updateApplicantStatus(id: string, status: 'Approved' | 'Rejected', notes?: string): Promise<any> {
    return apiClient<any>(`/admissions/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status === 'Approved' ? 'ACCEPTED' : 'REJECTED', feedback: notes })
    });
}

export async function convertApplicantToStudent(applicationId: string, data: { nationalId: string; academicYear: string; studentClass: string; departmentId: string }): Promise<any> {
    return apiClient<any>(`/admissions/convert/${applicationId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function getAffairsRecords(): Promise<any[]> {
    return apiClient<any[]>('/admin/students');
}

export async function updateStudent(id: string, data: any): Promise<any> {
    return apiClient<any>(`/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export async function getFinancialRecords(): Promise<any[]> {
    try {
        const fees = await apiClient<any[]>('/finance/fees');
        return fees.map((f: any) => ({
            id: f.id,
            title: f.title,
            description: f.description,
            amount: f.amount,
            dueDate: new Date(f.dueDate).toLocaleDateString(),
            attachmentUrl: f.attachmentUrl
        }));
    } catch {
        return [];
    }
}

export async function createFee(data: any): Promise<any> {
    return apiClient<any>('/finance/fees', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function getFeePayments(): Promise<any[]> {
    return apiClient<any[]>('/finance/fee-payments');
}

export async function reviewFeePayment(id: string, status: string, adminNote?: string): Promise<any> {
    return apiClient<any>(`/finance/fee-payments/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ approve: status === 'APPROVED', adminNote })
    });
}

export async function getEvents(): Promise<EventRecord[]> {
    try {
        const events = await apiClient<any[]>('/events');
        return events.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            category: e.category,
            organizer: e.organizer,
            attendeesCount: e.attendeesCount,
        }));
    } catch {
        return [];
    }
}

export async function createEvent(data: any): Promise<EventRecord> {
    return apiClient<EventRecord>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

function mapTicketToComplaint(t: any): Complaint {
    return {
        id: t.id,
        type: 'complaint' as const,
        subject: t.subject,
        category: t.category,
        message: t.messages?.[0]?.content || t.subject,
        status: (t.status === 'OPEN' ? 'open' : t.status === 'IN_PROGRESS' ? 'in_progress' : 'resolved') as any,
        createdAt: t.createdAt,
        responses: (t.messages || []).map((m: any) => ({
            id: m.id,
            message: m.content,
            content: m.content,
            createdAt: m.createdAt,
            isStaff: m.role === 'ADMIN' || m.role === 'SUPER_ADMIN',
            role: m.role,
            senderId: m.senderId
        })),
    };
}

function mapStudentComplaintToComplaint(c: any): Complaint {
    return {
        id: c.id,
        type: 'complaint' as const,
        subject: c.subject,
        category: 'student',
        message: c.messages?.[0]?.content || c.subject,
        status: (c.status === 'OPEN' ? 'open' : c.status === 'IN_PROGRESS' ? 'in_progress' : 'resolved') as any,
        createdAt: c.createdAt,
        studentName: c.student?.name,
        studentEmail: c.student?.email,
        source: 'student' as const,
        responses: (c.messages || []).map((m: any) => ({
            id: m.id,
            message: m.content,
            content: m.content,
            createdAt: m.createdAt,
            isStaff: m.role === 'ADMIN' || m.role === 'SUPER_ADMIN',
            role: m.role,
            senderId: m.senderId
        })),
    };
}

export async function getStaffComplaints(): Promise<Complaint[]> {
    try {
        const [tickets, studentComplaints] = await Promise.all([
            apiClient<any[]>('/support/tickets').catch(() => []),
            apiClient<any[]>('/support/complaints').catch(() => []),
        ]);
        const mapped = [
            ...tickets.map(t => ({ ...mapTicketToComplaint(t), source: 'applicant' as const })),
            ...studentComplaints.map(mapStudentComplaintToComplaint),
        ];
        return mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
        return [];
    }
}


export async function resolveComplaint(id: string, source?: string): Promise<Complaint> {
    if (source === 'student') {
        const updated = await apiClient<any>(`/support/complaints/${id}/resolve`, { method: 'PATCH' });
        return mapStudentComplaintToComplaint(updated);
    }
    const updatedTicket = await apiClient<any>(`/support/tickets/${id}/resolve`, { method: 'PATCH' });
    return { ...mapTicketToComplaint(updatedTicket), source: 'applicant' as const };
}

export async function respondToComplaint(id: string, response: string, source?: string): Promise<Complaint> {
    if (source === 'student') {
        const updated = await apiClient<any>(`/support/complaints/${id}/respond`, {
            method: 'POST',
            body: JSON.stringify({ content: response }),
        });
        return mapStudentComplaintToComplaint(updated);
    }
    const updatedTicket = await apiClient<any>(`/support/tickets/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ content: response }),
    });
    return { ...mapTicketToComplaint(updatedTicket), source: 'applicant' as const };
}

// Attendance
export async function getAttendanceSessions(): Promise<any[]> {
    return apiClient<any[]>('/attendance/sessions');
}

export async function createAttendanceSession(data: any): Promise<any> {
    return apiClient<any>('/attendance/session', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function getAttendanceReport(sessionId: string): Promise<any> {
    return apiClient<any>(`/attendance/session/${sessionId}`);
}

export async function getAttendanceQR(sessionId: string): Promise<any> {
    return apiClient<any>(`/attendance/session/${sessionId}/qr`);
}

export async function autoMarkAbsent(sessionId: string): Promise<any> {
    return apiClient<any>(`/attendance/session/${sessionId}/auto-absent`, {
        method: 'POST'
    });
}
