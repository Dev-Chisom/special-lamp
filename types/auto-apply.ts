/**
 * Auto-Apply Preferences Types
 * Updated to match backend API schema
 */

export type AutoApplyStatus = 'active' | 'paused' | 'disabled'

export type JobType = 'remote' | 'hybrid' | 'onsite'

export type EmploymentType = 'full_time' | 'contract' | 'freelance' | 'part_time' | 'internship'

export type ExperienceLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'

// Backend uses simple arrays of strings, but we'll keep internal types for UI convenience
export interface JobTitlePreference {
  id: string
  title: string
  priority: number // Lower number = higher priority (UI only, not sent to backend)
}

export interface LocationPreference {
  id: string
  location: string
  type: 'country' | 'city' | 'remote_only' // UI only, not sent to backend
}

// Backend schema matches this structure
export interface AutoApplyPreferences {
  id?: string
  user_id?: string
  status: AutoApplyStatus
  require_review_before_submission: boolean

  // Job Preferences (backend expects string arrays)
  preferred_job_titles: string[]
  job_types: JobType[]
  employment_types: EmploymentType[]
  preferred_locations: string[]

  // Salary & Seniority
  salary_min?: number | null
  salary_max?: number | null
  salary_currency: Currency // Backend uses 'salary_currency', not 'currency'
  experience_levels: ExperienceLevel[]

  // Skills & Matching (backend uses string array for skills, boolean for skills_required)
  skills: string[]
  skills_required: boolean // Backend uses this instead of per-skill weights
  match_confidence_threshold: number // 70-100

  // Safety Controls
  max_applications_per_day: number
  max_applications_per_week: number

  created_at?: string
  updated_at?: string
}

// Backend response format
export interface AutoAppliedJob {
  id: string
  job_title: string
  company_name: string
  application_url?: string
  status: 'submitted' | 'failed' | 'aborted' | 'pending'
  confidence_score: number | null
  resume_id: string
  resume_name: string
  error_reason: string | null // Error message for failed/aborted applications
  created_at: string
  finished_at: string | null
}

export interface AutoApplyStats {
  total_auto_applied: number
  successful_applications: number
  failed_applications: number
  applications_today: number
  applications_this_week: number
}

export interface AutoApplyPreferencesResponse {
  preferences: AutoApplyPreferences
  recent_auto_applied_jobs: AutoAppliedJob[]
  stats: AutoApplyStats
}

export interface AutoAppliedJobsListResponse {
  jobs: AutoAppliedJob[]
  total: number
}

