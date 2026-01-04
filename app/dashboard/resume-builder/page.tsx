"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ResumeBuilderStart } from "@/components/resume-builder/resume-builder-start"
import { ResumeBuilderWizard } from "@/components/resume-builder/resume-builder-wizard"
import { Skeleton } from "@/components/ui/skeleton"

function ResumeBuilderContent() {
  const searchParams = useSearchParams()
  const resumeId = searchParams.get("id")
  const [startBuilding, setStartBuilding] = useState(!!resumeId)

  if (startBuilding || resumeId) {
    return <ResumeBuilderWizard resumeId={resumeId || undefined} />
  }

  return (
    <ResumeBuilderStart
      onStartBuilding={() => setStartBuilding(true)}
      onImportLinkedIn={() => {}}
      onImportFile={() => {}}
    />
  )
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  )
}
