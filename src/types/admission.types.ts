export type AdmissionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface AdmissionDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  url: string;
  uploadedAt: string;
}

export interface AdmissionApplication {
  id: string;
  program: string;
  status: AdmissionStatus;
  submittedAt?: string;
  documents: AdmissionDocument[];
  createdAt: string;
  updatedAt: string;
}
