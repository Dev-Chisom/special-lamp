import { Suspense } from "react"
import { CoverLetterInterface } from "@/components/cover-letter/cover-letter-interface"

export const metadata = {
  title: "Cover Letter Generator - ApplyEngine",
  description: "Generate tailored cover letters with AI",
}

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoverLetterInterface />
    </Suspense>
  )
}
