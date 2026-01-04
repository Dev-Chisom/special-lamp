"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { resumeService } from "@/services/resume.service"
import { backendToFrontend, frontendToBackend, type ResumeData, type PersonalInfo, type Experience, type Education } from "./resume-data-utils"
import { ResumeTemplateSelector } from "./resume-template-selector"
import { WizardProgress } from "./wizard-progress"
import { ProfileStep } from "./profile-step"
import { ExperienceStep } from "./experience-step"
import { EducationStep } from "./education-step"
import { SkillsStep } from "./skills-step"
import { DoneStep } from "./done-step"
import { WizardNavigation } from "./wizard-navigation"
import { ResumePreview } from "./resume-preview"

const STEPS = [
  { id: "template", label: "Template", number: 1 },
  { id: "profile", label: "Profile", number: 2 },
  { id: "experience", label: "Experience", number: 3 },
  { id: "education", label: "Education", number: 4 },
  { id: "skills", label: "Additional", number: 5 },
  { id: "done", label: "Done", number: 6 },
]

const initialPersonalInfo: PersonalInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
}

const initialResumeData: ResumeData = {
  personalInfo: initialPersonalInfo,
  summary: "",
  experience: [],
  education: [],
  skills: [],
}

interface ResumeBuilderWizardProps {
  resumeId?: string
  onComplete?: () => void
}

export function ResumeBuilderWizard({ resumeId, onComplete }: ResumeBuilderWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData)
  const [resumeName, setResumeName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern-professional")
  const [isLoading, setIsLoading] = useState(!!resumeId)
  const [isSaving, setIsSaving] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Load resume if editing
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) return

      setIsLoading(true)
      try {
        const resume = await resumeService.getBuiltResume(resumeId)
        const frontendData = backendToFrontend(resume)
        setResumeData(frontendData)
        setResumeName(resume.name || "")
        setSelectedTemplate(resume.template || "modern-professional")
      } catch (error: any) {
        console.error("Failed to load resume:", error)
        toast.error(error?.message || "Failed to load resume")
      } finally {
        setIsLoading(false)
      }
    }

    loadResume()
  }, [resumeId])

  // Save progress
  const handleSave = async (showToast = true) => {
    setIsSaving(true)
    try {
      const backendData = frontendToBackend(resumeData)
      
      if (resumeId) {
        await resumeService.updateBuiltResume(resumeId, {
          name: resumeName || undefined,
          template: selectedTemplate || undefined,
          ...backendData,
        })
        if (showToast) toast.success("Resume saved successfully")
      } else {
        const created = await resumeService.createBuiltResume({
          name: resumeName || `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume` || "My Resume",
          template: selectedTemplate || "modern-professional",
          ...backendData,
        })
        if (showToast) toast.success("Resume created successfully")
        router.replace(`/dashboard/resume-builder?id=${created.id}`, { scroll: false })
      }
    } catch (error: any) {
      console.error("Failed to save resume:", error)
      toast.error(error?.message || "Failed to save resume")
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save on step change (skip template step)
  useEffect(() => {
    if (currentStep > 1 && (resumeData.personalInfo.firstName || resumeData.personalInfo.lastName)) {
      handleSave(false) // Silent save
    }
  }, [currentStep])

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }))
  }

  const updateSummary = (value: string) => {
    setResumeData((prev) => ({
      ...prev,
      summary: value,
    }))
  }

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    }
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }))
  }

  const deleteExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      startYear: "",
      endYear: "",
      isCurrent: false,
    }
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }))
  }

  const deleteEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const deleteSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    await handleSave(true)
    toast.success("Resume completed!")
    if (onComplete) {
      onComplete()
    } else {
      router.push('/dashboard/resume-manager')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
      <WizardProgress currentStep={currentStep} />

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="mb-6">
          <ResumeTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            onContinue={nextStep}
            userData={resumeData}
            isEditing={!!resumeId}
          />
        </div>
      )}

      {currentStep === 1 && (
        <ProfileStep
          personalInfo={resumeData.personalInfo}
          summary={resumeData.summary}
          experience={resumeData.experience}
          education={resumeData.education}
          skills={resumeData.skills}
          onUpdatePersonalInfo={updatePersonalInfo}
          onUpdateSummary={updateSummary}
        />
      )}

      {currentStep === 2 && (
        <ExperienceStep
          experience={resumeData.experience}
          onAddExperience={addExperience}
          onUpdateExperience={updateExperience}
          onDeleteExperience={deleteExperience}
        />
      )}

      {currentStep === 3 && (
        <EducationStep
          education={resumeData.education}
          onAddEducation={addEducation}
          onUpdateEducation={updateEducation}
          onDeleteEducation={deleteEducation}
        />
      )}

      {currentStep === 4 && (
        <SkillsStep
          skills={resumeData.skills}
          newSkill={newSkill}
          onNewSkillChange={setNewSkill}
          onAddSkill={addSkill}
          onDeleteSkill={deleteSkill}
        />
      )}

      {currentStep === 5 && (
        <DoneStep onFinish={handleFinish} />
      )}

      <WizardNavigation
        currentStep={currentStep}
        onPrevious={prevStep}
        onNext={nextStep}
        onPreview={() => setIsPreviewOpen(true)}
      />

      {/* Resume Preview Dialog */}
      {currentStep > 0 && (
        <ResumePreview
          templateId={selectedTemplate}
          data={resumeData}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          mode="user-aware"
        />
      )}
    </div>
  )
}
