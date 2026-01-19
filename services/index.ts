/**
 * Services Index
 * Central export for all services
 */

export { apiClient } from './api-client';
export { authService } from './auth.service';
export { oauthService } from './oauth.service';
export { resumeService } from './resume.service';
export { scanService } from './scan.service';
export { linkedinService } from './linkedin.service';
export { jobService } from './job.service';
export { applicationService } from './application.service';
export { notificationService } from './notification.service';

export type { ApiError, ApiClientError } from './api-client';
export type {
  User,
  AuthTokens,
  SignInRequest,
  SignUpRequest,
  SignInResponse,
  SignUpResponse,
} from '@/types/auth';
export type {
  JobResponse,
  JobStatus,
  CreateJobRequest,
  UpdateJobRequest,
  GetJobsParams,
  IngestedJobResponse,
  PaginatedResponse,
  SearchJobsParams,
  EmploymentType,
  LocationType,
} from './job.service';
export type {
  ApplicationRun,
  ApplicationStatus,
  ApplicationStep,
  ApplicationLogEntry,
  ApplicationEvent,
  StartApplicationRequest,
  StartApplicationResponse,
  ApplicationAnalytics,
  BulkApplicationRequest,
  BulkApplicationResponse,
} from './application.service';

