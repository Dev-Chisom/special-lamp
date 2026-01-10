/**
 * Application Service
 * Handles job application automation API calls
 */

import { apiClient } from './api-client';

// ============================================================================
// Types
// ============================================================================

export type ApplicationStatus = 
  | 'pending'
  | 'preparing_materials'
  | 'running'
  | 'waiting_for_user'
  | 'submitted'
  | 'failed'
  | 'aborted';

export type ApplicationStep = 
  | 'initializing'
  | 'filling_form'
  | 'uploading_resume'
  | 'answering_questions'
  | 'verification_required'
  | 'submitting'
  | 'completed';

export interface ApplicationRun {
  id: string;
  job_id?: string;
  user_id?: string;
  ingested_job_id?: string;
  status: ApplicationStatus;
  current_step?: ApplicationStep | null;
  progress?: number; // Backend uses 'progress' not 'progress_percentage'
  progress_percentage?: number; // For compatibility
  steps_completed?: number;
  total_steps?: number;
  started_at?: string;
  completed_at?: string;
  error_reason?: string | null; // Backend uses 'error_reason' not 'error_message'
  error_message?: string; // For compatibility
  requires_user_action?: boolean;
  user_action_required?: string | null; // Backend uses 'user_action_required'
  user_action_message?: string; // For compatibility
  user_action_url?: string;
  log_entries?: ApplicationLogEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationLogEntry {
  id: string;
  application_run_id?: string;
  step_name?: string;
  step_type?: 'captcha' | 'consent' | 'input' | 'navigation' | 'extraction' | 'info' | 'warning';
  message: string;
  screenshot_url?: string;
  step_metadata?: Record<string, any>;
  timestamp: string;
  // Legacy fields for backward compatibility
  level?: 'info' | 'warning' | 'error' | 'success';
  step?: ApplicationStep;
}

export interface ApplicationEvent {
  id: string;
  application_run_id: string;
  event_type: string; // e.g., "STARTED", "PAUSED", "STEP_COMPLETED", "USER_ACTION_COMPLETED", "ERROR", "COMPLETED"
  event_data?: Record<string, any>;
  timestamp: string;
}

export interface StartApplicationRequest {
  job_id: string;
  resume_id?: string;
  cover_letter_id?: string;
  user_consent: boolean;
  consent_text?: string;
  external_url?: string; // Job application URL
}

export interface StartApplicationResponse {
  application_id: string;
  status: ApplicationStatus;
  current_step: ApplicationStep;
  requires_user_action: boolean;
}

export interface ApplicationAnalytics {
  total_applications: number;
  successful_applications: number;
  failed_applications: number;
  pending_applications: number;
  success_rate: number;
  average_time_per_application: number; // in seconds
  failures_by_ats: Record<string, number>;
  applications_by_status: Record<ApplicationStatus, number>;
  time_saved_hours: number;
}

export interface BulkApplicationRequest {
  job_ids: string[];
  resume_id?: string;
  cover_letter_id?: string;
  user_consent: boolean;
}

export interface BulkApplicationResponse {
  applications: Array<{
    job_id: string;
    application_id: string;
    status: ApplicationStatus;
  }>;
  total_count: number;
  successful_starts: number;
  failed_starts: number;
}

// ============================================================================
// Application Service
// ============================================================================

class ApplicationService {
  /**
   * Start a new application run for a job
   * Endpoint: POST /api/v1/applications/auto-apply
   */
  async startApplication(data: StartApplicationRequest): Promise<StartApplicationResponse> {
    return apiClient.post<StartApplicationResponse>('/applications/auto-apply', data);
  }

  /**
   * Get application run status by ID
   * Endpoint: GET /api/v1/applications/{application_id}/status
   */
  async getApplicationStatus(applicationId: string): Promise<ApplicationRun> {
    return apiClient.get<ApplicationRun>(`/applications/${applicationId}/status`);
  }

  /**
   * Get application logs (timeline/steps)
   * Endpoint: GET /api/v1/applications/{application_id}/logs
   */
  async getApplicationLogs(applicationId: string): Promise<ApplicationLogEntry[]> {
    return apiClient.get<ApplicationLogEntry[]>(`/applications/${applicationId}/logs`);
  }

  /**
   * Get application events
   * Endpoint: GET /api/v1/applications/{application_id}/events
   */
  async getApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
    return apiClient.get<ApplicationEvent[]>(`/applications/${applicationId}/events`);
  }

  /**
   * Get all application runs for the current user
   * Endpoint: GET /api/v1/applications
   */
  async getApplications(params?: {
    status?: ApplicationStatus;
    job_id?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    items: ApplicationRun[];
    total: number;
    page: number;
    page_size: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.job_id) queryParams.append('job_id', params.job_id);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const queryString = queryParams.toString();
    return apiClient.get(
      `/applications${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Cancel an application run
   * Endpoint: POST /api/v1/applications/{application_id}/cancel
   */
  async cancelApplication(applicationId: string): Promise<void> {
    return apiClient.post(`/applications/${applicationId}/cancel`);
  }

  /**
   * Confirm user action (for WAITING_FOR_USER state)
   * Endpoint: POST /api/v1/applications/{application_id}/user-action-complete
   */
  async confirmUserAction(
    applicationId: string,
    actionType: string = 'user_confirmation',
    actionData: Record<string, any> = {}
  ): Promise<ApplicationRun> {
    return apiClient.post<ApplicationRun>(`/applications/${applicationId}/user-action-complete`, {
      action_type: actionType,
      action_data: actionData,
    });
  }

  /**
   * Start bulk applications
   * Endpoint: POST /api/v1/applications/bulk-start
   */
  async startBulkApplications(data: BulkApplicationRequest): Promise<BulkApplicationResponse> {
    return apiClient.post<BulkApplicationResponse>('/applications/bulk-start', data);
  }

  /**
   * Get application analytics for the current user
   * Endpoint: GET /api/v1/applications/analytics
   */
  async getAnalytics(): Promise<ApplicationAnalytics> {
    return apiClient.get<ApplicationAnalytics>('/applications/analytics');
  }

  /**
   * Poll application status (for real-time updates)
   */
  async pollApplicationStatus(
    applicationId: string,
    onUpdate: (application: ApplicationRun) => void,
    interval: number = 2000
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const application = await this.getApplicationStatus(applicationId);
        onUpdate(application);

        // Stop polling if application is in terminal state
        if (['submitted', 'failed', 'aborted'].includes(application.status)) {
          isPolling = false;
          return;
        }
      } catch (error) {
        console.error('Error polling application status:', error);
      }

      if (isPolling) {
        setTimeout(poll, interval);
      }
    };

    poll();

    // Return stop function
    return () => {
      isPolling = false;
    };
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();

