"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, FileText, Building2, Briefcase } from "lucide-react"
import type { Resume } from "@/services/resume.service"
import { formatSalary } from "@/lib/job-utils"
import type { IngestedJobResponse } from "@/services/job.service"

interface AutoApplyConfirmationProps {
  resume: Resume
  job: any
  onConfirm: (consentText: string) => void
  onCancel: () => void
}

export function AutoApplyConfirmation({
  resume,
  job,
  onConfirm,
  onCancel,
}: AutoApplyConfirmationProps) {
  const [consent, setConsent] = useState(false)
  const [consentText, setConsentText] = useState("")

  const handleConfirm = () => {
    if (!consent) {
      return
    }
    onConfirm(consentText)
  }

  const jobTitle = (job as any).job_title || (job as any).title || "this position"
  const companyName = (job as any).company_name || (job as any).company || "this company"
  const location = (job as any).location_raw || (job as any).location || ""
  const hasSalary = (job as IngestedJobResponse).salary_min || (job as IngestedJobResponse).salary_max

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Auto-Apply</DialogTitle>
          <DialogDescription>
            Review the details below and provide your consent to proceed with the automated application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Details
            </h3>
            <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
              <div>
                <p className="font-medium">{jobTitle}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {companyName}
                  </span>
                  {location && (
                    <span>{location}</span>
                  )}
                </div>
                {hasSalary && (
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mt-2">
                    <span>💰</span>
                    <span>{formatSalary(job as IngestedJobResponse)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume
            </h3>
            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm">{resume.file_name || "Resume"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Uploaded {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : ""}
              </p>
            </div>
          </div>

          {/* Consent Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Consent</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  className="mt-1"
                />
                <Label
                  htmlFor="consent"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I consent to automated application submission. I understand that ApplyEngine will fill out the application form, upload my resume, and submit the application on my behalf.
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consent-text" className="text-sm">
                  Optional: Add your consent statement
                </Label>
                <Textarea
                  id="consent-text"
                  placeholder="e.g., I authorize ApplyEngine to assist me in applying for this position..."
                  value={consentText}
                  onChange={(e) => setConsentText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-2">By proceeding, you authorize us to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Fill out the application form on your behalf</li>
                <li>Upload your resume and any required documents</li>
                <li>Submit the application to the employer</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                You may be required to solve CAPTCHAs or provide additional information during the process. You can cancel the application at any time.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!consent}
          >
            Start Auto-Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

