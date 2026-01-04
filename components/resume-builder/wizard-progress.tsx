"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

const STEPS = [
  { id: "template", label: "Template", number: 1 },
  { id: "profile", label: "Profile", number: 2 },
  { id: "experience", label: "Experience", number: 3 },
  { id: "education", label: "Education", number: 4 },
  { id: "skills", label: "Additional", number: 5 },
  { id: "done", label: "Done", number: 6 },
]

interface WizardProgressProps {
  currentStep: number
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:block ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

