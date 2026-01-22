/**
 * Auto-Apply Preferences Service
 */

import { apiClient } from './api-client'
import type {
  AutoApplyPreferences,
  AutoApplyPreferencesResponse,
  AutoAppliedJob,
} from '@/types/auto-apply'

class AutoApplyPreferencesService {
  /**
   * Get auto-apply preferences
   * Endpoint: GET /api/v1/auto-apply/preferences
   */
  async getPreferences(): Promise<AutoApplyPreferencesResponse> {
    return apiClient.get<AutoApplyPreferencesResponse>('/auto-apply/preferences')
  }

  /**
   * Update auto-apply preferences
   * Endpoint: PUT /api/v1/auto-apply/preferences
   * Note: Backend expects { preferences: {...} } wrapper
   */
  async updatePreferences(
    preferences: Partial<AutoApplyPreferences>
  ): Promise<AutoApplyPreferences> {
    const response = await apiClient.put<{ preferences: AutoApplyPreferences }>(
      '/auto-apply/preferences',
      { preferences }
    )
    
    // Handle different response structures
    if (!response) {
      throw new Error("No response received from server")
    }
    
    // If response already has preferences property
    if ('preferences' in response && response.preferences) {
      return response.preferences
    }
    
    // If response is the preferences object directly
    if ('status' in response || 'skills' in response) {
      return response as AutoApplyPreferences
    }
    
    throw new Error("Invalid response format from server")
  }

  /**
   * Get recent auto-applied jobs
   * Endpoint: GET /api/v1/auto-apply/recent-jobs
   */
  async getRecentJobs(params?: {
    limit?: number
    offset?: number
  }): Promise<{ jobs: AutoAppliedJob[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const queryString = queryParams.toString()
    const endpoint = `/auto-apply/recent-jobs${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get<{ jobs: AutoAppliedJob[]; total: number }>(endpoint)
  }

  /**
   * Toggle auto-apply status
   * Endpoint: PATCH /api/v1/auto-apply/preferences/status
   */
  async updateStatus(status: AutoApplyPreferences['status']): Promise<AutoApplyPreferences> {
    const response = await apiClient.patch<{ preferences: AutoApplyPreferences }>(
      '/auto-apply/preferences/status',
      { status }
    )
    return response.preferences
  }
}

// Export singleton instance
export const autoApplyPreferencesService = new AutoApplyPreferencesService()

