/**
 * Notification Types
 * Matches backend API schema
 */

export type NotificationType =
  | 'application_submitted'
  | 'application_failed'
  | 'application_paused'
  | 'application_aborted'

export interface NotificationMetadata {
  status?: string
  application_url?: string
  job_title?: string
  company?: string
  error_reason?: string
  action_type?: string
  [key: string]: any // Allow additional metadata fields
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  metadata?: NotificationMetadata
  is_read: boolean
  read_at: string | null
  created_at: string
  application_run_id?: string | null
  job_id?: string | null
  ingested_job_id?: string | null
}

export interface NotificationListParams {
  unread_only?: boolean
  limit?: number // default: 50, max: 100
  offset?: number // default: 0
}

export interface UnreadCountResponse {
  unread_count: number
}

export interface MarkReadResponse {
  message: string
  notification_id: string
}

export interface MarkAllReadResponse {
  message: string
  count: number
}
