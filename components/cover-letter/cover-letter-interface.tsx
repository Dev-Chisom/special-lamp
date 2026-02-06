"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Copy, RefreshCw, Sparkles, Download, Loader2 } from "lucide-react"
import { coverLetterService } from "@/services/cover-letter.service"
import { resumeService, type CombinedResumeItem } from "@/services/resume.service"
import { toast } from "sonner"

type GenerateState = "idle" | "generating" | "complete"

interface CoverLetterResult {
  coverLetter: string
  tone: string
  wordCount: number
  keyPoints: string[]
}

export function CoverLetterInterface() {
  const [generateState, setGenerateState] = useState<GenerateState>("idle")
  const [jobDescription, setJobDescription] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [roleName, setRoleName] = useState("")
  const [tone, setTone] = useState<"formal" | "professional" | "friendly" | "casual">("professional")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [resumes, setResumes] = useState<CombinedResumeItem[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(false)
  const [result, setResult] = useState<CoverLetterResult | null>(null)

  // Fetch user's resumes
  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoadingResumes(true)
      try {
        const response = await resumeService.getAllResumes({
          page_size: 50, // Get all resumes
        })
        setResumes(response.items || [])
        // Auto-select first resume if available
        if (response.items && response.items.length > 0) {
          setSelectedResumeId(response.items[0].id)
        }
      } catch (error: any) {
        console.error("Failed to fetch resumes:", error)
        toast.error("Failed to load resumes")
      } finally {
        setIsLoadingResumes(false)
      }
    }

    fetchResumes()
  }, [])

  const handleGenerate = async () => {
    if (!jobDescription || !companyName || !roleName) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!selectedResumeId) {
      toast.error("Please select a resume")
      return
    }

    setGenerateState("generating")
    setResult(null)

    try {
      const response = await coverLetterService.generateCoverLetter({
        resume_id: selectedResumeId,
        job_description: jobDescription,
        company: companyName,
        role: roleName,
        tone: tone,
      })

      // Transform API response to UI format
      const wordCount = response.content.split(/\s+/).length
      const keyPoints = [
        "AI-generated content tailored to the job description",
        "Highlights relevant experience from your resume",
        "Matches the selected tone and style",
        "Includes company-specific references",
        "Professional and compelling format",
      ]

      setResult({
        coverLetter: response.content,
        tone: response.tone,
        wordCount,
        keyPoints,
      })
      setGenerateState("complete")
      toast.success("Cover letter generated successfully!")
    } catch (error: any) {
      console.error("Failed to generate cover letter:", error)
      toast.error(error?.message || "Failed to generate cover letter. Please try again.")
      setGenerateState("idle")
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Cover Letter Generator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Create personalized, compelling cover letters tailored to each job
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {generateState === "idle" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Generate Your Cover Letter</CardTitle>
                <CardDescription className="text-sm">
                  Provide job details to create a tailored cover letter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume Selection */}
                <div className="space-y-2">
                  <Label htmlFor="resume">Select Resume *</Label>
                  {isLoadingResumes ? (
                    <p className="text-sm text-muted-foreground">Loading resumes...</p>
                  ) : resumes.length === 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">No resumes available. Please create or upload a resume first.</p>
                      <Button variant="outline" onClick={() => window.location.href = '/dashboard/resume-builder'}>
                        Create Resume
                      </Button>
                    </div>
                  ) : (
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <SelectTrigger id="resume">
                        <SelectValue placeholder="Select a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {getResumeName(resume)} ({resume.type === 'file' ? 'File' : 'Built'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role Name *</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Senior Software Engineer"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={(value) => setTone(value as any)}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-desc">Job Description</Label>
                  <Textarea
                    id="job-desc"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={10}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!jobDescription || !companyName || !roleName || !selectedResumeId || resumes.length === 0 || generateState === "generating"}
                  className="w-full"
                  size="lg"
                >
                  {generateState === "generating" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {generateState === "generating" && (
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 animate-pulse" />
              <CardContent className="relative p-12 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="h-10 w-10 text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Crafting Your Cover Letter...</h3>
                <p className="text-muted-foreground">Tailoring content to the job description and company</p>
              </CardContent>
            </Card>
          )}

          {generateState === "complete" && result && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Your Cover Letter</CardTitle>
                      <CardDescription className="text-sm">
                        {result.wordCount} words • {result.tone} tone
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">AI Generated</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 border border-border rounded-lg p-4 sm:p-8">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{result.coverLetter}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => copyToClipboard(result.coverLetter)} className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      Download as PDF
                    </Button>
                    <Button onClick={() => setGenerateState("idle")} variant="outline" className="sm:w-auto">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Points Highlighted</CardTitle>
                  <CardDescription>What makes this cover letter effective</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
