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
    <div className="flex-1 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 overflow-y-auto">
      <Empty className="w-full max-w-none sm:max-w-4xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase className="h-8 w-8" />
          </EmptyMedia>
          <EmptyTitle className="text-xl sm:text-2xl">Start tracking your job applications</EmptyTitle>
          <EmptyDescription className="text-sm sm:text-base">
            Get personalized job recommendations by uploading your resume or
            scanning your LinkedIn profile. Our AI will match you with jobs based
            on your skills and experience.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="w-full max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full mt-4 sm:mt-6">
            <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg shrink-0">
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Upload Your Resume</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
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
                      className="w-full text-xs sm:text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      size="sm"
                    >
                      {isUploading ? (
                        <>
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Upload Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg shrink-0">
                    <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Scan LinkedIn Profile</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      Import your LinkedIn profile to get personalized job
                      recommendations based on your experience.
                    </p>
                    <Link href="/dashboard/linkedin-scan" className="block">
                      <Button variant="outline" className="w-full text-xs sm:text-sm" size="sm">
                        <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Scan LinkedIn
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer md:col-span-2 lg:col-span-1">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg shrink-0">
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Browse Jobs</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      Explore thousands of job opportunities and save the ones
                      that interest you.
                    </p>
                    <Link href="/dashboard/find-jobs" className="block">
                      <Button variant="outline" className="w-full text-xs sm:text-sm" size="sm">
                        <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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

