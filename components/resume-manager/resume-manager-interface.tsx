"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, MoreVertical, Download, Edit, Copy, Trash2, Eye, Search, Calendar, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import Link from "next/link"
import { resumeService, type CombinedResumeItem, type ResumeBuild } from "@/services/resume.service"
import { ResumePreview } from "@/components/resume-builder/resume-preview"
import { backendToFrontend } from "@/components/resume-builder/resume-data-utils"
import { config } from "@/lib/config"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ResumeManagerInterface() {
  const router = useRouter()
  const [resumes, setResumes] = useState<CombinedResumeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<CombinedResumeItem | null>(null)
  const [previewResume, setPreviewResume] = useState<ResumeBuild | null>(null)
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null)

  // Fetch resumes from backend
  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true)
      try {
        const response = await resumeService.getAllResumes({
          search: searchTerm || undefined,
          page_size: 50, // Get more items for display
        })
        setResumes(response.items || [])
      } catch (error: any) {
        console.error("Failed to fetch resumes:", error)
        toast.error(error?.message || "Failed to load resumes")
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchResumes()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Get resume name/title
  const getResumeName = (resume: CombinedResumeItem): string => {
    if (resume.type === 'file') {
      return resume.title || resume.file_name || 'Untitled Resume'
    } else {
      return resume.name || 'Untitled Resume'
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!resumeToDelete) return

    try {
      if (resumeToDelete.type === 'file') {
        await resumeService.deleteResume(resumeToDelete.id)
      } else {
        await resumeService.deleteBuiltResume(resumeToDelete.id)
      }
      toast.success("Resume deleted successfully")
      setResumes(resumes.filter((r) => r.id !== resumeToDelete.id))
      setDeleteDialogOpen(false)
      setResumeToDelete(null)
    } catch (error: any) {
      console.error("Failed to delete resume:", error)
      toast.error(error?.message || "Failed to delete resume")
    }
  }

  // Handle duplicate
  const handleDuplicate = async (resume: CombinedResumeItem) => {
    try {
      if (resume.type === 'built') {
        const duplicated = await resumeService.duplicateBuiltResume(resume.id)
        toast.success("Resume duplicated successfully")
        // Refresh the list
        const response = await resumeService.getAllResumes({ page_size: 50 })
        setResumes(response.items || [])
      } else {
        toast.error("Duplicating file-based resumes is not yet supported")
      }
    } catch (error: any) {
      console.error("Failed to duplicate resume:", error)
      toast.error(error?.message || "Failed to duplicate resume")
    }
  }

  // Handle download/view
  const handleDownload = async (resume: CombinedResumeItem) => {
    if (resume.type === 'file' && resume.file_url) {
      // Append token to file URL for authenticated access
      const token = typeof window !== 'undefined' ? localStorage.getItem(config.auth.tokenKeys.accessToken) : null
      const displayUrl = token ? `${resume.file_url}?token=${token}` : resume.file_url
      window.open(displayUrl, '_blank')
    } else if (resume.type === 'built') {
      // Download built resume as PDF
      try {
        await resumeService.exportBuiltResumeToPDF(resume.id)
        toast.success("Resume PDF download started")
      } catch (error: any) {
        console.error("Failed to export resume:", error)
        toast.error(error?.message || "Failed to export resume. PDF export may not be available yet.")
      }
    }
  }

  // Handle view/preview built resume
  const handleViewResume = async (resume: CombinedResumeItem) => {
    if (resume.type !== 'built') return

    setLoadingPreviewId(resume.id)
    try {
      const fullResume = await resumeService.getBuiltResume(resume.id)
      setPreviewResume(fullResume)
    } catch (error: any) {
      console.error("Failed to load resume for preview:", error)
      toast.error(error?.message || "Failed to load resume")
    } finally {
      setLoadingPreviewId(null)
    }
  }

  // Handle edit
  const handleEdit = (resume: CombinedResumeItem) => {
    if (resume.type === 'built') {
      router.push(`/dashboard/resume-builder?id=${resume.id}`)
    } else {
      toast.info("Editing file-based resumes is not yet available. Please upload a new version.")
    }
  }

  // Filter resumes based on search (client-side filtering as fallback)
  const filteredResumes = resumes.filter((resume) => {
    if (!searchTerm) return true
    const name = getResumeName(resume).toLowerCase()
    return name.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Resume Manager</h1>
          <p className="text-muted-foreground">Manage all your resumes and track their performance</p>
        </div>
        <Link href="/dashboard/resume-builder">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create New Resume
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resumes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumes List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredResumes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resumes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first resume"}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/resume-builder">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Resume
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => {
            const isBuilt = resume.type === 'built'
            
            return (
              <Card key={resume.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                        {getResumeName(resume)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(resume.updated_at)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {resume.type === 'file' && resume.file_url && (
                          <DropdownMenuItem onClick={() => handleDownload(resume)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View PDF
                          </DropdownMenuItem>
                        )}
                        {isBuilt && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleViewResume(resume)}
                              disabled={loadingPreviewId === resume.id}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {loadingPreviewId === resume.id ? "Loading..." : "View Resume"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(resume)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </>
                        )}
                        {isBuilt && (
                          <DropdownMenuItem onClick={() => handleDuplicate(resume)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        {resume.type === 'file' && resume.file_url && (
                          <DropdownMenuItem onClick={() => handleDownload(resume)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        )}
                        {isBuilt && (
                          <DropdownMenuItem onClick={() => handleDownload(resume)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setResumeToDelete(resume)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={isBuilt ? "default" : "secondary"}>
                      {isBuilt ? "Built" : "File"}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    {isBuilt ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 bg-transparent"
                          onClick={() => handleViewResume(resume)}
                          disabled={loadingPreviewId === resume.id}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {loadingPreviewId === resume.id ? "Loading..." : "View"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 bg-transparent"
                          onClick={() => handleEdit(resume)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 bg-transparent"
                          onClick={() => handleDuplicate(resume)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                      </>
                    ) : (
                      <>
                        {resume.file_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-transparent"
                            onClick={() => handleDownload(resume)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            setResumeToDelete(resume)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resumeToDelete ? getResumeName(resumeToDelete) : ''}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Preview Dialog */}
      {previewResume && (
        <ResumePreview
          templateId={previewResume.template || "modern-professional"}
          data={backendToFrontend(previewResume)}
          isOpen={!!previewResume}
          onClose={() => setPreviewResume(null)}
          mode="user-aware"
        />
      )}
    </div>
  )
}
