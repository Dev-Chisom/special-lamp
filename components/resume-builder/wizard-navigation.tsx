"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface WizardNavigationProps {
  currentStep: number
  onPrevious: () => void
  onNext: () => void
  onPreview?: () => void
}

export function WizardNavigation({
  currentStep,
  onPrevious,
  onNext,
  onPreview,
}: WizardNavigationProps) {
  // Only show navigation for steps 1-4 (skip template step 0 and done step 5)
  if (currentStep === 0 || currentStep >= 5) {
    return null
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {onPreview && (
          <Button
            variant="outline"
            onClick={onPreview}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        )}
      </div>
      <Button
        onClick={onNext}
        className="gap-2"
      >
        Continue
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
