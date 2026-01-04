"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Check, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { resumeService, type ResumeTemplate } from "@/services/resume.service"
import { ResumePreview } from "./resume-preview"
import { DUMMY_RESUME_DATA } from "./dummy-resume-data"
import type { ResumeData } from "./resume-data-utils"
import { Skeleton } from "@/components/ui/skeleton"

const MOCK_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic-professional",
    name: "Classic Professional",
    description: "Traditional and clean design, perfect for corporate roles",
    category: "professional",
    is_premium: false,
  },
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Contemporary design with subtle colors",
    category: "professional",
    is_premium: false,
  },
  {
    id: "modern-student",
    name: "Modern Student",
    description: "Designed for students and recent graduates",
    category: "student",
    is_premium: false,
  },
  {
    id: "minimalist-expert",
    name: "Minimalist Expert",
    description: "Clean and minimal, emphasizes content",
    category: "minimalist",
    is_premium: false,
  },
  {
    id: "timeless-professional",
    name: "Timeless Professional",
    description: "Elegant and timeless design",
    category: "professional",
    is_premium: false,
  },
]

interface ResumeTemplateSelectorProps {
  selectedTemplate?: string
  onSelectTemplate: (templateId: string) => void
  onContinue: () => void
  userData?: ResumeData // Optional: user's actual data for user-aware preview
  isEditing?: boolean // Whether we're editing an existing resume or importing
}

export function ResumeTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  onContinue,
  userData,
  isEditing = false,
}: ResumeTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'static' | 'live' | 'user-aware'>('live')

  // Fetch templates from backend
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true)
      try {
        const response = await resumeService.getTemplates()
        setTemplates(response.templates || [])
      } catch (error: any) {
        console.error("Failed to fetch templates:", error)
        toast.error("Failed to load templates. Using default templates.")
        // Fallback to mock templates on error
        setTemplates(MOCK_TEMPLATES)
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [])

  // Determine preview data based on mode
  const getPreviewData = (templateId: string, mode: 'static' | 'live' | 'user-aware'): ResumeData => {
    if (mode === 'user-aware' && userData) {
      return userData
    }
    return DUMMY_RESUME_DATA
  }

  const handlePreview = (templateId: string, mode: 'static' | 'live' | 'user-aware' = 'live') => {
    setPreviewTemplate(templateId)
    setPreviewMode(mode)
  }

  // Use fetched templates, fallback to mock templates if empty
  const displayTemplates = templates.length > 0 ? templates : MOCK_TEMPLATES

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Choose one of our ATS-friendly resume templates</h2>
        <p className="text-muted-foreground">You can always change it later</p>
      </div>

      {/* Template Grid */}
      {isLoadingTemplates ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[8.5/11] w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id
          return (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                isSelected 
                  ? "border-primary shadow-md ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-0">
                {/* Template Preview Area */}
                <div className="relative aspect-[8.5/11] bg-gradient-to-br from-muted/50 to-muted/30 border-b-2 border-border overflow-hidden group">
                  {/* Static Preview Image (if available) */}
                  {template.preview_url ? (
                    <img
                      src={template.preview_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <FileText className="h-16 w-16 text-muted-foreground/50 mb-3" />
                      <span className="text-xs text-muted-foreground font-medium">Preview</span>
                    </div>
                  )}
                  
                  {/* Preview Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreview(template.id, 'live')
                        }}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Live Preview
                      </Button>
                      {isEditing && userData && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(template.id, 'user-aware')
                          }}
                          className="gap-2 bg-white/90"
                        >
                          <Eye className="h-4 w-4" />
                          With Your Data
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg z-10">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base leading-tight">{template.name}</h3>
                    {template.is_premium && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="pt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onContinue}
          disabled={!selectedTemplate || isLoadingTemplates}
          size="lg"
          className="min-w-[200px]"
        >
          {isLoadingTemplates ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            `Continue with ${selectedTemplate ? displayTemplates.find(t => t.id === selectedTemplate)?.name : "Template"}`
          )}
        </Button>
      </div>

      {/* Preview Dialog */}
      {previewTemplate && (
        <ResumePreview
          templateId={previewTemplate}
          data={getPreviewData(previewTemplate, previewMode)}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          mode={previewMode}
        />
      )}
    </div>
  )
}
