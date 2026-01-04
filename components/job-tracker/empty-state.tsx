"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty"
import { Briefcase, Upload, Linkedin, Search, FileText } from "lucide-react"
import { toast } from "sonner"
import { resumeService } from "@/services/resume.service"
import { jobService } from "@/services/job.service"
import { mapIngestedJobToListing } from "./utils"
import type { JobListing } from "./types"

interface EmptyStateProps {
  onJobListingsUpdate?: (listings: JobListing[]) => void
}

export function EmptyState({ onJobListingsUpdate }: EmptyStateProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      await resumeService.uploadResume({ file })
      toast.success("Resume uploaded successfully! Fetching job recommendations...")

      // After resume upload, search for jobs (backend doesn't have a dedicated recommendations endpoint)
      // We'll search with empty query to get fresh/relevant jobs
      try {
        const response = await jobService.searchJobs({
          query: "", // Empty query to get general job listings
          page: 1,
          page_size: 20,
        })
        const mappedListings = response.items.map(mapIngestedJobToListing)
        if (onJobListingsUpdate) {
          onJobListingsUpdate(mappedListings)
        }
        toast.success(`Found ${response.items.length} job opportunities`)
      } catch (searchError: any) {
        console.error("Failed to fetch job recommendations:", searchError)
        // Don't show error toast here, just log it - resume upload was successful
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Resume upload error:", error)
      toast.error(error?.message || "Failed to upload resume. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-8 md:py-12 px-4 overflow-y-auto">
      <Empty className="max-w-4xl w-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase className="h-8 w-8" />
          </EmptyMedia>
          <EmptyTitle>Start tracking your job applications</EmptyTitle>
          <EmptyDescription>
            Get personalized job recommendations by uploading your resume or
            scanning your LinkedIn profile. Our AI will match you with jobs based
            on your skills and experience.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Upload Your Resume</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Let PathForge AI match you with jobs using your resume and
                      experiences, not just job titles or keywords.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="resume-upload"
                      disabled={isUploading}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <FileText className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Linkedin className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Scan LinkedIn Profile</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Import your LinkedIn profile to get personalized job
                      recommendations based on your experience.
                    </p>
                    <Link href="/dashboard/linkedin-scan">
                      <Button variant="outline" className="w-full">
                        <Linkedin className="h-4 w-4 mr-2" />
                        Scan LinkedIn
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <Search className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Browse Jobs</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore thousands of job opportunities and save the ones
                      that interest you.
                    </p>
                    <Link href="/dashboard/find-jobs">
                      <Button variant="outline" className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Find Jobs
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}

