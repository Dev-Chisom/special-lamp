"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Trash2, Download, Eye, Sparkles, CheckCircle2, Save, Loader2 } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resumeService } from "@/services/resume.service"
import { backendToFrontend, frontendToBackend, type ResumeData, type PersonalInfo, type Experience, type Education } from "./resume-data-utils"

const initialPersonalInfo: PersonalInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
}

const initialResumeData: ResumeData = {
  personalInfo: initialPersonalInfo,
  summary: "",
  experience: [],
  education: [],
  skills: [],
}

export function ResumeBuilderInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resumeId = searchParams.get("id") // Optional: for editing existing resume

  const [activeSection, setActiveSection] = useState("personal")
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData)
  const [resumeName, setResumeName] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  // Load resume data from backend if editing
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) return // Creating new resume

      setIsLoading(true)
      try {
        const resume = await resumeService.getBuiltResume(resumeId)
        const frontendData = backendToFrontend(resume)
        setResumeData(frontendData)
        setResumeName(resume.name || "")
        toast.success("Resume loaded successfully")
      } catch (error: any) {
        console.error("Failed to load resume:", error)
        toast.error(error?.message || "Failed to load resume")
        // Redirect to create new resume on error
        router.replace("/dashboard/resume-builder")
      } finally {
        setIsLoading(false)
      }
    }

    loadResume()
  }, [resumeId, router])

  // Handle personal info changes
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }))
  }

  // Handle summary change
  const updateSummary = (value: string) => {
    setResumeData((prev) => ({
      ...prev,
      summary: value,
    }))
  }

  // Add experience
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    }
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }

  // Update experience
  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }))
  }

  // Delete experience
  const deleteExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
    toast.success("Experience removed")
  }

  // Add education
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      startYear: "",
      endYear: "",
      isCurrent: false,
    }
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }))
  }

  // Update education
  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }))
  }

  // Delete education
  const deleteEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
    toast.success("Education removed")
  }

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
      toast.success("Skill added")
    }
  }

  // Delete skill
  const deleteSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  // Handle save (create or update)
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const backendData = frontendToBackend(resumeData)
      
      if (resumeId) {
        // Update existing resume
        await resumeService.updateBuiltResume(resumeId, {
          name: resumeName || undefined,
          ...backendData,
        })
        toast.success("Resume updated successfully")
      } else {
        // Create new resume
        const created = await resumeService.createBuiltResume({
          name: resumeName || `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume` || "My Resume",
          ...backendData,
        })
        toast.success("Resume created successfully")
        // Redirect to edit URL
        router.push(`/dashboard/resume-builder?id=${created.id}`)
      }
    } catch (error: any) {
      console.error("Failed to save resume:", error)
      toast.error(error?.message || "Failed to save resume")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle export (download as JSON for now)
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(resumeData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `resume-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Resume exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export resume")
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr + "-01") // Add day for YYYY-MM format
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
    } catch {
      return dateStr
    }
  }

  // Loading state
  if (isLoading && resumeId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          {resumeId && (
            <div className="mb-2">
              <Input
                placeholder="Resume Name"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                className="max-w-md"
              />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {resumeId ? "Edit Resume" : "Resume Builder"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Create ATS-optimized resumes with AI-powered suggestions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-transparent flex-1 sm:flex-none"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="sm:inline">{resumeId ? "Update" : "Save"}</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="gap-2 bg-transparent flex-1 sm:flex-none"
          >
            <Eye className="h-4 w-4" />
            <span className="sm:inline">Preview</span>
          </Button>
          <Button onClick={handleExport} className="gap-2 flex-1 sm:flex-none">
            <Download className="h-4 w-4" />
            <span className="sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Sections - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resume Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={activeSection === "personal" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("personal")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Personal Info
              </Button>
              <Button
                variant={activeSection === "summary" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("summary")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Professional Summary
              </Button>
              <Button
                variant={activeSection === "experience" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("experience")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Work Experience
              </Button>
              <Button
                variant={activeSection === "education" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("education")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Education
              </Button>
              <Button
                variant={activeSection === "skills" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("skills")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Skills
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Click any field to get AI-powered suggestions tailored to your industry and role.</p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Section Selector */}
        <div className="lg:hidden">
          <Card className="mb-6">
            <CardContent className="p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Current Section</Label>
              <Select value={activeSection} onValueChange={setActiveSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Info</SelectItem>
                  <SelectItem value="summary">Professional Summary</SelectItem>
                  <SelectItem value="experience">Work Experience</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Form */}
        <div className="lg:col-span-2 space-y-6">
          {activeSection === "personal" && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={resumeData.personalInfo.firstName}
                      onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={resumeData.personalInfo.lastName}
                      onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="linkedin.com/in/johndoe"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "summary" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Professional Summary
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    rows={6}
                    placeholder="Write a compelling professional summary that highlights your experience, skills, and career goals..."
                    value={resumeData.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Include 3-4 sentences highlighting your expertise, achievements, and what you bring to
                    potential employers
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "experience" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Work Experience
                  <Button size="sm" className="gap-2" onClick={addExperience}>
                    <Plus className="h-4 w-4" />
                    Add Experience
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {resumeData.experience.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No work experience added yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={addExperience}
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Experience
                    </Button>
                  </div>
                ) : (
                  resumeData.experience.map((exp) => (
                    <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">Experience Entry</h4>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteExperience(exp.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title *</Label>
                          <Input
                            placeholder="Senior Software Engineer"
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company *</Label>
                          <Input
                            placeholder="Tech Company Inc."
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                              disabled={exp.isCurrent}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`exp-current-${exp.id}`}
                                checked={exp.isCurrent}
                                onChange={(e) => updateExperience(exp.id, "isCurrent", e.target.checked)}
                                className="h-4 w-4"
                              />
                              <Label htmlFor={`exp-current-${exp.id}`} className="text-sm cursor-pointer">
                                Current
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={4}
                          placeholder="• Led development of..."
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                        />
                        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                          <Sparkles className="h-4 w-4" />
                          Enhance with AI
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "education" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Education
                  <Button size="sm" className="gap-2" onClick={addEducation}>
                    <Plus className="h-4 w-4" />
                    Add Education
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {resumeData.education.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No education added yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={addEducation}
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Education
                    </Button>
                  </div>
                ) : (
                  resumeData.education.map((edu) => (
                    <div key={edu.id} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">Education Entry</h4>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteEducation(edu.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>School *</Label>
                        <Input
                          placeholder="University of California"
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree *</Label>
                        <Input
                          placeholder="Bachelor of Science in Computer Science"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Year</Label>
                          <Input
                            type="number"
                            placeholder="2015"
                            value={edu.startYear}
                            onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Year</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="2019"
                              value={edu.endYear}
                              onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)}
                              disabled={edu.isCurrent}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`edu-current-${edu.id}`}
                                checked={edu.isCurrent}
                                onChange={(e) => updateEducation(edu.id, "isCurrent", e.target.checked)}
                                className="h-4 w-4"
                              />
                              <Label htmlFor={`edu-current-${edu.id}`} className="text-sm cursor-pointer">
                                Current
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "skills" && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a skill and press Enter"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                    />
                    <Button onClick={addSkill}>Add</Button>
                  </div>
                </div>
                {resumeData.skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No skills added yet. Add your first skill above.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-sm py-1.5 px-3 cursor-pointer"
                        onClick={() => deleteSkill(skill)}
                      >
                        {skill}
                        <button
                          className="ml-2 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSkill(skill)
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              Preview of your resume
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6 p-6 bg-white dark:bg-gray-900 border rounded-lg">
            {/* Personal Info */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">
                {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
              </h1>
              <div className="flex flex-wrap justify-center gap-2 mt-2 text-sm text-muted-foreground">
                {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
                {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
                {resumeData.personalInfo.linkedin && <span>• {resumeData.personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div>
                <h2 className="text-xl font-semibold mb-2 border-b pb-1">Professional Summary</h2>
                <p className="text-sm whitespace-pre-wrap">{resumeData.summary}</p>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 border-b pb-1">Work Experience</h2>
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{exp.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                        </p>
                      </div>
                      {exp.description && (
                        <p className="text-sm mt-2 whitespace-pre-wrap">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 border-b pb-1">Education</h2>
                <div className="space-y-3">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{edu.degree}</h3>
                          <p className="text-sm text-muted-foreground">{edu.school}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {edu.startYear} - {edu.isCurrent ? "Present" : edu.endYear}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resumeData.skills.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 border-b pb-1">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
