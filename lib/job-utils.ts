/**
 * Job Utility Functions
 * Helper functions for formatting and processing job data
 */

import type { IngestedJobResponse } from "@/services/job.service"
import type { AutoApplyPreferences } from "@/types/auto-apply"

/**
 * Format salary for display
 * @param job - Job object with salary fields
 * @returns Formatted salary string
 */
export function formatSalary(job: {
  salary_min?: number | null
  salary_max?: number | null
  salary_currency?: string | null
  salary_period?: string | null
}): string {
  if (!job.salary_min && !job.salary_max) {
    return "Salary not specified"
  }

  const currency = job.salary_currency === "USD" ? "$" :
                   job.salary_currency === "EUR" ? "€" :
                   job.salary_currency === "GBP" ? "£" :
                   job.salary_currency === "CAD" ? "C$" :
                   job.salary_currency === "AUD" ? "A$" :
                   job.salary_currency || ""

  const period = job.salary_period === "yearly" ? "/year" :
                 job.salary_period === "monthly" ? "/month" :
                 job.salary_period === "hourly" ? "/hour" :
                 job.salary_period === "week" ? "/week" :
                 ""

  if (job.salary_min && job.salary_max) {
    if (job.salary_min === job.salary_max) {
      return `${currency}${job.salary_min.toLocaleString()}${period}`
    }
    return `${currency}${job.salary_min.toLocaleString()} - ${currency}${job.salary_max.toLocaleString()}${period}`
  }

  if (job.salary_min) {
    return `${currency}${job.salary_min.toLocaleString()}+${period}`
  }

  if (job.salary_max) {
    return `Up to ${currency}${job.salary_max.toLocaleString()}${period}`
  }

  return "Salary not specified"
}

/**
 * Check if a job meets salary requirements for auto-apply
 * @param job - Job to check
 * @param preferences - User's auto-apply preferences
 * @returns true if job meets salary requirements
 */
export function meetsSalaryRequirement(
  job: IngestedJobResponse,
  preferences: AutoApplyPreferences
): boolean {
  // If no minimum salary requirement, always pass
  if (!preferences.salary_min) {
    return true
  }

  // If job has no salary info, we can't verify - could be optional or required
  // For now, we'll allow it (backend can handle this)
  if (!job.salary_max && !job.salary_min) {
    return true // Allow jobs without salary info
  }

  // Check if job's maximum salary meets user's minimum requirement
  // We use salary_max because that's what the user would potentially earn
  const jobMaxSalary = job.salary_max || job.salary_min || 0
  
  // Convert currencies if needed (simplified - assumes same currency for now)
  // In production, you'd want proper currency conversion
  if (job.salary_currency && preferences.salary_currency && 
      job.salary_currency !== preferences.salary_currency) {
    // For now, only compare if currencies match
    // TODO: Add currency conversion logic
    return true // Allow if currencies don't match (backend should handle conversion)
  }

  return jobMaxSalary >= preferences.salary_min
}

/**
 * Parse job description into structured sections
 * @param description - Full job description text
 * @returns Object with parsed sections
 */
export function parseJobDescription(description: string): {
  summary: string
  responsibilities: string
  requirements: string
  benefits: string
} {
  const sections = {
    summary: "",
    responsibilities: "",
    requirements: "",
    benefits: ""
  }

  if (!description) {
    return sections
  }

  const lines = description.split('\n')
  let currentSection = 'summary'

  for (const line of lines) {
    const lower = line.toLowerCase().trim()

    // Detect section headers
    if (lower.includes('about') || lower.includes('overview') || lower.includes('summary')) {
      currentSection = 'summary'
    } else if (lower.includes("what you'll do") || lower.includes('responsibilities') || 
               lower.includes('duties') || lower.includes('key responsibilities')) {
      currentSection = 'responsibilities'
    } else if (lower.includes("what you'll need") || lower.includes('requirements') || 
               lower.includes('qualifications') || lower.includes('must have')) {
      currentSection = 'requirements'
    } else if (lower.includes('benefits') || lower.includes('perks') || 
               lower.includes('compensation') || lower.includes('what we offer')) {
      currentSection = 'benefits'
    } else if (line.trim()) {
      // Add to current section
      sections[currentSection as keyof typeof sections] += line + '\n'
    }
  }

  return sections
}
