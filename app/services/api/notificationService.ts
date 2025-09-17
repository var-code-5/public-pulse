import { apiClient } from './client';
import { ENDPOINTS } from './config';
import { Notification, PaginationResponse } from './types';

interface NotificationsResponse {
  notifications: Notification[];
  pagination: PaginationResponse;
}

export const notificationService = {
  // Get user notifications
  getUserNotifications: async (page = 1, limit = 10, read?: boolean) => {
    return apiClient.get<NotificationsResponse>(ENDPOINTS.NOTIFICATIONS, {
      params: {
        page,
        limit,
        ...(read !== undefined && { read })
      }
    });
  },
  
  // Mark notification as read
  markNotificationAsRead: async (id: string) => {
    return apiClient.patch<{ message: string }>(ENDPOINTS.NOTIFICATION_READ(id), {});
  }
};
