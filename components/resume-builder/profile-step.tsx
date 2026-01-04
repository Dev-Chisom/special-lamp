"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { resumeService } from "@/services/resume.service"
import type { PersonalInfo, Experience, Education } from "./resume-data-utils"
import { frontendToBackend } from "./resume-data-utils"

interface ProfileStepProps {
  personalInfo: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  onUpdatePersonalInfo: (field: keyof PersonalInfo, value: string) => void
  onUpdateSummary: (value: string) => void
}

export function ProfileStep({
  personalInfo,
  summary,
  experience,
  education,
  skills,
  onUpdatePersonalInfo,
  onUpdateSummary,
}: ProfileStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    try {
      // Convert frontend data to backend format
      const backendData = frontendToBackend({
        personalInfo,
        summary,
        experience,
        education,
        skills,
      })

      const response = await resumeService.generateSummary({
        personal_info: backendData.personal_info,
        experience: backendData.experience,
        education: backendData.education,
        skills: backendData.skills,
      })

      onUpdateSummary(response.summary)
      toast.success("Summary generated successfully!")
    } catch (error: any) {
      console.error("Failed to generate summary:", error)
      toast.error(error?.message || "Failed to generate summary")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">Let employers know who you are</CardTitle>
        <p className="text-muted-foreground">
          Include your full name and contact information for employers to reach you
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={personalInfo.firstName}
                onChange={(e) => onUpdatePersonalInfo("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={personalInfo.lastName}
                onChange={(e) => onUpdatePersonalInfo("lastName", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={personalInfo.email}
              onChange={(e) => onUpdatePersonalInfo("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="(555) 123-4567"
              value={personalInfo.phone}
              onChange={(e) => onUpdatePersonalInfo("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="San Francisco, CA"
              value={personalInfo.location}
              onChange={(e) => onUpdatePersonalInfo("location", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="linkedin.com/in/johndoe"
              value={personalInfo.linkedin}
              onChange={(e) => onUpdatePersonalInfo("linkedin", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              rows={4}
              placeholder="Write a compelling professional summary..."
              value={summary}
              onChange={(e) => onUpdateSummary(e.target.value)}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

