"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle2 } from "lucide-react"
import type { Resume } from "@/services/resume.service"

interface ResumeSelectionStepProps {
  resumes: Resume[]
  job: any
  onResumeSelected: (resume: Resume) => void
  onCancel: () => void
}

export function ResumeSelectionStep({
  resumes,
  job,
  onResumeSelected,
  onCancel,
}: ResumeSelectionStepProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes.find(r => (r as any).is_primary)?.id || resumes[0]?.id || ""
  )

  const handleContinue = () => {
    const resume = resumes.find(r => r.id === selectedResumeId)
    if (resume) {
      onResumeSelected(resume)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Resume</DialogTitle>
          <DialogDescription>
            Choose which resume to use for this application:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedResumeId} onValueChange={setSelectedResumeId}>
            <div className="space-y-3">
              {resumes.map((resume) => {
                const isSelected = selectedResumeId === resume.id
                const isPrimary = (resume as any).is_primary

                return (
                  <Card
                    key={resume.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedResumeId(resume.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={resume.id}
                          id={resume.id}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={resume.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{resume.file_name || resume.title || "Resume"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {resume.created_at
                                    ? new Date(resume.created_at).toLocaleDateString()
                                    : "No date"}
                                </p>
                              </div>
                            </div>
                            {isPrimary && (
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                                Primary
                              </span>
                            )}
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!selectedResumeId}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

