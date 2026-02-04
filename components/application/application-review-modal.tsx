"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Briefcase,
  Building2,
  FileText,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Eye,
  ExternalLink,
} from "lucide-react"
import { applicationService, type ApplicationRun } from "@/services/application.service"
import { jobService, type IngestedJobResponse } from "@/services/job.service"
import { resumeService, type Resume } from "@/services/resume.service"
import { toast } from "sonner"
import { config } from "@/lib/config"

// Extract resume_id from application (could be in log_entries or metadata)
function extractResumeId(app: ApplicationRun): string | null {
  // Check log entries for resume_id
  if (app.log_entries) {
    for (const log of app.log_entries) {
      if (log.step_metadata?.resume_id) {
        return log.step_metadata.resume_id
      }
    }
  }
  // Could also check user_action_required metadata if available
  return null
}

interface ApplicationReviewModalProps {
  application: ApplicationRun
  open: boolean
  onApprove: () => void
  onReject: () => void
  onClose: () => void
}

export function ApplicationReviewModal({
  application,
  open,
  onApprove,
  onReject,
  onClose,
}: ApplicationReviewModalProps) {
  const [job, setJob] = useState<IngestedJobResponse | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [isLoadingJob, setIsLoadingJob] = useState(false)
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // Fetch job details
  useEffect(() => {
    if (!open || !application) return

    const fetchJobDetails = async () => {
      const jobId = application.ingested_job_id || application.job_id
      if (!jobId) return

      setIsLoadingJob(true)
      try {
        // Try to fetch from job-ingestion first (IngestedJobResponse)
        if (application.ingested_job_id) {
          const jobData = await jobService.getJobDetails(application.ingested_job_id)
          setJob(jobData)
        } else if (application.job_id) {
          // Fallback to regular job endpoint
          const jobData = await jobService.getJob(application.job_id)
          const fullDescription = jobData.ingested_job_details?.job_description || jobData.description || ""
          // Convert to IngestedJobResponse format if needed
          setJob({
            id: jobData.id,
            job_title: jobData.title,
            company_name: jobData.company,
            location_raw: jobData.location,
            job_description: fullDescription,
            application_url: jobData.external_url,
          } as IngestedJobResponse)
        }
      } catch (error: any) {
        console.error("Failed to fetch job details:", error)
        // Don't show toast - it's not critical
      } finally {
        setIsLoadingJob(false)
      }
    }

    fetchJobDetails()
  }, [open, application])

  // Fetch resume details if available (from log entries or metadata)
  useEffect(() => {
    if (!open || !application) return

    const fetchResumeDetails = async () => {
      // Try to extract resume_id from log entries or application metadata
      const resumeId = extractResumeId(application)
      if (!resumeId) return

      setIsLoadingResume(true)
      try {
        const resumeData = await resumeService.getResume(resumeId)
        setResume(resumeData)
      } catch (error: any) {
        console.error("Failed to fetch resume details:", error)
        // Don't show toast - it's not critical
      } finally {
        setIsLoadingResume(false)
      }
    }

    fetchResumeDetails()
  }, [open, application])

  const handleApprove = async () => {
    setIsConfirming(true)
    try {
      await applicationService.confirmUserAction(
        application.id,
        application.user_action_required || 'review_approved',
        {
          action: 'approve',
          approved: true,
        }
      )
      toast.success("Application approved! The process will continue.")
      onApprove()
    } catch (error: any) {
      console.error("Failed to approve application:", error)
      toast.error(error?.message || "Failed to approve application. Please try again.")
    } finally {
      setIsConfirming(false)
    }
  }

  const handleReject = async () => {
    setIsConfirming(true)
    try {
      await applicationService.confirmUserAction(
        application.id,
        application.user_action_required || 'review_rejected',
        {
          action: 'reject',
          approved: false,
        }
      )
      toast.success("Application rejected. The process has been cancelled.")
      onReject()
    } catch (error: any) {
      console.error("Failed to reject application:", error)
      toast.error(error?.message || "Failed to reject application. Please try again.")
    } finally {
      setIsConfirming(false)
    }
  }

  const jobTitle = job?.job_title || "Job Application"
  const companyName = job?.company_name || "Company"
  const location = job?.location_raw || ""
  const jobDescription = job?.job_description || ""
  const applicationUrl = job?.application_url || application.user_action_url

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Review Application Before Submission
          </DialogTitle>
          <DialogDescription>
            Please review the application details before it's submitted. You can approve to continue or reject to cancel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingJob ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold text-lg">{jobTitle}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {companyName}
                      </span>
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {location}
                        </span>
                      )}
                    </div>
                  </div>

                  {jobDescription && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Job Description</h4>
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{jobDescription.substring(0, 500)}</p>
                        {jobDescription.length > 500 && <p className="text-xs mt-2">... (truncated)</p>}
                      </div>
                    </div>
                  )}

                  {applicationUrl && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(applicationUrl, '_blank')}
                        className="w-full sm:w-auto"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Job Posting
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Resume Details */}
          {isLoadingResume || resume ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingResume ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : resume ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{resume.file_name || resume.title || "Resume"}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resume.created_at ? `Uploaded ${new Date(resume.created_at).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    {resume.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Append token to file URL for authenticated access
                          const token = typeof window !== 'undefined' 
                            ? localStorage.getItem(config.auth.tokenKeys.accessToken) 
                            : null
                          const displayUrl = token 
                            ? `${resume.file_url}${resume.file_url.includes('?') ? '&' : '?'}token=${token}`
                            : resume.file_url
                          window.open(displayUrl, '_blank')
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Resume details not available</p>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Application Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Waiting for Review
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {application.steps_completed || 0} / {application.total_steps || 0} steps completed
                </span>
              </div>
              {application.current_step && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Step</span>
                    <span className="text-sm font-medium capitalize">
                      {application.current_step.replace(/_/g, ' ')}
                    </span>
                  </div>
                </>
              )}
              {application.started_at && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span className="text-sm font-medium">
                      {new Date(application.started_at).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Warning Alert */}
          <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertTitle className="text-orange-800 dark:text-orange-200">Review Required</AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-300 mt-2">
              <p>
                The application process has been paused for your review. Please review the details above before approving or rejecting the submission.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Approving will continue the application process and submit to the employer</li>
                <li>Rejecting will cancel the application process</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isConfirming}
            className="w-full sm:w-auto"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject & Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isConfirming}
            className="w-full sm:w-auto"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
