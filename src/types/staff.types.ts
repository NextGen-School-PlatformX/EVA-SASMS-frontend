export interface ApplicantProfile {
    id: string;
    applicantId?: string;
    name: string;
    email: string;
    appliedDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    notes?: string;
    department?: string;
    preferredDeptId?: string | null;
    ministryScore?: number;
    birthCertificateUrl?: string;
    idCardUrl?: string;
    ministryResultUrl?: string;
    receiptUrl?: string;
    nationalId?: string;
}

export interface StudentAffairsRecord {
    id: string;
    studentId?: string;
    name: string;
    email?: string;
    department: string;
    departmentId?: string | null;
    year: string;
    nationalId?: string;
    studentPhone?: string;
    parentPhone?: string;
    phoneNumber?: string;
    address?: string;
    status: string;
    attendanceRate?: number;
    attendancePercentage?: number;
    birthCertUploaded?: boolean;
    middleSchoolCertUploaded?: boolean;
}

export interface FinancialRecord {
    id: string;
    studentName: string;
    amount: number;
    status: 'Paid' | 'Unpaid' | 'Overdue';
    dueDate: string;
}

export interface EventRecord {
    id: string;
    title: string;
    date: string;
    category: string;
    description?: string;
    location?: string;
    organizer: string;
    attendeesCount: number;
    capacity?: number;
}
