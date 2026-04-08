export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ComplaintType = 'complaint' | 'suggestion';

export interface ComplaintResponse {
  id: string;
  message: string;
  content?: string;
  createdAt: string;
  isStaff: boolean;
  senderId: string;
  role: string;
}

export interface Complaint {
  id: string;
  type: ComplaintType;
  subject: string;
  category: string;
  message: string;
  status: ComplaintStatus;
  createdAt: string;
  source?: 'applicant' | 'student';
  studentName?: string;
  studentEmail?: string;
  responses?: ComplaintResponse[];
}
