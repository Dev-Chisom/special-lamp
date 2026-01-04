"use client"

import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { statusConfig } from "./utils"
import { JobCard } from "./job-card"
import type { JobApplication, JobStatus } from "./types"

interface ColumnProps {
  status: JobStatus
  jobs: JobApplication[]
  onEdit: (job: JobApplication) => void
  onDelete: (id: string) => void
  onJobClick: (job: JobApplication) => void
}

export function Column({
  status,
  jobs,
  onEdit,
  onDelete,
  onJobClick,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  })

  const config = statusConfig[status]
  const sortableIds = jobs.map((job) => job.id)

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[250px] md:min-w-[280px] ${config.color} rounded-lg p-3 md:p-4 flex flex-col`}
    >
      <div className="mb-4 flex-shrink-0">
        <h3 className="font-semibold text-sm mb-1">
          {config.label} {jobs.length > 0 && <span className="text-muted-foreground">({jobs.length})</span>}
        </h3>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={onJobClick}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  )
}

