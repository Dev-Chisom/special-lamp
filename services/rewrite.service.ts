/**
 * Rewrite Service
 * Handles resume rewriting API calls
 */

import { apiClient } from './api-client';

// ============================================================================
// Types
// ============================================================================

export interface RewriteBulletPointRequest {
  original: string;
  context?: string;
  industry?: string;
}

export interface RewriteBulletPointResponse {
  rewritten: string;
}

export interface RewriteSectionRequest {
  section_text: string;
  job_description?: string;
  context?: string;
}

export interface RewriteSectionResponse {
  rewritten: string;
}

// ============================================================================
// Rewrite Service
// ============================================================================

class RewriteService {
  /**
   * Rewrite a single bullet point to be more impactful and ATS-friendly
   * Endpoint: POST /api/v1/rewrite/bullet-point
   */
  async rewriteBulletPoint(data: RewriteBulletPointRequest): Promise<RewriteBulletPointResponse> {
    return apiClient.post<RewriteBulletPointResponse>('/rewrite/bullet-point', {
      original: data.original,
      context: data.context || '',
      industry: data.industry || '',
    });
  }

  /**
   * Rewrite an entire resume section
   * Endpoint: POST /api/v1/rewrite/section
   */
  async rewriteSection(data: RewriteSectionRequest): Promise<RewriteSectionResponse> {
    return apiClient.post<RewriteSectionResponse>('/rewrite/section', {
      section_text: data.section_text,
      job_description: data.job_description || '',
      context: data.context || '',
    });
  }
}

// Export singleton instance
export const rewriteService = new RewriteService();

