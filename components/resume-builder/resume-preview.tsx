"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, X } from "lucide-react"
import { getTemplateRenderer } from "./template-renderers"
import type { ResumeData } from "./resume-data-utils"

interface ResumePreviewProps {
  templateId: string
  data: ResumeData
  isOpen: boolean
  onClose: () => void
  mode?: 'static' | 'live' | 'user-aware'
}

/**
 * Resume Preview Component
 * Supports three preview modes:
 * - static: Static template preview (image)
 * - live: Live preview with dummy data
 * - user-aware: Preview with user's actual data
 */
export function ResumePreview({
  templateId,
  data,
  isOpen,
  onClose,
  mode = 'live',
}: ResumePreviewProps) {
  const TemplateRenderer = getTemplateRenderer(templateId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Resume Preview</DialogTitle>
              <DialogDescription className="mt-1">
                {mode === 'static' && 'Static template preview'}
                {mode === 'live' && 'Live preview with sample data'}
                {mode === 'user-aware' && 'Preview with your data'}
              </DialogDescription>
            </div>
            {/* <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="bg-gray-50 p-4 rounded-lg mt-4 flex justify-center">
            {/* Preview Container - US Letter size (8.5" x 11") */}
            <div 
              className="bg-white shadow-lg"
              style={{
                width: '100%',
                maxWidth: '816px', // 8.5 inches at 96 DPI
                minHeight: '1056px', // 11 inches at 96 DPI
                overflow: 'visible',
              }}
            >
              <TemplateRenderer data={data} templateId={templateId} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Preview Button Component
 */
interface PreviewButtonProps {
  templateId: string
  data: ResumeData
  mode?: 'static' | 'live' | 'user-aware'
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}

export function PreviewButton({
  templateId,
  data,
  mode = 'live',
  variant = 'outline',
  size = 'default',
}: PreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
      <ResumePreview
        templateId={templateId}
        data={data}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode={mode}
      />
    </>
  )
}

