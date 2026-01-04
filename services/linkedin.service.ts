/**
 * LinkedIn Service
 * Handles LinkedIn profile and job scanning API calls
 */

import { apiClient } from './api-client';

export interface LinkedInProfileScan {
  id: string;
  type: 'profile';
  linkedin_url: string;
  profile_data: {
    name: string;
    title?: string;
    company?: string;
    location?: string;
    summary?: string;
    skills?: string[];
    experience?: Array<{
      title: string;
      company: string;
      duration?: string;
      description?: string;
    }>;
    education?: Array<{
      school: string;
      degree?: string;
      field?: string;
      year?: string;
    }>;
  };
  analysis: {
    key_skills?: string[];
    top_keywords?: string[];
    recommendations?: string[];
  };
  created_at: string;
}

export interface LinkedInJobScan {
  id: string;
  type: 'job';
  job_url: string;
  job_data: {
    title: string;
    company?: string;
    location?: string;
    job_type?: string;
    description?: string;
    requirements?: string[];
    skills?: string[];
    posted_date?: string;
    application_count?: number;
  };
  analysis: {
    key_skills?: string[];
    top_keywords?: string[];
    recommended_keywords?: string[];
    requirements_summary?: string;
  };
  created_at: string;
}

export interface LinkedInScanHistory {
  items: Array<{
    id: string;
    type: 'profile' | 'job';
    linkedin_url?: string;
    job_url?: string;
    created_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

class LinkedInService {
  /**
   * Scan a LinkedIn profile
   */
  async scanProfile(linkedinUrl: string): Promise<LinkedInProfileScan> {
    return apiClient.post<LinkedInProfileScan>('/linkedin/scan/profile', {
      linkedin_url: linkedinUrl,
    });
  }

  /**
   * Scan a LinkedIn job posting
   */
  async scanJob(jobUrl: string): Promise<LinkedInJobScan> {
    return apiClient.post<LinkedInJobScan>('/linkedin/scan/job', {
      job_url: jobUrl,
    });
  }

  /**
   * Get scan history
   */
  async getScanHistory(options?: {
    type?: 'profile' | 'job';
    limit?: number;
    offset?: number;
  }): Promise<LinkedInScanHistory> {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    return apiClient.get<LinkedInScanHistory>(`/linkedin/scans?${params.toString()}`);
  }

  /**
   * Get a specific scan result by ID
   */
  async getScanResult(scanId: string): Promise<LinkedInProfileScan | LinkedInJobScan> {
    return apiClient.get<LinkedInProfileScan | LinkedInJobScan>(`/linkedin/scans/${scanId}`);
  }
}

// Export singleton instance
export const linkedinService = new LinkedInService();

