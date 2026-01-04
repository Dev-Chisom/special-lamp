import { Suspense } from "react"
import { InterviewInterface } from "@/components/interview/interview-interface"

export const metadata = {
  title: "Interview Preparation - PathForge AI",
  description: "Practice interviews with AI",
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewInterface />
    </Suspense>
  )
}
