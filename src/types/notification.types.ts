export type NotificationType = 'deadline' | 'decision' | 'alert' | 'info';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}
