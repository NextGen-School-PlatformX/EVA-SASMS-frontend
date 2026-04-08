export type ActivityCategory = 'sports' | 'cultural' | 'academic' | 'social' | 'volunteer';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registeredCount: number;
  isRegistered: boolean;
}
