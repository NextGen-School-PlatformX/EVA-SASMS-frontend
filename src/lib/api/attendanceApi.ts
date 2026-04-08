import { apiClient } from './client';

export interface AttendanceRecord {
    id: string;
    userId: string;
    classId: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    notes?: string;
    user?: {
        name: string;
        email: string;
    };
    class?: {
        name: string;
    };
}

export interface AttendanceSummary {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
}

export interface StudentAttendanceHistory {
    records: AttendanceRecord[];
    summary: AttendanceSummary;
}

export async function markAttendance(records: { userId: string; classId: string; status: string; date: string; notes?: string }[]) {
    return apiClient<AttendanceRecord[]>('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ records })
    });
}

export async function getMyAttendance(): Promise<StudentAttendanceHistory> {
    return apiClient<StudentAttendanceHistory>('/attendance/me');
}

export async function getClassAttendance(classId: string, date: string): Promise<AttendanceRecord[]> {
    return apiClient<AttendanceRecord[]>(`/attendance/class/${classId}?date=${date}`);
}
