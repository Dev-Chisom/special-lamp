"use client"

import { AutoApplyPreferences } from "@/components/settings/auto-apply-preferences"
import { Card, CardContent } from "@/components/ui/card"

export default function AutoApplySettingsPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Auto-Apply Preferences</h1>
        <p className="text-muted-foreground">
          Configure your automated job application settings and preferences
        </p>
      </div>
      <AutoApplyPreferences />
    </div>
  )
}

