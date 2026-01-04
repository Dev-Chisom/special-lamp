/**
 * Dashboard Service
 * Handles dashboard API calls
 */

import { apiClient } from './api-client';

// ============================================================================
// Types
// ============================================================================

export interface LatestScan {
  id: string;
  overall_score: number;
  keyword_match_score: number;
  formatting_score: number;
  content_score: number;
  created_at: string;
}

export interface UsageStatsItem {
  used: number;
  limit: number | null; // null = unlimited
  remaining: number | null; // null if unlimited
}

export interface UsageStats {
  resume_scans: UsageStatsItem;
  ai_rewrites: UsageStatsItem;
  cover_letters: UsageStatsItem;
  interviews: UsageStatsItem;
}

export interface RecommendedJobItem {
  id: string;
  title: string;
  company?: string;
  location?: string;
  location_type?: string; // remote, hybrid, onsite
  salary_range?: string;
  match_score?: number;
  external_url?: string;
}

export interface RecentActivityItem {
  type: 'scan' | 'application' | 'job' | 'cover_letter';
  id: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    score?: number;
    status?: string;
    job_title?: string;
    company?: string;
    [key: string]: any;
  };
}

export interface ApplicationListItem {
  id: string;
  status: string;
  job_title?: string;
  company?: string;
  progress_percentage?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardResponse {
  latest_scan: LatestScan | null;
  usage_stats: UsageStats;
  recommended_jobs: RecommendedJobItem[];
  recent_activity: RecentActivityItem[];
  applications: ApplicationListItem[];
}

// ============================================================================
// Dashboard Service
// ============================================================================

class DashboardService {
  /**
   * Get complete dashboard data
   * Endpoint: GET /api/v1/dashboard
   */
  async getDashboard(params?: {
    recommended_jobs_limit?: number;
    recent_activity_limit?: number;
    applications_limit?: number;
  }): Promise<DashboardResponse> {
    const queryParams = new URLSearchParams();
    if (params?.recommended_jobs_limit) {
      queryParams.append('recommended_jobs_limit', params.recommended_jobs_limit.toString());
    }
    if (params?.recent_activity_limit) {
      queryParams.append('recent_activity_limit', params.recent_activity_limit.toString());
    }
    if (params?.applications_limit) {
      queryParams.append('applications_limit', params.applications_limit.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/dashboard${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<DashboardResponse>(endpoint);
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

