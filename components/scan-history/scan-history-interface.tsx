"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, FileText, Calendar, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import Link from "next/link"
import { scanService } from "@/services/scan.service"

export function ScanHistoryInterface() {
  const [scans, setScans] = useState<any[]>([])
  const [statistics, setStatistics] = useState({
    total_scans: 0,
    average_score: 0,
    improving_count: 0,
    declining_count: 0,
    stable_count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Fetch scan history with statistics
  useEffect(() => {
    const fetchScanHistory = async () => {
      setIsLoading(true)
      try {
        const response = await scanService.getScanHistoryWithStats({
          page: 1,
          page_size: 50, // Get enough items for display
          sort: 'created_at',
          order: 'desc',
        })
        setScans(response.items || [])
        setStatistics(response.statistics || {
          total_scans: 0,
          average_score: 0,
          improving_count: 0,
          declining_count: 0,
          stable_count: 0,
        })
      } catch (error: any) {
        console.error("Failed to fetch scan history:", error)
        toast.error(error?.message || "Failed to load scan history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScanHistory()
  }, [])

  // Calculate filtered scans based on active tab
  const filteredScans = scans.filter((scan) => {
    if (activeTab === "all") return true
    if (activeTab === "improving") {
      return scan.previous_score && scan.overall_score > scan.previous_score
    }
    if (activeTab === "declining") {
      return scan.previous_score && scan.overall_score < scan.previous_score
    }
    return true
  })

  const avgScore = Math.round(statistics.average_score)
  const improving = statistics.improving_count
  const declining = statistics.declining_count

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <History className="h-10 w-10" />
          Scan History
        </h1>
        <p className="text-muted-foreground">Track your resume improvements and ATS scores over time</p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Scans</p>
                  <p className="text-3xl font-bold">{statistics.total_scans}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-3xl font-bold text-primary">{avgScore}</p>
              </div>
              <div className="relative w-12 h-12">
                <CircularProgress value={avgScore} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Improving</p>
                <p className="text-3xl font-bold text-emerald-600">{improving}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Need Work</p>
                <p className="text-3xl font-bold text-orange-600">{declining}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Tabs */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Scans ({statistics.total_scans})</TabsTrigger>
            <TabsTrigger value="improving">Improving ({improving})</TabsTrigger>
            <TabsTrigger value="declining">Needs Work ({declining})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredScans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Scans Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Start scanning your resume to see your ATS scores and improvements here.
                  </p>
                  <Link href="/dashboard/scan">
                    <Button>Scan Your Resume</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredScans.map((scan) => (
                <ScanCard key={scan.id} scan={scan} />
              ))
            )}
          </TabsContent>

          <TabsContent value="improving" className="space-y-4">
            {filteredScans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Improving Scans</h3>
                  <p className="text-muted-foreground">Keep improving your resume to see improvements here.</p>
                </CardContent>
              </Card>
            ) : (
              filteredScans.map((scan) => (
                <ScanCard key={scan.id} scan={scan} />
              ))
            )}
          </TabsContent>

          <TabsContent value="declining" className="space-y-4">
            {filteredScans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Declining Scans</h3>
                  <p className="text-muted-foreground">Great job! All your scans are improving or stable.</p>
                </CardContent>
              </Card>
            ) : (
              filteredScans.map((scan) => (
                <ScanCard key={scan.id} scan={scan} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function ScanCard({ scan }: { scan: any }) {
  // Handle both old mock data format and new API format
  const resumeName = scan.resume_name || scan.resumeName || "Untitled Resume"
  const jobTitle = scan.job_title 
    ? `${scan.job_title}${scan.company ? ` at ${scan.company}` : ''}`
    : scan.jobTitle || scan.job_description?.substring(0, 60) || "Job Description"
  const score = scan.overall_score || scan.score
  const previousScore = scan.previous_score !== undefined ? scan.previous_score : scan.previousScore
  const scoreChange = scan.score_change !== undefined ? scan.score_change : (previousScore !== null && previousScore !== undefined ? score - previousScore : null)
  const improvements = scan.improvements || []
  
  const isImproving = scoreChange !== null && scoreChange !== undefined && scoreChange > 0
  const isDeclining = scoreChange !== null && scoreChange !== undefined && scoreChange < 0

  // Format date
  const createdAt = scan.created_at || scan.date
  const dateObj = new Date(createdAt)
  const formattedDate = dateObj.toLocaleDateString()
  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{resumeName}</h3>
                {isImproving && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />+{scoreChange}
                  </Badge>
                )}
                {isDeclining && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                  >
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {scoreChange}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-3">{jobTitle}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formattedDate} at {formattedTime}
                </span>
              </div>

              {improvements.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Key Improvements:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {improvements.slice(0, 3).map((improvement: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="relative w-16 h-16">
              <CircularProgress value={score} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{score}</span>
              </div>
            </div>

            <Link href={`/dashboard/scan-history/${scan.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                View Report
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
