/**
 * Notifications API client.
 */
import { getApiClient } from '../api-client';
import type { Notification } from '../../types';

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    const client = getApiClient();
    return client.get<Notification[]>('/api/v1/notifications');
  },

  async markAsRead(id: number): Promise<Notification> {
    const client = getApiClient();
    return client.post<Notification>(`/api/v1/notifications/${id}/read`);
  },
};

