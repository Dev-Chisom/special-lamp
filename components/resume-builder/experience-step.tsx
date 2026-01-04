"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { resumeService } from "@/services/resume.service"
import type { Experience } from "./resume-data-utils"

interface ExperienceStepProps {
  experience: Experience[]
  onAddExperience: () => void
  onUpdateExperience: (id: string, field: keyof Experience, value: string | boolean) => void
  onDeleteExperience: (id: string) => void
}

export function ExperienceStep({
  experience,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
}: ExperienceStepProps) {
  const [enhancingId, setEnhancingId] = useState<string | null>(null)

  const handleEnhanceExperience = async (exp: Experience) => {
    if (!exp.jobTitle || !exp.company) {
      toast.error("Please fill in job title and company first")
      return
    }

    setEnhancingId(exp.id)
    try {
      const response = await resumeService.enhanceExperience({
        job_title: exp.jobTitle,
        company: exp.company,
        current_description: exp.description || "",
      })

      onUpdateExperience(exp.id, "description", response.enhanced_description)
      toast.success("Experience description enhanced successfully!")
    } catch (error: any) {
      console.error("Failed to enhance experience:", error)
      toast.error(error?.message || "Failed to enhance experience")
    } finally {
      setEnhancingId(null)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="space-y-6 p-6">
        {experience.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No work experience added yet.</p>
            <Button onClick={onAddExperience} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Experience
            </Button>
          </div>
        ) : (
          <>
            {experience.map((exp) => (
              <Card key={exp.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">Work Experience</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input
                        placeholder="Senior Software Engineer"
                        value={exp.jobTitle}
                        onChange={(e) => onUpdateExperience(exp.id, "jobTitle", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input
                        placeholder="Tech Company Inc."
                        value={exp.company}
                        onChange={(e) => onUpdateExperience(exp.id, "company", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => onUpdateExperience(exp.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => onUpdateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.isCurrent}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`exp-current-${exp.id}`}
                            checked={exp.isCurrent}
                            onChange={(e) => onUpdateExperience(exp.id, "isCurrent", e.target.checked)}
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
                      onChange={(e) => onUpdateExperience(exp.id, "description", e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleEnhanceExperience(exp)}
                      disabled={enhancingId === exp.id}
                    >
                      {enhancingId === exp.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <Button onClick={onAddExperience} variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Another Experience
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

