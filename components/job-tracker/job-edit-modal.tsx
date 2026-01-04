"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, FileText, Calendar, StickyNote } from "lucide-react"
import { toast } from "sonner"
import type { JobApplication } from "./job-tracker-interface"

interface JobEditModalProps {
  job: JobApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (job: JobApplication) => void
}

export function JobEditModal({
  job,
  open,
  onOpenChange,
  onSave,
}: JobEditModalProps) {
  const [editedJob, setEditedJob] = useState<JobApplication | null>(null)
  const [activeTab, setActiveTab] = useState("job")

  useEffect(() => {
    if (job) {
      setEditedJob({ ...job })
      setActiveTab("job")
    }
  }, [job])

  if (!job || !editedJob) return null

  const handleSave = () => {
    if (editedJob) {
      onSave(editedJob)
      toast.success("Job updated successfully")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="job" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              Job
            </TabsTrigger>
            <TabsTrigger value="resume" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Resume
            </TabsTrigger>
            <TabsTrigger value="cover-letter" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Cover Letter
            </TabsTrigger>
            <TabsTrigger value="interviews" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Interviews
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <StickyNote className="h-3 w-3 mr-1" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    value={editedJob.position}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, position: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={editedJob.company}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, company: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Listing URL</Label>
                <Input
                  value={editedJob.jobUrl || ""}
                  onChange={(e) =>
                    setEditedJob({ ...editedJob, jobUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editedJob.location}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input
                    value={editedJob.salary || ""}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, salary: e.target.value })
                    }
                    placeholder="Salary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date Applied</Label>
                <Input
                  type="date"
                  value={editedJob.appliedDate || ""}
                  onChange={(e) =>
                    setEditedJob({ ...editedJob, appliedDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Job Description</Label>
                <Textarea
                  value={editedJob.jobDescription || ""}
                  onChange={(e) =>
                    setEditedJob({
                      ...editedJob,
                      jobDescription: e.target.value,
                    })
                  }
                  rows={10}
                  placeholder="Paste job description here..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resume" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Resume</Label>
              <Textarea
                value={editedJob.resume || ""}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, resume: e.target.value })
                }
                rows={15}
                placeholder="Paste your resume content here..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Upload Resume</Button>
              <Button variant="outline">Generate Resume</Button>
            </div>
          </TabsContent>

          <TabsContent value="cover-letter" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Cover Letter</Label>
              <Textarea
                value={editedJob.coverLetter || ""}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, coverLetter: e.target.value })
                }
                rows={15}
                placeholder="Write or paste your cover letter here..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Generate Cover Letter</Button>
              <Button variant="outline">Use Template</Button>
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="123-456-7890" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Meeting Link</Label>
                <Input placeholder="zoom.us/meeting-link" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={6}
                  placeholder="Add interview specific notes like interviewer experience/expertise, how you can help the interviewing team, behavioral questions and answers, past experience stories, etc."
                />
              </div>
              <Button className="w-full">Save Interview</Button>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editedJob.notes || ""}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, notes: e.target.value })
                }
                rows={15}
                placeholder="Add any additional notes about this job application..."
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

