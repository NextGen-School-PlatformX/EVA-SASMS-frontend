export interface SystemUser {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | 'APPLICANT';
    department?: string;
    status: 'Active' | 'Inactive';
    lastActive: string;
}

export interface SystemRole {
    id: string;
    name: string;
    description: string;
    permissions: {
        module: string;
        access: 'none' | 'read' | 'write' | 'full';
    }[];
}

export interface SystemDepartment {
    id: string;
    name: string;
    headId?: string;
    headName?: string;
    studentCount: number;
    staffCount: number;
    attendanceRate: number;
    financialStatus: 'Healthy' | 'Deficit' | 'Warning';
}

export interface SystemKPIs {
    totalStudents: number;
    activeStudents: number;
    newApplications: number;
    pendingAdmissions: number;
    totalStaff: number;
    departmentsCount: number;
    outstandingFeesTotal: number;
    openComplaintsCount: number;
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    module: string;
    timestamp: string;
    details?: string;
    ipAddress: string;
}

export interface FeeCategory {
    id: string;
    name: string;
    amount: number;
    description: string;
    frequency: 'once' | 'monthly' | 'annually' | 'per_semester';
}

export interface SystemSettings {
    branding: {
        logoUrl: string;
        primaryColor: string;
        secondaryColor: string;
    };
    policies: {
        attendanceThreshold: number;
        delinquencyLockDays: number;
    };
    academicYear: string;
    minAdmissionScore: number;
    allowOnlineAdmissions?: boolean;
    enableStudentFeed?: boolean;
    smtpHost?: string;
    smtpSender?: string;
}
