"use client"

import { useState, useEffect, useRef } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { jobService } from "@/services/job.service"
import { Column } from "./column"
import { JobDetailView } from "./job-detail-view"
import { JobsPanel } from "./jobs-panel"
import { EmptyState } from "./empty-state"
import {
  statusConfig,
  mapJobResponseToApplication,
  mapIngestedJobToListing,
} from "./utils"
import type { JobApplication, JobListing, JobStatus } from "./types"

export function JobTrackerInterface() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [jobSearchQuery, setJobSearchQuery] = useState("")
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [listingsError, setListingsError] = useState<string | null>(null)

  // Fetch user's saved jobs on mount
  useEffect(() => {
    let isMounted = true

    const fetchJobs = async () => {
      setIsLoadingJobs(true)
      setJobsError(null)
      try {
        console.log("[JobTracker] Fetching jobs from API...")
        const backendJobs = await jobService.getJobs()
        console.log("[JobTracker] API response:", backendJobs)

        if (isMounted) {
          // Handle both array and object with items property
          const jobsArray = Array.isArray(backendJobs)
            ? backendJobs
            : (backendJobs as any)?.items || []
          const mappedJobs = jobsArray.map(mapJobResponseToApplication)
          console.log("[JobTracker] Mapped jobs:", mappedJobs.length, mappedJobs)
          setJobs(mappedJobs)
        }
      } catch (error: any) {
        console.error("[JobTracker] Failed to fetch jobs:", error)
        if (isMounted) {
          setJobsError(error?.message || "Failed to load jobs")
          // Don't show toast on initial load if it's a 401/403 (user might not be authenticated yet)
          if (error?.statusCode !== 401 && error?.statusCode !== 403) {
            toast.error(error?.message || "Failed to load jobs. Please try again.")
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingJobs(false)
        }
      }
    }
    fetchJobs()

    return () => {
      isMounted = false
    }
  }, [])

  // Track if we've done initial fetch to prevent double calls
  const hasFetchedListingsRef = useRef(false)

  // Fetch job listings when search/filters change
  useEffect(() => {
    let isMounted = true

    const fetchJobListings = async () => {
      setIsLoadingListings(true)
      setListingsError(null)
      try {
        console.log("[JobTracker] Fetching job listings, query:", jobSearchQuery)
        const response = await jobService.searchJobs({
          query: jobSearchQuery || undefined,
          page: 1,
          page_size: 20,
        })
        console.log("[JobTracker] Job listings API response:", response)

        if (isMounted) {
          const mappedListings = (response.items || []).map(
            mapIngestedJobToListing
          )
          console.log("[JobTracker] Mapped job listings:", mappedListings.length)
          setJobListings(mappedListings)
          hasFetchedListingsRef.current = true
        }
      } catch (error: any) {
        console.error("[JobTracker] Failed to fetch job listings:", error)
        if (isMounted) {
          setListingsError(error?.message || "Failed to load job listings")
          if (error?.statusCode !== 401 && error?.statusCode !== 403) {
            toast.error(
              error?.message || "Failed to load job listings. Please try again."
            )
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingListings(false)
        }
      }
    }

    // Only fetch on search query change, not on initial mount (to avoid double calls)
    // Initial fetch will happen when user searches or when they upload resume
    if (jobSearchQuery) {
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchJobListings()
      }, 300) // 300ms debounce

      return () => {
        isMounted = false
        clearTimeout(timeoutId)
      }
    }

    return () => {
      isMounted = false
    }
  }, [jobSearchQuery])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      job.company.toLowerCase().includes(query) ||
      job.position.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    )
  })

  const filteredJobsByStatus = {
    saved: filteredJobs.filter((j) => j.status === "saved"),
    applied: filteredJobs.filter((j) => j.status === "applied"),
    interviewing: filteredJobs.filter((j) => j.status === "interviewing"),
    offered: filteredJobs.filter((j) => j.status === "offered"),
    rejected: filteredJobs.filter((j) => j.status === "rejected"),
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the job being dragged
    const activeJob = jobs.find((j) => j.id === activeId)
    if (!activeJob) return

    // Check if dropped on a status column
    if (
      ["saved", "applied", "interviewing", "offered", "rejected"].includes(
        overId
      )
    ) {
      const newStatus = overId as JobStatus
      if (newStatus !== activeJob.status) {
        // Optimistically update UI
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === activeId ? { ...job, status: newStatus } : job
          )
        )

        // Update backend
        jobService
          .updateJobStatus(activeJob.id, newStatus)
          .then(() => {
            toast.success(`Job moved to ${statusConfig[newStatus].label}`)
          })
          .catch((error) => {
            console.error("Failed to update job status:", error)
            // Revert UI change on error
            setJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.id === activeId ? { ...job, status: activeJob.status } : job
              )
            )
            toast.error("Failed to update job status. Please try again.")
          })
      }
      return
    }

    // Dropped on another job - find that job's status and column
    const overJob = jobs.find((j) => j.id === overId)
    if (overJob) {
      if (overJob.status !== activeJob.status) {
        // Move to different column - optimistically update UI
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === activeId ? { ...job, status: overJob.status } : job
          )
        )

        // Update backend
        jobService
          .updateJobStatus(activeJob.id, overJob.status)
          .then(() => {
            toast.success(`Job moved to ${statusConfig[overJob.status].label}`)
          })
          .catch((error) => {
            console.error("Failed to update job status:", error)
            // Revert UI change on error
            setJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.id === activeId ? { ...job, status: activeJob.status } : job
              )
            )
            toast.error("Failed to update job status. Please try again.")
          })
      } else {
        // Reorder within the same column
        const statusJobs = jobs.filter((j) => j.status === activeJob.status)
        const oldIndex = statusJobs.findIndex((j) => j.id === activeId)
        const newIndex = statusJobs.findIndex((j) => j.id === overId)

        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          setJobs((prevJobs) => {
            const statusJobs = prevJobs.filter(
              (j) => j.status === activeJob.status
            )
            const otherJobs = prevJobs.filter(
              (j) => j.status !== activeJob.status
            )
            const reorderedStatusJobs = arrayMove(statusJobs, oldIndex, newIndex)
            return [...otherJobs, ...reorderedStatusJobs]
          })
        }
      }
    }
  }

  const handleEdit = (job: JobApplication) => {
    setSelectedJob(job)
    setIsDetailViewOpen(true)
  }

  const handleSave = async (updatedJob: JobApplication) => {
    try {
      const updateRequest = {
        title: updatedJob.position,
        company: updatedJob.company,
        location: updatedJob.location,
        description: updatedJob.jobDescription || "",
        salary_range: updatedJob.salary,
        external_url: updatedJob.jobUrl,
        notes: updatedJob.notes,
        status: updatedJob.status,
        applied_at: updatedJob.appliedDate
          ? new Date(updatedJob.appliedDate).toISOString()
          : undefined,
      }

      const savedJob = await jobService.updateJob(updatedJob.id, updateRequest)
      const mappedJob = mapJobResponseToApplication(savedJob)

      setJobs((prev) =>
        prev.map((j) => (j.id === mappedJob.id ? mappedJob : j))
      )
      toast.success("Job updated successfully")
    } catch (error: any) {
      console.error("Failed to update job:", error)
      toast.error(error?.message || "Failed to update job. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await jobService.deleteJob(id)
      setJobs((prev) => prev.filter((j) => j.id !== id))
      toast.success("Job deleted successfully")
    } catch (error: any) {
      console.error("Failed to delete job:", error)
      toast.error(error?.message || "Failed to delete job. Please try again.")
    }
  }

  const handleSaveJob = async (listing: JobListing) => {
    try {
      // Find the original ingested job if available
      const ingestedJobId = listing.id.startsWith("listing-")
        ? undefined
        : listing.id

      const createRequest = {
        title: listing.title,
        company: listing.company,
        location: listing.location,
        job_type: "full_time", // Default
        description: listing.description || "",
        requirements: "",
        source: "platform",
        external_url: listing.url,
        ingested_job_id: ingestedJobId,
      }

      const savedJob = await jobService.saveJob(createRequest)
      const mappedJob = mapJobResponseToApplication(savedJob)

      setJobs((prev) => [...prev, mappedJob])
      toast.success("Job saved to tracker")
    } catch (error: any) {
      console.error("Failed to save job:", error)
      toast.error(error?.message || "Failed to save job. Please try again.")
    }
  }

  const handleJobListingClick = (listing: JobListing) => {
    // Convert JobListing to JobApplication for display
    const jobApplication: JobApplication = {
      id: `listing-${listing.id}`,
      company: listing.company,
      position: listing.title,
      location: listing.location,
      status: "saved",
      matchScore: "LOW",
      jobUrl: listing.url,
      jobDescription:
        listing.description ||
        `Join our team at ${listing.company} as a ${listing.title}. This is an exciting opportunity to work in ${listing.location}.

About This Opportunity

We're looking for talented individuals to join our growing team. This role offers great opportunities for professional growth and development.

What You Will Do

• Collaborate with cross-functional teams to deliver high-quality solutions
• Contribute to key projects and initiatives
• Drive innovation and process improvements
• Work in a dynamic, fast-paced environment

Requirements

• Relevant experience in the field
• Strong problem-solving and communication skills
• Ability to work independently and as part of a team`,
    }
    setSelectedJob(jobApplication)
    setIsDetailViewOpen(true)
  }

  const filteredJobListings = jobListings.filter((listing) => {
    if (!jobSearchQuery) return true
    const query = jobSearchQuery.toLowerCase()
    return (
      listing.company.toLowerCase().includes(query) ||
      listing.title.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query)
    )
  })

  const activeJob = activeId ? jobs.find((j) => j.id === activeId) : null

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 md:py-6 border-b flex-shrink-0">
        <div className="container mx-auto px-4 max-w-[1800px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Job Tracker
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Track and manage your job applications
          </p>
        </div>
              </div>
            </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoadingJobs ? (
          <div className="container mx-auto px-4 max-w-[1800px] py-4 md:py-6">
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4">
              {(Object.keys(statusConfig) as JobStatus[]).map((status) => (
                <div
                  key={status}
                  className={`flex-1 min-w-[250px] md:min-w-[280px] ${statusConfig[status].color} rounded-lg p-3 md:p-4 flex flex-col`}
                >
                  <div className="mb-4 flex-shrink-0">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-3 w-48" />
              </div>
                  <div className="flex-1 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4">
                        <CardContent className="p-0 space-y-3">
                          <div className="flex justify-end">
                            <Skeleton className="h-5 w-16" />
            </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
                    ))}
              </div>
            </div>
              ))}
            </div>
      </div>
        ) : jobs.length === 0 ? (
          <EmptyState onJobListingsUpdate={setJobListings} />
        ) : (
          <div className="container mx-auto px-4 max-w-[1800px] py-4 md:py-6">
            <div className="flex gap-3 md:gap-4">
              <JobsPanel
                jobListings={filteredJobListings}
                jobSearchQuery={jobSearchQuery}
                onJobSearchChange={setJobSearchQuery}
                onSaveJob={handleSaveJob}
                onJobClick={handleJobListingClick}
                isLoading={isLoadingListings}
              />

              <div className="flex-1 min-w-0 overflow-hidden">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                    {(Object.keys(statusConfig) as JobStatus[]).map((status) => (
                      <Column
                        key={status}
                        status={status}
                        jobs={filteredJobsByStatus[status]}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onJobClick={(job) => {
                          setSelectedJob(job)
                          setIsDetailViewOpen(true)
                        }}
                      />
                    ))}
            </div>

                  <DragOverlay>
                    {activeJob ? (
                      <Card className="w-[280px]">
                        <CardContent className="p-4">
                          {activeJob.matchScore && (
                            <div className="flex justify-end mb-2">
                              <Badge variant="secondary">
                                {activeJob.matchScore}
                </Badge>
              </div>
                          )}
                          <h3 className="font-semibold text-sm mb-1">
                            {activeJob.position}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {activeJob.company}
                          </p>
                        </CardContent>
                      </Card>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
          </div>
        )}
          </div>

      <JobDetailView
        job={selectedJob}
        open={isDetailViewOpen}
        onOpenChange={setIsDetailViewOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        isReadOnly={false}
        onSaveToTracker={
          selectedJob && selectedJob.id.startsWith("listing-")
            ? (job) => {
                // Find the original listing
                const listingId = job.id.replace("listing-", "")
                const listing = jobListings.find((l) => l.id === listingId)
                if (listing) {
                  handleSaveJob(listing)
                  setIsDetailViewOpen(false)
                }
              }
            : undefined
        }
      />
        </div>
  )
}
