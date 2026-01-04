"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { Education } from "./resume-data-utils"

interface EducationStepProps {
  education: Education[]
  onAddEducation: () => void
  onUpdateEducation: (id: string, field: keyof Education, value: string | boolean) => void
  onDeleteEducation: (id: string) => void
}

export function EducationStep({
  education,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
}: EducationStepProps) {
  return (
    <Card className="mb-6">
      <CardContent className="space-y-6 p-6">
        {education.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No education added yet.</p>
            <Button onClick={onAddEducation} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Education
            </Button>
          </div>
        ) : (
          <>
            {education.map((edu) => (
              <Card key={edu.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">Education</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteEducation(edu.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>School *</Label>
                    <Input
                      placeholder="University of California"
                      value={edu.school}
                      onChange={(e) => onUpdateEducation(edu.id, "school", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree *</Label>
                    <Input
                      placeholder="Bachelor of Science in Computer Science"
                      value={edu.degree}
                      onChange={(e) => onUpdateEducation(edu.id, "degree", e.target.value)}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Year</Label>
                      <Input
                        type="number"
                        placeholder="2015"
                        value={edu.startYear}
                        onChange={(e) => onUpdateEducation(edu.id, "startYear", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Year</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="2019"
                          value={edu.endYear}
                          onChange={(e) => onUpdateEducation(edu.id, "endYear", e.target.value)}
                          disabled={edu.isCurrent}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`edu-current-${edu.id}`}
                            checked={edu.isCurrent}
                            onChange={(e) => onUpdateEducation(edu.id, "isCurrent", e.target.checked)}
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
              </Card>
            ))}
            <Button onClick={onAddEducation} variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Another Education
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

