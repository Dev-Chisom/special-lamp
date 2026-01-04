// Use backend status values
export type JobStatus = "saved" | "applied" | "interviewing" | "offered" | "rejected"

export interface JobApplication {
  id: string
  company: string
  position: string
  location: string
  status: JobStatus
  jobUrl?: string
  salary?: string
  appliedDate?: string
  matchScore?: "LOW" | "MEDIUM" | "HIGH"
  jobDescription?: string
  resume?: string
  coverLetter?: string
  interviews?: Interview[]
  notes?: string
}

export interface Interview {
  id: string
  type: string
  name: string
  date: string
  phone?: string
  email?: string
  meetingLink?: string
  description?: string
}

export interface JobListing {
  id: string
  company: string
  title: string
  location: string
  posted: string
  url?: string
  description?: string
}

