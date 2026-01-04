"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X } from "lucide-react"
import type { Resume } from "@/services/resume.service"

interface ResumeUploadStepProps {
  job: any
  onResumeUploaded: (resume: Resume) => void
  onCancel: () => void
}

export function ResumeUploadStep({
  job,
  onResumeUploaded,
  onCancel,
}: ResumeUploadStepProps) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX file")
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const resume = await resumeService.uploadResume({ file })

      // If this is the first resume, set it as primary
      // Note: Backend might handle this automatically
      toast.success("Resume uploaded successfully!")

      // Resume uploaded → Move to tailor step
      onResumeUploaded(resume)
    } catch (error: any) {
      console.error("Failed to upload resume:", error)
      setError(error?.message || "Failed to upload resume. Please try again.")
      toast.error(error?.message || "Failed to upload resume")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Your Resume</DialogTitle>
          <DialogDescription>
            To apply for this position, please upload your resume first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resume-file">Resume File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="flex-1"
                disabled={uploading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {file && (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-sm">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX (max 10MB)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

