/**
 * Scan Service
 * Handles resume scanning and analysis API calls
 */

import { apiClient } from './api-client';

export interface ScanRequest {
  resume_id?: string;
  resume_file?: File;
  job_description: string;
}

export interface RecommendationItem {
  priority: "high" | "medium" | "low";
  action: string;
  impact: string;
  section: string;
}

export interface ScanResult {
  id: string;
  resume_id?: string;
  job_description: string;
  overallScore: number;
  breakdown: {
    atsScore: number;
    semanticScore: number;
    formatScore: number;
    experienceMatch: number;
    educationMatch: number;
  };
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendations: RecommendationItem[];
  created_at: string;
}

export interface ScanHistoryItem {
  id: string;
  resume_id?: string;
  resume_name?: string;
  job_description: string;
  job_title?: string;
  company?: string;
  overall_score: number;
  previous_score?: number;
  score_change?: number;
  keyword_match_score?: number;
  formatting_score?: number;
  content_score?: number;
  improvements?: string[];
  recommendations?: string[];
  created_at: string;
}

export interface ScanStatistics {
  total_scans: number;
  average_score: number;
  improving_count: number;
  declining_count: number;
  stable_count?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ScanHistoryWithStatsResponse {
  items: ScanHistoryItem[];
  statistics: ScanStatistics;
  pagination: PaginationInfo;
}

class ScanService {
  /**
   * Scan a resume against a job description
   */
  async scanResume(data: ScanRequest): Promise<ScanResult> {
    if (data.resume_file) {
      const formData = new FormData();
      formData.append('job_description', data.job_description);
      formData.append('resume_file', data.resume_file);

      return apiClient.post<ScanResult>('/scan', formData);
    }

    return apiClient.post<ScanResult>('/scan', {
      resume_id: data.resume_id,
      job_description: data.job_description,
    });
  }

  /**
   * Get scan history (simplified - returns array)
   * Endpoint: GET /api/v1/scan
   */
  async getScanHistory(): Promise<ScanHistoryItem[]> {
    return apiClient.get<ScanHistoryItem[]>('/scan');
  }

  /**
   * Get scan history with statistics, resume names, and improvements
   * Endpoint: GET /api/v1/scan/history
   */
  async getScanHistoryWithStats(params?: {
    page?: number;
    page_size?: number;
    resume_id?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ScanHistoryWithStatsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.resume_id) queryParams.append('resume_id', params.resume_id);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    
    const queryString = queryParams.toString();
    const endpoint = `/scan/history${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ScanHistoryWithStatsResponse>(endpoint);
  }

  /**
   * Get a specific scan result by ID
   */
  async getScanResult(id: string): Promise<ScanResult> {
    return apiClient.get<ScanResult>(`/scan/${id}`);
  }
}

// Export singleton instance
export const scanService = new ScanService();

