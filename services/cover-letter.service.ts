/**
 * Cover Letter Service
 * Handles cover letter generation and management API calls
 */

import { apiClient } from './api-client';

// ============================================================================
// Types
// ============================================================================

export interface CoverLetter {
  id: string;
  user_id: string;
  job_id?: string | null;
  title: string;
  content: string;
  tone: 'formal' | 'professional' | 'friendly' | 'casual';
  created_at?: string;
  updated_at?: string;
}

export interface GenerateCoverLetterRequest {
  resume_id: string;
  job_description: string;
  company: string;
  role: string;
  tone?: 'formal' | 'professional' | 'friendly' | 'casual';
  job_id?: string;
}

export interface UpdateCoverLetterRequest {
  content: string;
}

// ============================================================================
// Cover Letter Service
// ============================================================================

class CoverLetterService {
  /**
   * Generate a personalized cover letter using AI
   * Endpoint: POST /api/v1/cover-letter/generate
   */
  async generateCoverLetter(data: GenerateCoverLetterRequest): Promise<CoverLetter> {
    return apiClient.post<CoverLetter>('/cover-letter/generate', {
      resume_id: data.resume_id,
      job_description: data.job_description,
      company: data.company,
      role: data.role,
      tone: data.tone || 'professional',
      job_id: data.job_id,
    });
  }

  /**
   * List all cover letters for the current user
   * Endpoint: GET /api/v1/cover-letter
   */
  async getCoverLetters(): Promise<CoverLetter[]> {
    return apiClient.get<CoverLetter[]>('/cover-letter');
  }

  /**
   * Get a specific cover letter by ID
   * Endpoint: GET /api/v1/cover-letter/{cover_letter_id}
   */
  async getCoverLetter(id: string): Promise<CoverLetter> {
    return apiClient.get<CoverLetter>(`/cover-letter/${id}`);
  }

  /**
   * Update a cover letter's content
   * Endpoint: PUT /api/v1/cover-letter/{cover_letter_id}
   * Now accepts JSON body: { "content": "..." }
   */
  async updateCoverLetter(id: string, data: UpdateCoverLetterRequest): Promise<CoverLetter> {
    return apiClient.put<CoverLetter>(`/cover-letter/${id}`, {
      content: data.content,
    });
  }

  /**
   * Delete a cover letter
   * Endpoint: DELETE /api/v1/cover-letter/{cover_letter_id}
   */
  async deleteCoverLetter(id: string): Promise<void> {
    return apiClient.delete<void>(`/cover-letter/${id}`);
  }
}

// Export singleton instance
export const coverLetterService = new CoverLetterService();

