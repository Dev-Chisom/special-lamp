/**
 * Resume Service
 * Handles all resume-related API calls (both file-based and built resumes)
 */

import { apiClient } from './api-client';
import { config } from '@/lib/config';

// ============================================================================
// File-Based Resume Types (Existing)
// ============================================================================

export interface Resume {
  id: string;
  user_id: string;
  title?: string;
  file_name?: string;
  file_url: string;
  file_type?: string;
  parsed_content?: any;
  is_primary?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadResumeRequest {
  file: File;
  title?: string;
}

export interface UpdateResumeRequest {
  title?: string;
  is_primary?: boolean;
  file?: File;
  file_name?: string;
}

// ============================================================================
// Built Resume Types (Resume Builder)
// ============================================================================

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

export interface Experience {
  id?: string; // Optional, backend generates if not provided
  job_title: string;
  company: string;
  start_date: string; // YYYY-MM
  end_date?: string; // YYYY-MM
  is_current: boolean;
  description?: string;
}

export interface Education {
  id?: string; // Optional, backend generates if not provided
  school: string;
  degree: string;
  start_year?: string; // YYYY
  end_year?: string; // YYYY
  is_current: boolean;
}

export interface ResumeBuild {
  id: string;
  user_id: string;
  name: string;
  personal_info: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  template?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeBuildCreateRequest {
  name?: string; // Optional, defaults to generated name
  personal_info: PersonalInfo;
  summary?: string;
  experience: Omit<Experience, 'id'>[];
  education: Omit<Education, 'id'>[];
  skills: string[];
  template?: string;
}

export interface ResumeBuildUpdateRequest {
  name?: string;
  personal_info?: Partial<PersonalInfo>;
  summary?: string;
  experience?: Omit<Experience, 'id'>[];
  education?: Omit<Education, 'id'>[];
  skills?: string[];
  template?: string;
}

export interface ResumeBuildListResponse {
  items: ResumeBuild[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Combined resume item (for /resumes/all endpoint)
export type CombinedResumeItem = 
  | (Resume & { type: 'file' })
  | (ResumeBuild & { type: 'built' });

export interface CombinedResumeListResponse {
  items: CombinedResumeItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'student' | 'minimalist' | 'creative';
  preview_url?: string;
  is_premium?: boolean;
}

export interface DuplicateResumeRequest {
  name?: string;
}

export interface ExportPDFRequest {
  template?: string;
  format?: string;
}

export interface ExportPDFResponse {
  pdf_url: string;
  message?: string;
}

// ============================================================================
// Resume Service
// ============================================================================

class ResumeService {
  // ============================================================================
  // File-Based Resume Methods (Existing)
  // ============================================================================

  /**
   * Get all file-based resumes for the current user
   */
  async getResumes(): Promise<Resume[]> {
    return apiClient.get<Resume[]>('/resumes');
  }

  /**
   * Get a specific file-based resume by ID
   */
  async getResume(id: string): Promise<Resume> {
    return apiClient.get<Resume>(`/resumes/${id}`);
  }

  /**
   * Upload a new resume file
   */
  async uploadResume(data: UploadResumeRequest): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) {
      formData.append('title', data.title);
    }
    return apiClient.post<Resume>('/resumes', formData);
  }

  /**
   * Update a file-based resume (metadata only, or replace file)
   */
  async updateResume(id: string, data: UpdateResumeRequest): Promise<Resume> {
    if (data.file) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.file_name) formData.append('file_name', data.file_name);
      formData.append('file', data.file);
      return apiClient.put<Resume>(`/resumes/${id}`, formData);
    }
    return apiClient.put<Resume>(`/resumes/${id}`, {
      title: data.title,
      is_primary: data.is_primary,
    });
  }

  /**
   * Delete a file-based resume
   */
  async deleteResume(id: string): Promise<void> {
    return apiClient.delete<void>(`/resumes/${id}`);
  }

  // ============================================================================
  // Resume Builder Methods (New)
  // ============================================================================

  /**
   * Create a new built resume
   * Endpoint: POST /api/v1/resumes/build
   */
  async createBuiltResume(data: ResumeBuildCreateRequest): Promise<ResumeBuild> {
    return apiClient.post<ResumeBuild>('/resumes/build', data);
  }

  /**
   * Get all built resumes for the current user
   * Endpoint: GET /api/v1/resumes/build
   */
  async getBuiltResumes(params?: {
    page?: number;
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ResumeBuildListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    
    const queryString = queryParams.toString();
    const endpoint = `/resumes/build${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ResumeBuildListResponse>(endpoint);
  }

  /**
   * Get a specific built resume by ID
   * Endpoint: GET /api/v1/resumes/build/{id}
   */
  async getBuiltResume(id: string): Promise<ResumeBuild> {
    return apiClient.get<ResumeBuild>(`/resumes/build/${id}`);
  }

  /**
   * Update an existing built resume
   * Endpoint: PUT /api/v1/resumes/build/{id}
   */
  async updateBuiltResume(id: string, data: ResumeBuildUpdateRequest): Promise<ResumeBuild> {
    return apiClient.put<ResumeBuild>(`/resumes/build/${id}`, data);
  }

  /**
   * Delete a built resume
   * Endpoint: DELETE /api/v1/resumes/build/{id}
   */
  async deleteBuiltResume(id: string): Promise<void> {
    return apiClient.delete<void>(`/resumes/build/${id}`);
  }

  /**
   * Import a resume file and create a ResumeBuild object
   * Endpoint: POST /api/v1/resumes/build/import-file
   */
  async importFileToBuiltResume(data: {
    file: File;
    template_id?: string;
    name?: string;
  }): Promise<ResumeBuild> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.template_id) {
      formData.append('template_id', data.template_id);
    }
    if (data.name) {
      formData.append('name', data.name);
    }
    return apiClient.post<ResumeBuild>('/resumes/build/import-file', formData);
  }

  // ============================================================================
  // Templates & AI Features
  // ============================================================================

  /**
   * Get available resume templates
   * Endpoint: GET /api/v1/resumes/templates
   */
  async getTemplates(params?: {
    category?: 'professional' | 'student' | 'minimalist' | 'creative';
    is_premium?: boolean;
  }): Promise<{ templates: ResumeTemplate[] }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_premium !== undefined) queryParams.append('is_premium', params.is_premium.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/resumes/templates${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<{ templates: ResumeTemplate[] }>(endpoint);
  }

  /**
   * Generate professional summary using AI
   * Endpoint: POST /api/v1/resumes/ai/generate-summary
   */
  async generateSummary(data: {
    personal_info?: Partial<PersonalInfo>;
    experience?: Omit<Experience, 'id'>[];
    education?: Omit<Education, 'id'>[];
    skills?: string[];
    industry?: string;
    target_role?: string;
  }): Promise<{ summary: string; tokens_used: number; model: string }> {
    return apiClient.post<{ summary: string; tokens_used: number; model: string }>('/resumes/ai/generate-summary', data);
  }

  /**
   * Enhance experience description using AI
   * Endpoint: POST /api/v1/resumes/ai/enhance-experience
   */
  async enhanceExperience(data: {
    job_title: string;
    company: string;
    current_description: string;
    industry?: string;
    target_role?: string;
  }): Promise<{ enhanced_description: string; tokens_used: number; model: string }> {
    return apiClient.post<{ enhanced_description: string; tokens_used: number; model: string }>('/resumes/ai/enhance-experience', data);
  }

  /**
   * Tailor resume to a specific job using AI
   * Endpoint: POST /api/v1/resumes/{resume_id}/tailor (file-based)
   *           POST /api/v1/resumes/build/{resume_id}/tailor (built)
   */
  async tailorResumeToJob(
    resumeId: string,
    request: {
      job_id?: string;
      ingested_job_id?: string;
      job_description?: string;
      job_title: string;
      company: string;
    },
    isBuiltResume: boolean = false
  ): Promise<Resume | ResumeBuild> {
    const endpoint = isBuiltResume
      ? `/resumes/build/${resumeId}/tailor`
      : `/resumes/${resumeId}/tailor`;
    
    return apiClient.post<Resume | ResumeBuild>(endpoint, request);
  }

  /**
   * Duplicate/clone a built resume
   * Endpoint: POST /api/v1/resumes/build/{id}/duplicate
   */
  async duplicateBuiltResume(id: string, data?: DuplicateResumeRequest): Promise<ResumeBuild> {
    return apiClient.post<ResumeBuild>(`/resumes/build/${id}/duplicate`, data || {});
  }

  /**
   * Export built resume to PDF
   * Endpoint: POST /api/v1/resumes/build/{id}/export/pdf
   * Returns pdf_url in response, then downloads using GET with token
   */
  async exportBuiltResumeToPDF(id: string, data?: ExportPDFRequest): Promise<void> {
    // Step 1: Generate PDF (POST request)
    const exportResponse = await apiClient.post<ExportPDFResponse>(
      `/resumes/build/${id}/export/pdf`,
      data || {}
    )

    if (!exportResponse.pdf_url) {
      throw new Error('PDF generation failed: pdf_url not returned')
    }

    // Step 2: Download PDF using the pdf_url from response
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem(config.auth.tokenKeys.accessToken) 
      : null
    
    if (!token) {
      throw new Error('Authentication token not found')
    }

    // Append token as query parameter to pdf_url
    const downloadUrl = `${exportResponse.pdf_url}?token=${token}`
    
    // Open in new tab/window to trigger download
    window.open(downloadUrl, '_blank')
  }

  // ============================================================================
  // Resume Manager Methods (Combined)
  // ============================================================================

  /**
   * Get all resumes (files + built) combined
   * Endpoint: GET /api/v1/resumes/all
   */
  async getAllResumes(params?: {
    page?: number;
    page_size?: number;
    type?: 'file' | 'built';
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<CombinedResumeListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    
    const queryString = queryParams.toString();
    const endpoint = `/resumes/all${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<CombinedResumeListResponse>(endpoint);
  }
}

// Export singleton instance
export const resumeService = new ResumeService();
