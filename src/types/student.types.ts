export interface StudentProfile {
  id: string;
  fullName: string;
  studentId: string;
  department: string;
  academicYear: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AcademicScheduleItem {
  id: string;
  day: string;
  time: string;
  course: string;
  room?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}
