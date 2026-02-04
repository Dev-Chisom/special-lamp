/**
 * Job Service
 * Handles all job application and job listing API calls
 * Based on backend API: /api/v1/job-ingestion/jobs/* and /api/v1/jobs/*
 */

import { apiClient } from './api-client';

// ============================================================================
// Job Tracker Types (User's Saved Jobs)
// ============================================================================

export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';

export interface JobResponse {
  id: string;
  user_id: string;
  ingested_job_id?: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range?: string;
  description: string;
  requirements?: string;
  match_score?: number;
  source?: string;
  external_url?: string;
  status: JobStatus;
  applied_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Full job details from ingested job (when available)
  ingested_job_details?: {
    job_description?: string; // Full description
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    salary_period?: string;
    required_skills?: string[];
    preferred_skills?: string[];
    benefits?: string[];
    education_level?: string;
    years_of_experience_min?: number;
    years_of_experience_max?: number;
    keywords?: string[];
  };
}

export interface CreateJobRequest {
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  source?: string;
  external_url?: string;
  ingested_job_id?: string;
}

export interface UpdateJobRequest {
  status?: JobStatus;
  applied_at?: string;
  notes?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string;
  salary_range?: string;
  job_type?: string;
}

export interface GetJobsParams {
  status?: JobStatus;
  page?: number;
  page_size?: number;
}

// ============================================================================
// Job Search Types (Platform Job Database)
// ============================================================================

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';
export type LocationType = 'onsite' | 'remote' | 'hybrid';

export interface IngestedJobResponse {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  location_raw: string;
  location_city?: string;
  location_country?: string;
  location_type: LocationType;
  employment_type: EmploymentType;
  seniority_level?: string;
  description_snippet?: string; // Truncated description for list views
  job_description?: string; // Full description for detail views
  required_skills?: string[];
  preferred_skills?: string[];
  application_url: string;
  date_posted: string;
  is_active: boolean;
  is_fresh: boolean;
  quality_score?: number;
  // Additional job details
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  benefits?: string[];
  education_level?: string;
  years_of_experience_min?: number;
  years_of_experience_max?: number;
  keywords?: string[];
  // Match scores (when job is matched with user's resume)
  match_score?: number;
  skills_match?: number;
  role_match?: number;
  experience_match?: number;
  education_match?: number;
  location_match?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface SearchJobsParams {
  query?: string;
  location?: string;
  employment_type?: EmploymentType;
  remote_only?: boolean;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  page?: number;
  page_size?: number;
}

class JobService {
  // ============================================================================
  // Job Tracker Methods (User's Saved Jobs)
  // ============================================================================

  /**
   * Get all jobs saved by the current user
   * Endpoint: GET /api/v1/jobs
   */
  async getJobs(params?: GetJobsParams): Promise<JobResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const queryString = queryParams.toString();
    return apiClient.get<JobResponse[]>(
      `/jobs${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a specific saved job by ID
   * Endpoint: GET /api/v1/jobs/{job_id}
   */
  async getJob(jobId: string): Promise<JobResponse> {
    return apiClient.get<JobResponse>(`/jobs/${jobId}`);
  }

  /**
   * Save a job to the tracker (creates with status: "saved")
   * Endpoint: POST /api/v1/jobs
   */
  async saveJob(data: CreateJobRequest): Promise<JobResponse> {
    return apiClient.post<JobResponse>('/jobs', data);
  }

  /**
   * Update a saved job (status, notes, etc.)
   * Endpoint: PUT /api/v1/jobs/{job_id}
   */
  async updateJob(jobId: string, data: UpdateJobRequest): Promise<JobResponse> {
    return apiClient.put<JobResponse>(`/jobs/${jobId}`, data);
  }

  /**
   * Delete a job from the tracker
   * Endpoint: DELETE /api/v1/jobs/{job_id}
   */
  async deleteJob(jobId: string): Promise<void> {
    return apiClient.delete<void>(`/jobs/${jobId}`);
  }

  /**
   * Update job status (convenience method for drag-and-drop)
   */
  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    appliedAt?: string,
    notes?: string
  ): Promise<JobResponse> {
    return this.updateJob(jobId, {
      status,
      applied_at: appliedAt,
      notes,
    });
  }

  // ============================================================================
  // Job Search Methods (Platform Job Database)
  // ============================================================================

  /**
   * Search/browse all jobs in the platform database
   * Endpoint: GET /api/v1/job-ingestion/jobs/search
   */
  async searchJobs(params?: SearchJobsParams): Promise<PaginatedResponse<IngestedJobResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.query) queryParams.append('query', params.query);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.employment_type) queryParams.append('employment_type', params.employment_type);
    if (params?.remote_only !== undefined) {
      queryParams.append('remote_only', params.remote_only.toString());
    }
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const queryString = queryParams.toString();
    return apiClient.get<PaginatedResponse<IngestedJobResponse>>(
      `/job-ingestion/jobs/search${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get jobs posted in the last 48 hours
   * Endpoint: GET /api/v1/job-ingestion/jobs/fresh
   */
  async getFreshJobs(limit: number = 20): Promise<IngestedJobResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    return apiClient.get<IngestedJobResponse[]>(
      `/job-ingestion/jobs/fresh?${queryParams.toString()}`
    );
  }

  /**
   * Get trending jobs
   * Endpoint: GET /api/v1/job-ingestion/jobs/trending
   */
  async getTrendingJobs(limit: number = 20): Promise<IngestedJobResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    return apiClient.get<IngestedJobResponse[]>(
      `/job-ingestion/jobs/trending?${queryParams.toString()}`
    );
  }

  /**
   * Get specific job details from the platform database
   * Endpoint: GET /api/v1/job-ingestion/jobs/{job_id}
   */
  async getJobDetails(jobId: string): Promise<IngestedJobResponse> {
    return apiClient.get<IngestedJobResponse>(`/job-ingestion/jobs/${jobId}`);
  }

  /**
   * Convert an IngestedJobResponse to CreateJobRequest format
   * Helper method to save a job from search results to tracker
   */
  ingestedJobToCreateRequest(ingestedJob: IngestedJobResponse): CreateJobRequest {
    // Format salary range if available
    let salaryRange: string | undefined;
    if (ingestedJob.salary_min || ingestedJob.salary_max) {
      const currency = ingestedJob.salary_currency || 'USD';
      const period = ingestedJob.salary_period || 'year';
      const min = ingestedJob.salary_min ? `${currency} ${ingestedJob.salary_min.toLocaleString()}` : '';
      const max = ingestedJob.salary_max ? `${currency} ${ingestedJob.salary_max.toLocaleString()}` : '';
      salaryRange = min && max ? `${min} - ${max} per ${period}` : min || max || undefined;
    }

    return {
      title: ingestedJob.job_title,
      company: ingestedJob.company_name,
      location: ingestedJob.location_raw,
      job_type: ingestedJob.employment_type,
      description: ingestedJob.job_description || ingestedJob.description_snippet || '',
      requirements: ingestedJob.required_skills?.join(', ') || '',
      salary_range: salaryRange,
      source: 'platform',
      external_url: ingestedJob.application_url,
      ingested_job_id: ingestedJob.id,
    };
  }
}

// Export singleton instance
export const jobService = new JobService();

