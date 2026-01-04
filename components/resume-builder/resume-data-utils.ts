/**
 * Utility functions for transforming resume data between frontend and backend formats
 */

import type {
  ResumeBuild,
  PersonalInfo as BackendPersonalInfo,
  Experience as BackendExperience,
  Education as BackendEducation,
} from '@/services/resume.service'

// Frontend format (camelCase)
export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedin: string
}

export interface Experience {
  id: string
  jobTitle: string
  company: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

export interface Education {
  id: string
  school: string
  degree: string
  startYear: string
  endYear: string
  isCurrent: boolean
}

export interface ResumeData {
  personalInfo: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
}

/**
 * Convert backend format to frontend format
 */
export function backendToFrontend(resume: ResumeBuild): ResumeData {
  return {
    personalInfo: {
      firstName: resume.personal_info.first_name || '',
      lastName: resume.personal_info.last_name || '',
      email: resume.personal_info.email || '',
      phone: resume.personal_info.phone || '',
      location: resume.personal_info.location || '',
      linkedin: resume.personal_info.linkedin || '',
    },
    summary: resume.summary || '',
    experience: (resume.experience || []).map((exp) => ({
      id: exp.id || Date.now().toString(),
      jobTitle: exp.job_title || '',
      company: exp.company || '',
      startDate: exp.start_date || '',
      endDate: exp.end_date || '',
      isCurrent: exp.is_current || false,
      description: exp.description || '',
    })),
    education: (resume.education || []).map((edu) => ({
      id: edu.id || Date.now().toString(),
      school: edu.school || '',
      degree: edu.degree || '',
      startYear: edu.start_year || '',
      endYear: edu.end_year || '',
      isCurrent: edu.is_current || false,
    })),
    skills: resume.skills || [],
  }
}

/**
 * Convert frontend format to backend format (for create/update)
 */
export function frontendToBackend(data: ResumeData): {
  personal_info: BackendPersonalInfo
  summary?: string
  experience: Omit<BackendExperience, 'id'>[]
  education: Omit<BackendEducation, 'id'>[]
  skills: string[]
} {
  return {
    personal_info: {
      first_name: data.personalInfo.firstName,
      last_name: data.personalInfo.lastName,
      email: data.personalInfo.email,
      phone: data.personalInfo.phone || undefined,
      location: data.personalInfo.location || undefined,
      linkedin: data.personalInfo.linkedin || undefined,
    },
    summary: data.summary || undefined,
    experience: data.experience.map((exp) => ({
      job_title: exp.jobTitle,
      company: exp.company,
      start_date: exp.startDate,
      end_date: exp.endDate || undefined,
      is_current: exp.isCurrent,
      description: exp.description || undefined,
    })),
    education: data.education.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      start_year: edu.startYear || undefined,
      end_year: edu.endYear || undefined,
      is_current: edu.isCurrent,
    })),
    skills: data.skills,
  }
}

