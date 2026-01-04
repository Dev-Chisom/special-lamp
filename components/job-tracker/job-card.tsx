"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Edit, Trash2 } from "lucide-react"
import type { JobApplication } from "./types"

interface JobCardProps {
  job: JobApplication
  onEdit: (job: JobApplication) => void
  onDelete: (id: string) => void
  onClick: (job: JobApplication) => void
}

export function JobCard({ job, onEdit, onDelete, onClick }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const matchScoreColors = {
    LOW: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    HIGH: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  }

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card
        className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
        {...attributes}
        {...listeners}
        onClick={(e) => {
          // Only trigger onClick if not dragging (dnd-kit handles drag state)
          if (!isDragging) {
            onClick(job)
          }
        }}
      >
        <CardContent className="p-4">
          {job.matchScore && (
            <div className="flex justify-end mb-2">
              <Badge
                variant="secondary"
                className={matchScoreColors[job.matchScore]}
              >
                {job.matchScore}
              </Badge>
            </div>
          )}
          <h3 className="font-semibold text-sm mb-1">{job.position}</h3>
          <p className="text-xs text-muted-foreground mb-2">{job.company}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(job)
              }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(job.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

