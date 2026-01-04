"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface SkillsStepProps {
  skills: string[]
  newSkill: string
  onNewSkillChange: (value: string) => void
  onAddSkill: () => void
  onDeleteSkill: (skill: string) => void
}

export function SkillsStep({
  skills,
  newSkill,
  onNewSkillChange,
  onAddSkill,
  onDeleteSkill,
}: SkillsStepProps) {
  return (
    <Card className="mb-6">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <Label>Add Skills</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Type a skill and press Enter"
              value={newSkill}
              onChange={(e) => onNewSkillChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onAddSkill()
                }
              }}
            />
            <Button onClick={onAddSkill}>Add</Button>
          </div>
        </div>
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No skills added yet. Add your first skill above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-sm py-1.5 px-3 cursor-pointer"
                onClick={() => onDeleteSkill(skill)}
              >
                {skill}
                <button
                  className="ml-2 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSkill(skill)
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
  )
}

