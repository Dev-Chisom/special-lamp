"use client"

import { useState, useEffect } from "react"
import { resumeService } from "@/services/resume.service"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, RefreshCw, FileText } from "lucide-react"
import type { Resume } from "@/services/resume.service"

interface ResumeTailorStepProps {
  resume: Resume
  job: any
  onTailored: (resume: Resume) => void
  onSkip: () => void
  onCancel: () => void
}

export function ResumeTailorStep({
  resume,
  job,
  onTailored,
  onSkip,
  onCancel,
}: ResumeTailorStepProps) {
  const [tailoring, setTailoring] = useState(false)
  const [tailoredResume, setTailoredResume] = useState<Resume | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-tailor on mount
  useEffect(() => {
    tailorResume()
  }, [])

  const tailorResume = async () => {
    setTailoring(true)
    setError(null)

    try {
      // Detect if this is a built resume (has 'name' and 'personal_info') or file-based (has 'title' and 'file_url')
      const isBuiltResume = 'name' in resume && 'personal_info' in resume

      // Extract job information
      const jobDescription = (job as any).description_snippet || (job as any).job_description || ""
      const jobTitle = (job as any).job_title || (job as any).title
      const companyName = (job as any).company_name || (job as any).company

      if (!jobTitle || !companyName) {
        throw new Error("Job title and company are required for tailoring")
      }

      // Prepare request
      const request: {
        job_id?: string;
        ingested_job_id?: string;
        job_description?: string;
        job_title: string;
        company: string;
      } = {
        job_title: jobTitle,
        company: companyName,
      }

      // Add optional fields
      if ((job as any).id) {
        // Check if it's an ingested job ID (from job search) or saved job ID
        // Ingested jobs typically have specific structure, but we'll use ingested_job_id for job search results
        request.ingested_job_id = (job as any).id
      }
      if (jobDescription) {
        request.job_description = jobDescription
      }

      // Call the API with 60 second timeout
      const tailored = await resumeService.tailorResumeToJob(
        resume.id,
        request,
        isBuiltResume
      )
      
      // Set the tailored resume (convert ResumeBuild to Resume if needed for type compatibility)
      setTailoredResume(tailored as Resume)
      toast.success("Resume tailored successfully!")
      
    } catch (error: any) {
      console.error("Failed to tailor resume:", error)
      const errorMessage = error?.message || error?.detail || "Failed to tailor resume"
      setError(errorMessage)
      toast.error("Failed to tailor resume. You can proceed with the original resume.")
      // On error, allow user to proceed with original (they can use "Use Original Resume" button)
    } finally {
      setTailoring(false)
    }
  }

  const handleApprove = () => {
    if (tailoredResume) {
      onTailored(tailoredResume)
    } else {
      onTailored(resume)
    }
  }

  const jobTitle = (job as any).job_title || (job as any).title || "this position"
  const companyName = (job as any).company_name || (job as any).company || "this company"

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Tailored Resume
          </DialogTitle>
          <DialogDescription>
            We've optimized your resume for the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong>. Review the changes below.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {tailoring ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Tailoring your resume with AI...
              </p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={tailorResume} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : tailoredResume ? (
            <Tabs defaultValue="tailored" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tailored">Tailored Resume</TabsTrigger>
                <TabsTrigger value="original">Original Resume</TabsTrigger>
                <TabsTrigger value="info">About Tailoring</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tailored" className="mt-4 space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">{tailoredResume.file_name || "Resume"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This resume has been optimized for the job requirements.
                  </p>
                  {/* TODO: Display tailored resume preview when backend provides it */}
                  <div className="mt-4 p-4 bg-background border rounded-md">
                    <p className="text-sm text-muted-foreground italic">
                      Resume preview will be displayed here when tailoring is implemented.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="original" className="mt-4 space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      {(resume as any).file_name || (resume as any).title || (resume as any).name || "Original Resume"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your original resume file.
                  </p>
                  <div className="mt-4 p-4 bg-background border rounded-md">
                    <p className="text-sm text-muted-foreground italic">
                      Original resume preview will be displayed here.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="mt-4 space-y-4">
                <div className="space-y-3 text-sm">
                  <p>
                    Our AI tailoring process optimizes your resume by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>Emphasizing relevant skills and experience</li>
                    <li>Rewriting bullet points to match job requirements</li>
                    <li>Adding relevant keywords from the job description</li>
                    <li>Highlighting achievements that align with the role</li>
                  </ul>
                  <p className="text-muted-foreground">
                    You can review the changes in the "Tailored Resume" tab or proceed with your original resume.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Use Original Resume
          </Button>
          {tailoredResume && (
            <>
              <Button variant="outline" onClick={tailorResume}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={handleApprove}>
                Use This Resume & Continue
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

