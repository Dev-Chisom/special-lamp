import type { JobResponse, IngestedJobResponse } from "@/services/job.service"
import type { JobApplication, JobListing, JobStatus } from "./types"

// Helper function to map backend JobResponse to frontend JobApplication
export function mapJobResponseToApplication(job: JobResponse): JobApplication {
  return {
    id: job.id,
    company: job.company,
    position: job.title, // Backend uses 'title', frontend uses 'position'
    location: job.location,
    status: job.status as JobStatus,
    jobUrl: job.external_url,
    salary: job.salary_range,
    appliedDate: job.applied_at ? new Date(job.applied_at).toISOString().split('T')[0] : undefined,
    jobDescription: job.description,
    notes: job.notes || undefined,
    matchScore: job.match_score 
      ? job.match_score >= 80 ? 'HIGH' 
      : job.match_score >= 60 ? 'MEDIUM' 
      : 'LOW'
      : undefined,
  }
}

// Helper function to map backend IngestedJobResponse to frontend JobListing
export function mapIngestedJobToListing(job: IngestedJobResponse): JobListing {
  const postedDate = new Date(job.date_posted)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - postedDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let posted = ""
  if (diffDays === 0) posted = "Today"
  else if (diffDays === 1) posted = "1 day ago"
  else if (diffDays < 7) posted = `${diffDays} days ago`
  else if (diffDays < 30) posted = `${Math.floor(diffDays / 7)} weeks ago`
  else posted = `${Math.floor(diffDays / 30)} months ago`

  return {
    id: job.id,
    title: job.job_title,
    company: job.company_name,
    location: job.location_raw,
    posted,
    url: job.application_url,
    description: job.job_description,
  }
}

export const statusConfig: Record<
  JobStatus,
  { label: string; description: string; color: string }
> = {
  saved: {
    label: "Saved",
    description: "Jobs saved from our chrome extension or the scan report will appear here.",
    color: "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900",
  },
  applied: {
    label: "Applied",
    description: "Application completed. Awaiting response from employer or recruiter.",
    color: "border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900",
  },
  interviewing: {
    label: "Interviewing",
    description: "Invited to interview? Record the interview details and notes here.",
    color: "border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900",
  },
  offered: {
    label: "Offered",
    description: "Interviews completed. Negotiating offer, or waiting for employer response.",
    color: "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900",
  },
  rejected: {
    label: "Rejected",
    description: "No response or rejection. Review and adjust your approach.",
    color: "border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900",
  },
}

