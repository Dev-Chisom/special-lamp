/**
 * Notification Service
 * Handles all notification-related API calls
 */

import { apiClient } from './api-client'
import type {
  Notification,
  NotificationListParams,
  UnreadCountResponse,
  MarkReadResponse,
  MarkAllReadResponse,
} from '@/types/notification'

class NotificationService {
  /**
   * Get notifications
   * Endpoint: GET /api/v1/notifications
   * Query Parameters:
   *   - unread_only (bool, default: false) - Only return unread notifications
   *   - limit (int, default: 50, max: 100) - Maximum number of notifications
   *   - offset (int, default: 0) - Pagination offset
   */
  async getNotifications(params?: NotificationListParams): Promise<Notification[]> {
    const queryParams = new URLSearchParams()

    if (params?.unread_only !== undefined) {
      queryParams.append('unread_only', params.unread_only.toString())
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString())
    }

    const queryString = queryParams.toString()
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`

    return apiClient.get<Notification[]>(endpoint)
  }

  /**
   * Get unread notification count
   * Endpoint: GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>('/notifications/unread-count')
  }

  /**
   * Mark a notification as read
   * Endpoint: POST /api/v1/notifications/{notification_id}/read
   */
  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    return apiClient.post<MarkReadResponse>(`/notifications/${notificationId}/read`, {})
  }

  /**
   * Mark all notifications as read
   * Endpoint: POST /api/v1/notifications/mark-all-read
   */
  async markAllAsRead(): Promise<MarkAllReadResponse> {
    return apiClient.post<MarkAllReadResponse>('/notifications/mark-all-read', {})
  }

  /**
   * Delete a notification
   * Endpoint: DELETE /api/v1/notifications/{notification_id}
   * Returns: 204 No Content
   */
  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${notificationId}`)
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

