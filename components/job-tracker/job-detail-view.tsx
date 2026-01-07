"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, Archive } from "lucide-react"
import { toast } from "sonner"
import type { JobApplication } from "./types"

interface JobDetailViewProps {
  job: JobApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (job: JobApplication) => void
  onDelete: (id: string) => void
  isReadOnly?: boolean
  onSaveToTracker?: (job: JobApplication) => void
}

export function JobDetailView({
  job,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isReadOnly = false,
  onSaveToTracker,
}: JobDetailViewProps) {
  const router = useRouter()
  const [editedJob, setEditedJob] = useState<JobApplication | null>(null)

  useEffect(() => {
    if (job) {
      setEditedJob({ ...job })
    }
  }, [job])

  if (!job || !editedJob) return null

  const handleSave = () => {
    if (editedJob) {
      onSave(editedJob)
      toast.success("Job updated successfully")
      if (!isReadOnly) {
        onOpenChange(false)
      }
    }
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job?")) {
      onDelete(job.id)
      toast.success("Job deleted successfully")
      onOpenChange(false)
    }
  }

  const handleScan = () => {
    // Navigate to scan page with job context
    const jobDescription = job.description || job.requirements || ""
    router.push(`/dashboard/scan?jobId=${job.id}&jobDescription=${encodeURIComponent(jobDescription)}`)
    onOpenChange(false) // Close the detail view
  }

  const handleApply = () => {
    if (job.jobUrl) {
      window.open(job.jobUrl, "_blank")
    } else {
      toast.error("Job URL not available")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3 pr-8">
            {job.matchScore && (
              <Badge
                variant="secondary"
                className={
                  job.matchScore === "LOW"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    : job.matchScore === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                }
              >
                {job.matchScore}
              </Badge>
            )}
            <div>
              <SheetTitle className="text-left">{job.position}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Job Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {job.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Full-time</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleScan} variant="outline">
              Scan
            </Button>
            <Button onClick={() => toast.info("Job saved")} variant="outline">
              Save Job
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>

          {/* Job Description */}
          {job.jobDescription ? (
            <div className="pt-6">
              <h3 className="font-semibold mb-4 text-lg">Job Description</h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="text-sm text-foreground leading-relaxed">
                  {job.jobDescription.split(/\n\s*\n/).map((paragraph, index) => {
                    const trimmed = paragraph.trim()
                    if (!trimmed) return null
                    
                    // Check if paragraph starts with bullet points or numbered lists
                    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
                      const lines = trimmed.split('\n').filter(line => line.trim())
                      return (
                        <ul key={index} className="list-disc list-inside mb-4 space-y-2 ml-4">
                          {lines.map((line, lineIndex) => {
                            const cleanLine = line.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '').trim()
                            return cleanLine ? <li key={lineIndex} className="mb-1">{cleanLine}</li> : null
                          })}
                        </ul>
                      )
                    }
                    
                    // Check if it's a heading (all caps or starts with specific patterns)
                    if (trimmed === trimmed.toUpperCase() && trimmed.length < 100 && !trimmed.includes('.')) {
                      return <h4 key={index} className="font-semibold text-base mb-3 mt-4">{trimmed}</h4>
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={index} className="mb-4">
                        {paragraph.split('\n').map((line, lineIndex, arr) => (
                          <span key={lineIndex}>
                            {line.trim()}
                            {lineIndex < arr.length - 1 && line.trim() && <br />}
                          </span>
                        ))}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-6">
              <h3 className="font-semibold mb-4 text-lg">Job Description</h3>
              <p className="text-sm text-muted-foreground">No job description available.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-6 mt-6 border-t">
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

