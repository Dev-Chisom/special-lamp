"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react"
import type { JobListing } from "./types"

interface JobsPanelProps {
  jobListings: JobListing[]
  jobSearchQuery: string
  onJobSearchChange: (query: string) => void
  onSearchClick?: () => void
  onSaveJob: (listing: JobListing) => void
  onJobClick: (listing: JobListing) => void
  isLoading?: boolean
}

export function JobsPanel({
  jobListings,
  jobSearchQuery,
  onJobSearchChange,
  onSearchClick,
  onSaveJob,
  onJobClick,
  isLoading,
}: JobsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [location, setLocation] = useState("")
  const [dateRange, setDateRange] = useState<string>("any")
  const [jobType, setJobType] = useState<string>("all")
  const [remoteOption, setRemoteOption] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 10

  const handleClearAll = () => {
    onJobSearchChange("")
    setLocation("")
    setDateRange("any")
    setJobType("all")
    setRemoteOption("all")
  }

  const hasActiveFilters =
    jobSearchQuery ||
    location ||
    (dateRange && dateRange !== "any") ||
    (jobType && jobType !== "all") ||
    (remoteOption && remoteOption !== "all")

  const totalPages = Math.ceil(jobListings.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const endIndex = startIndex + jobsPerPage
  const paginatedJobs = jobListings.slice(startIndex, endIndex)

  if (isCollapsed) {
    return (
      <div className="w-12 bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
        <ChevronDown
          className="h-4 w-4 text-muted-foreground rotate-[-90deg]"
          onClick={() => setIsCollapsed(false)}
        />
      </div>
    )
  }

  return (
    <div className="hidden lg:block w-[280px] min-w-[280px] bg-muted/50 rounded-lg p-4 flex flex-col h-full max-h-full overflow-hidden flex-shrink-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="font-semibold text-lg">Jobs</h2>
          <p className="text-sm text-muted-foreground">
            Search jobs by title, skill, or qualification
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 mb-4 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="AI Engineer"
              value={jobSearchQuery}
              onChange={(e) => {
                onJobSearchChange(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
              className="pl-9 pr-8"
            />
            {jobSearchQuery && (
              <button
                onClick={() => onJobSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button className="px-6" onClick={onSearchClick} disabled={!jobSearchQuery?.trim()}>
            Search
          </Button>
        </div>

        {/* Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {[
                      dateRange && dateRange !== "any" ? 1 : 0,
                      jobType && jobType !== "all" ? 1 : 0,
                      remoteOption && remoteOption !== "all" ? 1 : 0,
                      location ? 1 : 0,
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Filters</h4>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-sm">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Your current location"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm">Date range</Label>
                  <Select
                    value={dateRange || undefined}
                    onValueChange={(value) => {
                      setDateRange(value || "")
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="past24h">Past 24 hours</SelectItem>
                      <SelectItem value="pastWeek">Past week</SelectItem>
                      <SelectItem value="pastMonth">Past month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type */}
                <div className="space-y-2">
                  <Label className="text-sm">Job type</Label>
                  <Select
                    value={jobType || undefined}
                    onValueChange={(value) => {
                      setJobType(value || "")
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="fulltime">Full-time</SelectItem>
                      <SelectItem value="parttime">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Remote Option */}
                <div className="space-y-2">
                  <Label className="text-sm">Remote option</Label>
                  <Select
                    value={remoteOption || undefined}
                    onValueChange={(value) => {
                      setRemoteOption(value || "")
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Remote option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All options</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ScrollArea className="flex-1 min-h-0 h-0">
          <div className="space-y-3 pr-2">
            {isLoading ? (
              // Skeleton loading for job listings
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <CardContent className="p-0 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              paginatedJobs.map((listing) => (
                <Card
                  key={listing.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onJobClick(listing)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {listing.company}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.location}</span>
                      <span>•</span>
                      <span>{listing.posted}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSaveJob(listing)
                      }}
                    >
                      Save Job
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
            {!isLoading && paginatedJobs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No jobs found
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 border-t flex-shrink-0">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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

        <div className="pt-4 border-t flex-shrink-0 bg-muted/50 -mx-4 px-4 pb-4 mt-auto">
          <Link href="/dashboard/find-jobs">
            <Button variant="ghost" className="w-full justify-center gap-2">
              <span>Find more jobs</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

