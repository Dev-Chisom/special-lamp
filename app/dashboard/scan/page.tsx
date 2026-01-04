import { Suspense } from "react"
import { ScanInterface } from "@/components/scan/scan-interface"

export const metadata = {
  title: "Resume Scanner - PathForge AI",
  description: "Scan your resume for ATS compatibility",
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScanInterface />
    </Suspense>
  )
}
