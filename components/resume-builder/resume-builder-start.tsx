"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, /* Linkedin, */ Upload, FileText, Sparkles } from "lucide-react"
import { resumeService } from "@/services/resume.service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ApiClientError } from "@/services/api-client"

interface ResumeBuilderStartProps {
  onStartBuilding: () => void
  onImportLinkedIn?: () => void // TEMPORARILY DISABLED - LinkedIn import feature
  onImportFile: (file: File) => void
}

export function ResumeBuilderStart({
  onStartBuilding,
  onImportLinkedIn,
  onImportFile,
}: ResumeBuilderStartProps) {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setIsImporting(true)
    try {
      // Import file and create ResumeBuild object
      const resumeBuild = await resumeService.importFileToBuiltResume({
        file,
        template_id: 'modern-professional', // Default template
      })
      
      toast.success("Resume imported successfully! Opening Resume Builder...")
      
      // Redirect to resume builder wizard with the imported resume ID
      setTimeout(() => {
        window.location.href = `/dashboard/resume-builder?id=${resumeBuild.id}`
      }, 500)
    } catch (error: any) {
      console.error("Failed to import resume:", error)
      // Error messages are now user-friendly from the backend - display directly
      const errorMessage = error instanceof Error && 'getGeneralError' in error
        ? (error as ApiClientError).getGeneralError()
        : error?.message || "Something went wrong. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsImporting(false)
      // Reset file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // TEMPORARILY DISABLED - LinkedIn import feature
  // const handleLinkedInImport = async () => {
  //   // For now, redirect to LinkedIn scan page
  //   // In the future, this could trigger a LinkedIn profile import directly
  //   onImportLinkedIn()
  //   window.location.href = '/dashboard/linkedin-scan'
  // }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          How do you want to start?
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Build a free resume that gets you interviewed by employers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Create New Resume */}
        <Card 
          className={cn(
            "group transition-all duration-300",
            isImporting 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
          )}
          onClick={!isImporting ? onStartBuilding : undefined}
        >
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className={cn(
              "w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors",
              !isImporting && "group-hover:bg-primary/20"
            )}>
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create a new resume</h3>
            <p className="text-sm text-muted-foreground">
              We will help you build a resume step-by-step with AI-powered suggestions.
            </p>
            <Button 
              className="mt-6 w-full" 
              disabled={isImporting}
              onClick={(e) => {
                e.stopPropagation()
                if (!isImporting) {
                  onStartBuilding()
                }
              }}
            >
              Get Started
            </Button>
          </CardContent>
        </Card>

        {/* Import from LinkedIn - TEMPORARILY DISABLED */}
        {/* <Card 
          className={cn(
            "group transition-all duration-300",
            isImporting 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
          )}
          onClick={!isImporting ? handleLinkedInImport : undefined}
        >
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className={cn(
              "w-16 h-16 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 transition-colors",
              !isImporting && "group-hover:bg-blue-500/20"
            )}>
              <Linkedin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Import resume from LinkedIn</h3>
            <p className="text-sm text-muted-foreground">
              We will reformat and fill in your information to save your time using AI.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 w-full"
              disabled={isImporting}
              onClick={(e) => {
                e.stopPropagation()
                if (!isImporting) {
                  handleLinkedInImport()
                }
              }}
            >
              Import from LinkedIn
            </Button>
          </CardContent>
        </Card> */}

        {/* Import Resume File */}
        <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Import my resume</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We will parse and extract your information using AI to help you build a better resume.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-file-input"
            />
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => {
                fileInputRef.current?.click()
              }}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-pulse" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Features Highlight */}
      <div className="mt-12 max-w-3xl mx-auto">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Powered by AI</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI helps you create ATS-optimized resumes with smart suggestions, 
                  auto-completion, and personalized recommendations based on your industry and experience level.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

