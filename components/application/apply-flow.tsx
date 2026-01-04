"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { resumeService } from "@/services/resume.service"
import { applicationService } from "@/services/application.service"
import { toast } from "sonner"
import type { Resume } from "@/services/resume.service"
import type { IngestedJobResponse } from "@/services/job.service"
import { ResumeUploadStep } from "./resume-upload-step"
import { ResumeSelectionStep } from "./resume-selection-step"
import { ResumeTailorStep } from "./resume-tailor-step"
import { AutoApplyConfirmation } from "./auto-apply-confirmation"

export type ApplyFlowStep = 'check' | 'upload' | 'select' | 'tailor' | 'confirm'

interface ApplyFlowProps {
  job: IngestedJobResponse | { id: string; job_title?: string; title?: string; company_name?: string; company?: string; description_snippet?: string; job_description?: string }
  onCancel: () => void
}

export function ApplyFlow({ job, onCancel }: ApplyFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<ApplyFlowStep>('check')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [tailoredResume, setTailoredResume] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkResumes()
  }, [])

  const checkResumes = async () => {
    try {
      setIsLoading(true)
      const userResumes = await resumeService.getResumes()
      setResumes(userResumes)

      if (userResumes.length === 0) {
        setStep('upload')
      } else {
        // Check for primary resume
        const primary = userResumes.find(r => (r as any).is_primary)
        if (primary) {
          setSelectedResume(primary)
          setStep('tailor')
        } else {
          // Use first resume as default, but allow selection
          if (userResumes.length === 1) {
            setSelectedResume(userResumes[0])
            setStep('tailor')
          } else {
            setStep('select')
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to check resumes:", error)
      toast.error("Failed to load resumes. Please try again.")
      onCancel()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeUploaded = (resume: Resume) => {
    setSelectedResume(resume)
    setStep('tailor')
  }

  const handleResumeSelected = (resume: Resume) => {
    setSelectedResume(resume)
    setStep('tailor')
  }

  const handleTailored = (resume: Resume) => {
    setTailoredResume(resume)
    setStep('confirm')
  }

  const handleSkipTailoring = () => {
    if (selectedResume) {
      setTailoredResume(selectedResume)
      setStep('confirm')
    }
  }

  const handleConfirm = async (consentText: string) => {
    if (!tailoredResume) {
      toast.error("No resume selected")
      return
    }

    try {
      const jobId = (job as IngestedJobResponse).id || job.id
      const response = await applicationService.startApplication({
        job_id: jobId,
        resume_id: tailoredResume.id,
        user_consent: true,
        consent_text: consentText || `I authorize PathForge AI to assist me in applying for the ${(job as IngestedJobResponse).job_title || (job as any).title || "job"} position.`,
        external_url: (job as IngestedJobResponse).application_url,
      })

      // Navigate to application status page
      const appId = (response as any).id || (response as any).application_id
      if (appId) {
        router.push(`/dashboard/applications/${appId}`)
        toast.success("Application started! Redirecting to application progress...")
      } else {
        toast.error("Failed to start application: Application ID not found")
      }
    } catch (error: any) {
      console.error("Failed to start application:", error)
      toast.error(error?.message || "Failed to start application. Please try again.")
    }
  }

  if (isLoading) {
    return null // Or show loading spinner
  }

  return (
    <>
      {step === 'upload' && (
        <ResumeUploadStep
          job={job}
          onResumeUploaded={handleResumeUploaded}
          onCancel={onCancel}
        />
      )}

      {step === 'select' && resumes.length > 0 && (
        <ResumeSelectionStep
          resumes={resumes}
          job={job}
          onResumeSelected={handleResumeSelected}
          onCancel={onCancel}
        />
      )}

      {step === 'tailor' && selectedResume && (
        <ResumeTailorStep
          resume={selectedResume}
          job={job}
          onTailored={handleTailored}
          onSkip={handleSkipTailoring}
          onCancel={onCancel}
        />
      )}

      {step === 'confirm' && tailoredResume && (
        <AutoApplyConfirmation
          resume={tailoredResume}
          job={job}
          onConfirm={handleConfirm}
          onCancel={onCancel}
        />
      )}
    </>
  )
}

