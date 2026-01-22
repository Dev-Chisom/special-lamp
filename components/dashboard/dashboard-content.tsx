"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/store/auth.store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Wand2,
  Mail,
  MessageSquare,
  Sparkles,
  Bookmark,
  ExternalLink,
  MoreVertical,
  DollarSign,
  Clock,
  TrendingUp,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { dashboardService, type DashboardResponse } from "@/services/dashboard.service"
import { resumeService, type CombinedResumeItem } from "@/services/resume.service"
import { jobService } from "@/services/job.service"
import { applicationService } from "@/services/application.service"

export function DashboardContent() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("recommended")
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resumes, setResumes] = useState<CombinedResumeItem[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(false)
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<any[]>([])
  const [isLoadingAppliedJobs, setIsLoadingAppliedJobs] = useState(false)
  const [applicationStats, setApplicationStats] = useState<{
    total: number
    successful: number
    failed: number
    pending: number
  } | null>(null)
  const hasFetchedAnalyticsRef = useRef(false)

  // Fetch dashboard data and application stats
  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in development causes double render)
    if (hasFetchedAnalyticsRef.current) {
      return
    }

    hasFetchedAnalyticsRef.current = true

    const fetchDashboard = async () => {
      setIsLoading(true)
      try {
        const [data, stats] = await Promise.all([
          dashboardService.getDashboard({
            recommended_jobs_limit: 10,
            recent_activity_limit: 10,
            applications_limit: 10,
          }),
          applicationService.getAnalytics().catch(() => null), // Don't fail if analytics fails
        ])
        setDashboardData(data)
        if (stats) {
          setApplicationStats({
            total: stats.total_applications,
            successful: stats.successful_applications,
            failed: stats.failed_applications,
            pending: stats.pending_applications,
          })
        }
      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error(error?.message || "Failed to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  // Fetch resumes when Resumes tab is active (limit to 3 for dashboard)
  useEffect(() => {
    if (activeTab === "resumes") {
      const fetchResumes = async () => {
        setIsLoadingResumes(true)
        try {
          const response = await resumeService.getAllResumes({
            page_size: 3,
            sort: "updated_at",
            order: "desc",
          })
          setResumes(response.items || [])
        } catch (error: any) {
          console.error("Failed to fetch resumes:", error)
          toast.error(error?.message || "Failed to load resumes")
        } finally {
          setIsLoadingResumes(false)
        }
      }

      fetchResumes()
    }
  }, [activeTab])

  // Fetch saved jobs when Saved Jobs tab is active
  useEffect(() => {
    if (activeTab === "saved") {
      const fetchSavedJobs = async () => {
        setIsLoadingSavedJobs(true)
        try {
          const jobs = await jobService.getJobs({ status: "saved", page_size: 10 })
          // Handle both array and object with items property
          const jobsArray = Array.isArray(jobs) ? jobs : (jobs as any)?.items || []
          setSavedJobs(jobsArray)
        } catch (error: any) {
          console.error("Failed to fetch saved jobs:", error)
          toast.error(error?.message || "Failed to load saved jobs")
        } finally {
          setIsLoadingSavedJobs(false)
        }
      }

      fetchSavedJobs()
    }
  }, [activeTab])

  // Fetch applied jobs when Applied tab is active
  useEffect(() => {
    if (activeTab === "applied") {
      const fetchAppliedJobs = async () => {
        setIsLoadingAppliedJobs(true)
        try {
          const jobs = await jobService.getJobs({ status: "applied", page_size: 10 })
          // Handle both array and object with items property
          const jobsArray = Array.isArray(jobs) ? jobs : (jobs as any)?.items || []
          setAppliedJobs(jobsArray)
        } catch (error: any) {
          console.error("Failed to fetch applied jobs:", error)
          toast.error(error?.message || "Failed to load applied jobs")
        } finally {
          setIsLoadingAppliedJobs(false)
        }
      }

      fetchAppliedJobs()
    }
  }, [activeTab])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="xl:col-span-4 space-y-4 sm:space-y-6 order-2 xl:order-1">
          {/* ATS Score Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Latest ATS Score</h3>
                {isLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : dashboardData?.latest_scan ? (
                  <Badge variant="secondary">
                    {new Date(dashboardData.latest_scan.created_at).toLocaleDateString()}
                  </Badge>
                ) : (
                  <Badge variant="secondary">No scans yet</Badge>
                )}
              </div>

              {isLoading ? (
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <Skeleton className="w-40 h-40 rounded-full" />
                </div>
              ) : dashboardData?.latest_scan ? (
                <>
                  {/* Circular Progress */}
                  <div className="relative w-40 h-40 mx-auto">
                    <CircularProgress value={dashboardData.latest_scan.overall_score} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                        {Math.round(dashboardData.latest_scan.overall_score)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Keyword Match</span>
                      <span className="font-medium">{Math.round(dashboardData.latest_scan.keyword_match_score)}%</span>
                    </div>
                    <Progress value={dashboardData.latest_scan.keyword_match_score} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Formatting</span>
                      <span className="font-medium">{Math.round(dashboardData.latest_scan.formatting_score)}%</span>
                    </div>
                    <Progress value={dashboardData.latest_scan.formatting_score} className="h-2" />
                  </div>

                  <Link href="/dashboard/scan-history">
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      View Full Report
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No scans yet</p>
                  <Link href="/dashboard/scan">
                    <Button variant="outline">Scan Your Resume</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/scan">
                <Button className="w-full justify-start" variant="ghost">
                  <FileText className="mr-2 h-4 w-4" />
                  Scan New Resume
                </Button>
              </Link>
              <Link href="/dashboard/rewrite">
                <Button className="w-full justify-start" variant="ghost">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Rewrite Resume
                </Button>
              </Link>
              <Link href="/dashboard/cover-letter">
                <Button className="w-full justify-start" variant="ghost">
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </Button>
              </Link>
              <Link href="/dashboard/interview">
                <Button className="w-full justify-start" variant="ghost">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Practice Interview
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Usage This Month</span>
                <Badge>Pro Plan</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : dashboardData?.usage_stats ? (
                <>
                  <UsageBar
                    label="Resume Scans"
                    used={dashboardData.usage_stats.resume_scans.used}
                    limit={dashboardData.usage_stats.resume_scans.limit}
                  />
                  <UsageBar
                    label="AI Rewrites"
                    used={dashboardData.usage_stats.ai_rewrites.used}
                    limit={dashboardData.usage_stats.ai_rewrites.limit}
                  />
                  <UsageBar
                    label="Cover Letters"
                    used={dashboardData.usage_stats.cover_letters.used}
                    limit={dashboardData.usage_stats.cover_letters.limit}
                  />
                  <UsageBar
                    label="Interviews"
                    used={dashboardData.usage_stats.interviews.used}
                    limit={dashboardData.usage_stats.interviews.limit}
                  />
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No usage data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-6 order-1 xl:order-2">
          {/* Application Analytics Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
            </div>
            <CardContent className="relative p-8 sm:p-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {applicationStats && applicationStats.total > 0 ? (
                  <>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-primary">
                        {applicationStats.total}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Total Applications
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {applicationStats.successful}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Successful
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {applicationStats.failed}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Failed
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {applicationStats.pending}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Pending
                      </div>
                    </div>
                  </>
                ) : appliedJobs.length > 0 ? (
                  <div className="col-span-2 sm:col-span-4 flex flex-col">
                    <div className="text-2xl font-bold text-primary">
                      {appliedJobs.length}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Applied Job{appliedJobs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ) : dashboardData?.recommended_jobs.length ? (
                  <div className="col-span-2 sm:col-span-4 flex flex-col">
                    <div className="text-2xl font-bold text-primary">
                      {dashboardData.recommended_jobs.length}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Job Recommendation{dashboardData.recommended_jobs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ) : (
                  <div className="col-span-2 sm:col-span-4 text-muted-foreground text-sm">
                    Let's find your dream job today.
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 sm:flex-row mt-4">
                <Link href="/dashboard/find-jobs" className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    View Recommendations
                  </Button>
                </Link>
                <Link href="/dashboard/find-jobs" className="flex-1 sm:flex-none">
                  <Button size="lg" variant="outline" className="w-full bg-transparent">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="recommended" className="text-xs sm:text-sm">
                Recommended
              </TabsTrigger>
              <TabsTrigger value="saved" className="text-xs sm:text-sm">
                Saved Jobs
              </TabsTrigger>
              <TabsTrigger value="applied" className="text-xs sm:text-sm">
                Applied
              </TabsTrigger>
              <TabsTrigger value="resumes" className="text-xs sm:text-sm">
                Resumes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="space-y-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : dashboardData?.recommended_jobs && dashboardData.recommended_jobs.length > 0 ? (
                <>
                  {dashboardData.recommended_jobs.slice(0, 3).map((job) => (
                    <JobCard
                      key={job.id}
                      jobId={job.id}
                      company={job.company || "Company"}
                      title={job.title}
                      location={job.location || "Location not specified"}
                      matchScore={job.match_score ? Math.round(job.match_score) : undefined}
                      salary={job.salary_range || undefined}
                      posted={undefined}
                      tags={[]}
                      externalUrl={job.external_url}
                    />
                  ))}
                  {dashboardData.recommended_jobs.length > 3 && (
                    <div className="pt-2">
                      <Link href="/dashboard/find-jobs">
                        <Button variant="outline" className="w-full">
                          View More Jobs ({dashboardData.recommended_jobs.length - 3} more)
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Recommended Jobs</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload a resume to get personalized job recommendations.
                    </p>
                    <Link href="/dashboard/find-jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              {isLoadingSavedJobs ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : savedJobs.length > 0 ? (
                <>
                  {savedJobs.slice(0, 3).map((job) => (
                    <JobCard
                      key={job.id}
                      jobId={job.id}
                      company={job.company || "Company"}
                      title={job.title}
                      location={job.location || "Location not specified"}
                      matchScore={job.match_score ? Math.round(job.match_score) : undefined}
                      salary={job.salary_range || undefined}
                      posted={job.applied_at ? new Date(job.applied_at).toLocaleDateString() : undefined}
                      tags={[]}
                      externalUrl={job.external_url}
                    />
                  ))}
                  {savedJobs.length > 3 && (
                    <div className="pt-2">
                      <Link href="/dashboard/job-tracker">
                        <Button variant="outline" className="w-full">
                          View All Saved Jobs ({savedJobs.length - 3} more)
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
                    <p className="text-muted-foreground mb-4">Bookmark jobs you're interested in to view them here</p>
                    <Link href="/dashboard/find-jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="applied" className="space-y-4">
              {isLoadingAppliedJobs ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : appliedJobs.length > 0 ? (
                <>
                  {appliedJobs.slice(0, 3).map((job) => (
                    <JobCard
                      key={job.id}
                      jobId={job.id}
                      company={job.company || "Company"}
                      title={job.title}
                      location={job.location || "Location not specified"}
                      matchScore={job.match_score ? Math.round(job.match_score) : undefined}
                      salary={job.salary_range || undefined}
                      posted={job.applied_at ? new Date(job.applied_at).toLocaleDateString() : undefined}
                      tags={[]}
                      externalUrl={job.external_url}
                    />
                  ))}
                  {appliedJobs.length > 3 && (
                    <div className="pt-2">
                      <Link href="/dashboard/job-tracker">
                        <Button variant="outline" className="w-full">
                          View All Applied Jobs ({appliedJobs.length - 3} more)
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No applied jobs yet</h3>
                    <p className="text-muted-foreground mb-4">Jobs you've applied to will appear here</p>
                    <Link href="/dashboard/find-jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resumes" className="space-y-4">
              {isLoadingResumes ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : resumes.length > 0 ? (
                <>
                  {resumes.map((resume) => (
                    <ResumeCard key={resume.id} resume={resume} router={router} />
                  ))}
                  <div className="pt-2">
                    <Link href="/dashboard/resume-manager">
                      <Button variant="outline" className="w-full">
                        View All Resumes
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Resumes Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create or upload a resume to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/dashboard/resume-builder">
                        <Button>Create Resume</Button>
                      </Link>
                      <Link href="/dashboard/resume-manager">
                        <Button variant="outline">Manage Resumes</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function JobCard({
  company,
  title,
  location,
  matchScore,
  salary,
  posted,
  tags,
  externalUrl,
  jobId,
}: {
  company: string
  title: string
  location: string
  matchScore?: number
  salary?: string
  posted?: string
  tags: string[]
  externalUrl?: string
  jobId?: string
}) {
  const router = useRouter()

  const handleSaveJob = async () => {
    try {
      await jobService.saveJob({
        title,
        company,
        location,
        job_type: "full_time", // Default, can be updated later
        description: "",
        external_url: externalUrl || "",
        ingested_job_id: jobId, // Use jobId if it's an ingested job
        source: "dashboard",
      })
      toast.success("Job saved to tracker!")
    } catch (error: any) {
      toast.error(error?.message || "Failed to save job")
    }
  }

  const handleScanResume = () => {
    router.push("/dashboard/scan")
  }

  const handleGenerateCoverLetter = () => {
    router.push("/dashboard/cover-letter")
  }
  return (
    <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer">
      <CardContent className="p-6 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {matchScore !== undefined && matchScore >= 80 && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                  >
                    Great Match
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-xs sm:text-sm mb-3">
                {company} • {location}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                <span className="flex items-center">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {salary}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {posted}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-3">
            {matchScore !== undefined && (
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <CircularProgress value={matchScore} size="sm" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold text-primary">{matchScore}</span>
                </div>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSaveJob}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save Job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleScanResume}>
                  <FileText className="mr-2 h-4 w-4" />
                  Scan Resume
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateCoverLetter}>
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </DropdownMenuItem>
                {externalUrl && (
                  <DropdownMenuItem onClick={() => window.open(externalUrl, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on {company}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResumeCard({
  resume,
  router,
}: {
  resume: CombinedResumeItem
  router: ReturnType<typeof useRouter>
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
  }

  const getResumeName = (resume: CombinedResumeItem): string => {
    if (resume.type === 'file') {
      const name = resume.title || resume.file_name || 'Untitled Resume'
      // Clean up filename: remove double extensions and file extensions for display
      return cleanFilename(name)
    } else {
      return resume.name || 'Untitled Resume'
    }
  }

  // Clean filename for display - remove file extensions and fix double extensions
  const cleanFilename = (filename: string): string => {
    if (!filename) return filename
    
    // Remove file extensions (.pdf, .docx, etc.)
    // Handle double extensions like .pdf.pdf
    let cleaned = filename
      .replace(/\.pdf\.pdf$/i, '') // Remove double .pdf.pdf
      .replace(/\.pdf$/i, '') // Remove .pdf
      .replace(/\.docx$/i, '') // Remove .docx
      .replace(/\.doc$/i, '') // Remove .doc
      .trim()
    
    return cleaned || filename // Fallback to original if empty after cleaning
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    if (resume.type === 'built') {
      router.push(`/dashboard/resume-builder?id=${resume.id}`)
    } else {
      router.push('/dashboard/resume-manager')
    }
  }

  const resumeName = getResumeName(resume)
  const updatedAt = resume.updated_at || resume.created_at
  const lastUpdated = updatedAt ? formatDate(updatedAt) : "Unknown"

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                {resumeName}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Updated {lastUpdated} • {resume.type === 'built' ? 'Built Resume' : 'File Resume'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpen}
            className="shrink-0 w-full sm:w-auto"
          >
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const isUnlimited = limit === null
  const percentage = isUnlimited ? 0 : (used / limit) * 100

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {isUnlimited ? `${used} (Unlimited)` : `${used} / ${limit}`}
        </span>
      </div>
      {isUnlimited ? (
        <div className="h-2 w-full bg-muted rounded-full">
          <div className="h-2 w-full bg-primary/20 rounded-full" />
        </div>
      ) : (
        <Progress value={percentage} className="h-2" />
      )}
    </div>
  )
}
