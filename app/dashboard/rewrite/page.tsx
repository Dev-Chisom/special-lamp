import { Suspense } from "react"
import { RewriteInterface } from "@/components/rewrite/rewrite-interface"

export const metadata = {
  title: "Resume Rewriter - ApplyEngine",
  description: "AI-powered resume optimization",
}

export default function RewritePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RewriteInterface />
    </Suspense>
  )
}
