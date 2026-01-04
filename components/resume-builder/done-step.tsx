"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DoneStepProps {
  onFinish: () => void
}

export function DoneStep({ onFinish }: DoneStepProps) {
  const router = useRouter()

  return (
    <Card className="mb-6">
      <CardContent className="text-center py-12 p-6">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Resume Complete!</h3>
        <p className="text-muted-foreground mb-6">
          Your resume has been saved. You can edit it anytime from the Resume Manager.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/dashboard/resume-manager')}>
            View All Resumes
          </Button>
          <Button onClick={onFinish}>
            Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

