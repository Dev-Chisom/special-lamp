"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ApplyWithAgentButton } from "@/components/application/apply-with-agent-button"
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  ExternalLink,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Target,
  TrendingUp,
  MapPin as LocationIcon,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { jobService, type IngestedJobResponse } from "@/services/job.service"
import { mapIngestedJobToListing } from "@/components/job-tracker/utils"
import type { JobListing } from "@/components/job-tracker/types"
import { formatSalary } from "@/lib/job-utils"


export function FindJobsInterface() {
  const router = useRouter()
  const [jobs, setJobs] = useState<IngestedJobResponse[]>([])
  const [selectedJob, setSelectedJob] = useState<IngestedJobResponse | null>(null)
  const [isLoadingJobDetails, setIsLoadingJobDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [dateRange, setDateRange] = useState<string>("any")
  const [jobType, setJobType] = useState<string>("all")
  const [remoteOption, setRemoteOption] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>("relevance")
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const pageSize = 12

  // Debounce search
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const prevFiltersRef = useRef<string>("")

  useEffect(() => {
    // Check if filters changed (excluding page)
    const currentFilters = `${searchQuery}|${location}|${dateRange}|${jobType}|${remoteOption}|${sortBy}`
    const filtersChanged = prevFiltersRef.current && prevFiltersRef.current !== currentFilters
    
    // Reset to page 1 when filters change
    if (filtersChanged) {
      if (currentPage !== 1) {
        prevFiltersRef.current = currentFilters
        setCurrentPage(1)
        return // Exit early, will refetch when currentPage updates to 1
      }
      // If already on page 1, update ref and continue to fetch
      prevFiltersRef.current = currentFilters
    } else if (!prevFiltersRef.current) {
      // First render - initialize the ref
      prevFiltersRef.current = currentFilters
    }

    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const params: any = {
          query: searchQuery || undefined,
          location: location || undefined,
          employment_type: jobType !== "all" ? (jobType as any) : undefined,
          page: currentPage,
          page_size: pageSize,
        }

        // Handle remote/hybrid/onsite filter
        // Note: Backend might not support location_type filtering yet, so we'll filter client-side for hybrid/onsite
        if (remoteOption === "remote") {
          params.remote_only = true
        } else if (remoteOption === "all") {
          // Don't set remote_only - show all
        } else {
          // For hybrid/onsite, we can't filter on backend yet, so we'll need to do client-side
          // For now, just don't set remote_only (show all, then filter client-side)
          // TODO: Add location_type parameter to backend API
        }

        // Add date range filter
        if (dateRange !== "any") {
          const now = new Date()
          if (dateRange === "past24h") {
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            params.date_from = yesterday.toISOString().split("T")[0]
          } else if (dateRange === "pastWeek") {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            params.date_from = lastWeek.toISOString().split("T")[0]
          } else if (dateRange === "pastMonth") {
            const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            params.date_from = lastMonth.toISOString().split("T")[0]
          }
        }

        const response = await jobService.searchJobs(params)
        let filteredJobs = response.items || []

        // Client-side filtering for hybrid/onsite (until backend supports location_type)
        if (remoteOption === "hybrid") {
          filteredJobs = filteredJobs.filter(job => job.location_type === "hybrid")
        } else if (remoteOption === "onsite") {
          filteredJobs = filteredJobs.filter(job => job.location_type === "onsite")
        }

        // Client-side sorting (until backend supports sort_by parameter)
        if (sortBy === "recent") {
          filteredJobs.sort((a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime())
        } else if (sortBy === "salary") {
          // Note: Salary sorting requires salary data which might not be available
          // For now, just keep original order
        }
        // "relevance" keeps original order

        setJobs(filteredJobs)
        // Update total to reflect filtered results
        const total = remoteOption === "all" || remoteOption === "remote" 
          ? (response.total || 0) 
          : filteredJobs.length
        setTotalJobs(total)
        setTotalPages(Math.ceil(total / pageSize))

        // Auto-select first job if available (desktop only, 1210px+)
        if (filteredJobs.length > 0 && !selectedJob && typeof window !== 'undefined' && window.innerWidth >= 1210) {
          setSelectedJob(filteredJobs[0])
        } else if (filteredJobs.length === 0) {
          // Clear selection if no jobs match filters
          setSelectedJob(null)
        }
      } catch (error: any) {
        console.error("Failed to fetch jobs:", error)
        toast.error(error?.message || "Failed to load jobs. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchJobs()
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, location, dateRange, jobType, remoteOption, sortBy, currentPage])

  const handleClearAll = () => {
    setSearchQuery("")
    setLocation("")
    setDateRange("any")
    setJobType("all")
    setRemoteOption("all")
  }

  const hasActiveFilters =
    searchQuery || location || (dateRange !== "any") || (jobType !== "all") || (remoteOption !== "all")

  const formatPostedDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`
    }
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? "s" : ""} ago`
  }

  const renderJobDescription = (description: string) => {
    if (!description) return <p className="text-sm text-muted-foreground">No job description available.</p>
    
    return description.split(/\n\s*\n/).map((paragraph, index) => {
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
    })
  }

  // Fetch full job details when a job is selected
  useEffect(() => {
    const fetchFullJobDetails = async () => {
      if (!selectedJob) return

      // If we already have the full description, no need to fetch
      if (selectedJob.job_description && selectedJob.job_description.length > 500) {
        return
      }

      setIsLoadingJobDetails(true)
      try {
        const fullJobDetails = await jobService.getJobDetails(selectedJob.id)
        // Merge full details with existing job data
        setSelectedJob({
          ...selectedJob,
          ...fullJobDetails,
          // Ensure we use the full description
          job_description: fullJobDetails.job_description || selectedJob.job_description,
        })
      } catch (error: any) {
        console.error("Failed to fetch full job details:", error)
        // Don't show error toast - just use what we have
      } finally {
        setIsLoadingJobDetails(false)
      }
    }

    fetchFullJobDetails()
  }, [selectedJob?.id])

  const handleScan = () => {
    if (selectedJob) {
      // Navigate to scan page with job context - use full description
      const jobDescription = selectedJob.job_description || selectedJob.description_snippet || ""
      router.push(`/dashboard/scan?jobId=${selectedJob.id}&jobDescription=${encodeURIComponent(jobDescription)}`)
    }
  }

  const handleTrack = async () => {
    if (!selectedJob) return

    try {
      // Use the helper method which handles full description and salary
      const createRequest = jobService.ingestedJobToCreateRequest(selectedJob)

      await jobService.saveJob(createRequest)
      toast.success("Job saved to tracker!")
    } catch (error: any) {
      console.error("Failed to save job:", error)
      toast.error(error?.message || "Failed to save job. Please try again.")
    }
  }

  const handleApply = () => {
    if (selectedJob?.application_url) {
      window.open(selectedJob.application_url, "_blank")
    } else {
      toast.error("Job URL not available")
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col xl:flex-row min-h-0 p-4 md:p-6 gap-0">
        {/* Center Column - Job Listings */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold mb-2">Jobs</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Search jobs by title, skill, or qualification
        </p>
      </div>

      {/* Search and Filters */}
          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search jobs by keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Your current location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button className="w-full sm:w-auto px-6 sm:px-8">Search</Button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Date range</SelectItem>
                  <SelectItem value="past24h">Past 24 hours</SelectItem>
                  <SelectItem value="pastWeek">Past week</SelectItem>
                  <SelectItem value="pastMonth">Past month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Job type</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>

              <Select value={remoteOption} onValueChange={setRemoteOption}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Remote option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Remote option</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={handleClearAll} className="w-full sm:w-auto sm:ml-auto">
                  Clear all
              </Button>
              )}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 pr-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Showing {totalJobs > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalJobs)}` : 0} of {totalJobs} jobs sorted by {sortBy === "relevance" ? "match score" : sortBy}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="salary">Highest Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

      {/* Job Listings */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 pr-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </Card>
                ))
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No jobs found. Try adjusting your search criteria.
                </div>
              ) : (
                jobs.map((job) => (
          <Card
            key={job.id}
                    className={`cursor-pointer transition-colors ${
                      selectedJob?.id === job.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setSelectedJob(job)
                      // Scroll to top when job is selected (for desktop view)
                      if (typeof window !== 'undefined' && window.innerWidth >= 1210) {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      } else {
                        // Open sheet on mobile (< 1210px breakpoint)
                        setIsMobileDetailOpen(true)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1">{job.job_title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{job.company_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location_raw}</span>
                        <span>•</span>
                        <span>{formatPostedDate(job.date_posted)}</span>
                      </div>
                      {(job.salary_min || job.salary_max) && (
                        <div className="flex items-center gap-1 text-xs font-medium text-primary mb-2">
                          <span>💰</span>
                          <span>{formatSalary(job)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 pt-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page: number
                    if (totalPages <= 7) {
                      page = i + 1
                    } else if (currentPage <= 4) {
                      page = i + 1
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i
                    } else {
                      page = currentPage - 3 + i
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
                      )}
                    </div>

        {/* Right Column - Job Details */}
        <div className="hidden xl:flex w-[500px] min-w-[500px] border-l bg-background flex flex-col h-full overflow-hidden">
          {selectedJob ? (
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
              {/* Job Header */}
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedJob.job_title}</h2>
                <p className="text-muted-foreground mb-4">{selectedJob.company_name}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedJob.location_raw}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">
                      {selectedJob.employment_type.replace("_", "-")}
                      </span>
                  </div>
                  {selectedJob.seniority_level && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span className="capitalize">{selectedJob.seniority_level}</span>
                    </div>
                  )}
                </div>
                {(selectedJob.salary_min || selectedJob.salary_max) && (
                  <div className="flex items-center gap-2 text-base font-semibold text-primary mb-4 p-3 bg-primary/10 rounded-lg">
                    <span>💰</span>
                    <span>{formatSalary(selectedJob)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={handleScan} variant="outline" className="flex-1">
                    Scan
                  </Button>
                  <Button onClick={handleTrack} variant="outline" className="flex-1">
                    Track
                  </Button>
                  <Button onClick={handleApply} variant="outline" className="flex-1">
                    Apply
                  </Button>
                </div>
                {selectedJob && (
                  <ApplyWithAgentButton
                    jobId={selectedJob.id}
                    jobTitle={selectedJob.job_title}
                    companyName={selectedJob.company_name}
                    job={selectedJob}
                    variant="default"
                    className="w-full"
                  />
                )}
              </div>

              {/* Job Details Section */}
              <div className="space-y-6">
                {/* Salary Information - Already shown in header, but keep for mobile view consistency */}

                {/* Match Score Breakdown */}
                {(selectedJob.match_score !== undefined || 
                  selectedJob.skills_match !== undefined || 
                  selectedJob.role_match !== undefined || 
                  selectedJob.experience_match !== undefined || 
                  selectedJob.education_match !== undefined || 
                  selectedJob.location_match !== undefined) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Match Score</h3>
                    {selectedJob.match_score !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Match</span>
                          <span className="text-lg font-bold text-primary">{Math.round(selectedJob.match_score)}%</span>
                        </div>
                        <Progress value={selectedJob.match_score} className="h-3" />
                      </div>
                    )}
                    {(selectedJob.skills_match !== undefined || 
                      selectedJob.role_match !== undefined || 
                      selectedJob.experience_match !== undefined || 
                      selectedJob.education_match !== undefined || 
                      selectedJob.location_match !== undefined) && (
                      <div className="space-y-3 pt-2 border-t">
                        <p className="text-sm font-medium text-muted-foreground">Breakdown:</p>
                        <div className="space-y-2">
                          {selectedJob.skills_match !== undefined && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <span>Skills Match</span>
                                      </div>
                                      <span className="font-medium">{Math.round(selectedJob.skills_match)}%</span>
                                    </div>
                                    <Progress value={selectedJob.skills_match} className="h-2" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>How well your skills match the job requirements</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {selectedJob.role_match !== undefined && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <span>Role Match</span>
                                      </div>
                                      <span className="font-medium">{Math.round(selectedJob.role_match)}%</span>
                                    </div>
                                    <Progress value={selectedJob.role_match} className="h-2" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>How well your experience aligns with the role</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {selectedJob.experience_match !== undefined && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span>Experience Match</span>
                                      </div>
                                      <span className="font-medium">{Math.round(selectedJob.experience_match)}%</span>
                                    </div>
                                    <Progress value={selectedJob.experience_match} className="h-2" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>How well your years of experience match the requirements</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {selectedJob.education_match !== undefined && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        <span>Education Match</span>
                                      </div>
                                      <span className="font-medium">{Math.round(selectedJob.education_match)}%</span>
                                    </div>
                                    <Progress value={selectedJob.education_match} className="h-2" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Education match considers degree level (Bachelor's, Master's, PhD) and field of study</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {selectedJob.location_match !== undefined && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <LocationIcon className="h-4 w-4 text-muted-foreground" />
                                        <span>Location Match</span>
                                      </div>
                                      <span className="font-medium">{Math.round(selectedJob.location_match)}%</span>
                                    </div>
                                    <Progress value={selectedJob.location_match} className="h-2" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>How well the job location matches your preferences</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills */}
                {(selectedJob.required_skills && selectedJob.required_skills.length > 0) || 
                 (selectedJob.preferred_skills && selectedJob.preferred_skills.length > 0) ? (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Skills</h3>
                    <div className="space-y-3">
                      {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Required:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.required_skills.map((skill, idx) => (
                              <Badge key={idx} variant="default">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedJob.preferred_skills && selectedJob.preferred_skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Preferred:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.preferred_skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Experience & Education */}
                {(selectedJob.years_of_experience_min || selectedJob.years_of_experience_max || selectedJob.education_level) && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Requirements</h3>
                    <div className="space-y-2 text-sm text-foreground">
                      {selectedJob.years_of_experience_min || selectedJob.years_of_experience_max ? (
                        <p>
                          Experience: {selectedJob.years_of_experience_min && selectedJob.years_of_experience_max
                            ? `${selectedJob.years_of_experience_min}-${selectedJob.years_of_experience_max} years`
                            : selectedJob.years_of_experience_min
                            ? `${selectedJob.years_of_experience_min}+ years`
                            : `Up to ${selectedJob.years_of_experience_max} years`}
                        </p>
                      ) : null}
                      {selectedJob.education_level && (
                        <p>Education: {selectedJob.education_level}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Benefits</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                      {selectedJob.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Job Description - Hidden for now */}
                {/* <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Job Description</h3>
                  {isLoadingJobDetails ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="text-sm text-foreground leading-relaxed">
                        {renderJobDescription(selectedJob.job_description || selectedJob.description_snippet || '')}
                      </div>
                    </div>
                  )}
                </div> */}
              </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 h-full">
              <div className="text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a job to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Job Details Sheet */}
        {selectedJob && (
          <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6">
              <SheetHeader className="pb-4 sm:pb-6">
                <SheetTitle className="text-left text-lg sm:text-xl">
                  {selectedJob.job_title}
                </SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedJob.company_name}
                </p>
              </SheetHeader>

              <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* Job Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedJob.location_raw}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">
                      {selectedJob.employment_type.replace("_", "-")}
                    </span>
                  </div>
                  {selectedJob.seniority_level && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span className="capitalize">{selectedJob.seniority_level}</span>
                    </div>
                  )}
                </div>

                {/* Salary - Mobile View */}
                {(selectedJob.salary_min || selectedJob.salary_max) && (
                  <div className="flex items-center gap-2 text-base font-semibold text-primary p-3 bg-primary/10 rounded-lg">
                    <span>💰</span>
                    <span>{formatSalary(selectedJob)}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleScan} variant="outline" className="flex-1">
                      Scan
                    </Button>
                    <Button onClick={handleTrack} variant="outline" className="flex-1">
                      Track
                    </Button>
                    <Button onClick={handleApply} variant="outline" className="flex-1">
                      Apply
                    </Button>
                  </div>
                  {selectedJob && (
                    <ApplyWithAgentButton
                      jobId={selectedJob.id}
                      jobTitle={selectedJob.job_title}
                      companyName={selectedJob.company_name}
                      variant="default"
                      className="w-full"
                    />
                  )}
                </div>

                {/* Job Description - Hidden for now */}
                {/* <div className="space-y-4">
                  <h3 className="font-semibold text-base sm:text-lg">Job Description</h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="text-sm text-foreground leading-relaxed">
                        {isLoadingJobDetails ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ) : (
                        renderJobDescription(selectedJob.job_description || selectedJob.description_snippet || '')
                      )}
                    </div>
                  </div>
                </div> */}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}
