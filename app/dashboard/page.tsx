import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export const metadata = {
  title: "Dashboard - ApplyEngine",
  description: "Your AI-powered job search dashboard",
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
