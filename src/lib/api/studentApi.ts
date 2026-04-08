import { apiClient } from './client';

export async function submitStudentApplication(data: FormData): Promise<any> {
  return apiClient('/admissions/submit', {
    method: 'POST',
    body: data
  });
}

export async function getStudentProfile(): Promise<any> {
  return apiClient('/auth/me');
}

export async function getStudentApplication(): Promise<any> {
  return apiClient('/admissions/me');
}
export async function claimStudentRole(): Promise<any> {
  return apiClient('/admissions/claim-student-role', {
    method: 'POST'
  });
}
