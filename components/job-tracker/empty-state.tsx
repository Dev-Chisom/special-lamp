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
import { Briefcase, Upload, /* Linkedin, */ Search, FileText } from "lucide-react"
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
    <div className="flex-1 flex items-center justify-center py-6 sm:py-8 md:py-10 px-4 sm:px-6 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
            Start Tracking Your Job Applications
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Get personalized job recommendations by uploading your resume. 
            Our AI will match you with jobs based on your skills and experience.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Upload Resume Card */}
          <Card className="group relative overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-semibold">Upload Your Resume</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Let PathForge AI match you with jobs using your resume and experiences, not just job titles or keywords.
                  </p>
                </div>
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
                  className="w-full mt-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  size="default"
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
            </CardContent>
          </Card>

          {/* Scan LinkedIn Card - TEMPORARILY DISABLED */}
          {/* <Card className="group relative overflow-hidden border hover:border-blue-500/50 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Linkedin className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-semibold">Scan LinkedIn Profile</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Import your LinkedIn profile to get personalized job recommendations based on your experience.
                  </p>
                </div>
                <Link href="/dashboard/linkedin-scan" className="w-full">
                  <Button variant="outline" className="w-full mt-1" size="default">
                    <Linkedin className="h-4 w-4 mr-2" />
                    Scan LinkedIn
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card> */}

          {/* Browse Jobs Card */}
          <Card className="group relative overflow-hidden border hover:border-emerald-500/50 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Search className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-semibold">Browse Jobs</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Explore thousands of job opportunities and save the ones that interest you.
                  </p>
                </div>
                <Link href="/dashboard/find-jobs" className="w-full">
                  <Button variant="outline" className="w-full mt-1" size="default">
                    <Search className="h-4 w-4 mr-2" />
                    Find Jobs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

