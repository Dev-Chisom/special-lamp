"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react"
import { ApplyFlow } from "./apply-flow"
import type { IngestedJobResponse } from "@/services/job.service"

export type ApplyButtonState = 
  | "apply"
  | "applying"
  | "waiting_for_user"
  | "applied"
  | "failed"

interface ApplyWithAgentButtonProps {
  jobId: string
  jobTitle?: string
  companyName?: string
  resumeId?: string
  coverLetterId?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onStatusChange?: (status: ApplyButtonState, applicationId?: string) => void
  initialStatus?: ApplyButtonState
  applicationId?: string
  job?: IngestedJobResponse | any // Full job object for the apply flow
}

export function ApplyWithAgentButton({
  jobId,
  jobTitle,
  companyName,
  resumeId,
  coverLetterId,
  variant = "default",
  size = "default",
  className = "",
  onStatusChange,
  initialStatus = "apply",
  applicationId,
  job,
}: ApplyWithAgentButtonProps) {
  const [status, setStatus] = useState<ApplyButtonState>(initialStatus)
  const [showApplyFlow, setShowApplyFlow] = useState(false)

  const handleApply = () => {
    // Show the apply flow modal
    setShowApplyFlow(true)
  }

  const handleFlowCancel = () => {
    setShowApplyFlow(false)
  }

  // Build job object for the flow
  const jobData = job || {
    id: jobId,
    job_title: jobTitle,
    company_name: companyName,
  }

  const getButtonContent = () => {
    switch (status) {
      case "applying":
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Applying...
          </>
        )
      case "waiting_for_user":
        return (
          <>
            <Clock className="h-4 w-4 mr-2" />
            Waiting for you
          </>
        )
      case "applied":
        return (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Applied
          </>
        )
      case "failed":
        return (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            Failed
          </>
        )
      default:
        return (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Apply with Agent
          </>
        )
    }
  }

  const isDisabled = status === "applying" || status === "applied"

  return (
    <>
      <Button
        variant={status === "failed" ? "destructive" : variant}
        size={size}
        className={className}
        onClick={handleApply}
        disabled={isDisabled}
      >
        {getButtonContent()}
      </Button>
      
      {showApplyFlow && (
        <ApplyFlow
          job={jobData}
          onCancel={handleFlowCancel}
        />
      )}
    </>
  )
}
