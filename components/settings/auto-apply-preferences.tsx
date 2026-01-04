"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  AlertCircle,
  CheckCircle2,
  Pause,
  X,
  Plus,
  GripVertical,
  Info,
  TrendingUp,
} from "lucide-react"
import { autoApplyPreferencesService } from "@/services/auto-apply-preferences.service"
import type {
  AutoApplyPreferences,
  AutoApplyPreferencesResponse,
  JobType,
  EmploymentType,
  ExperienceLevel,
  Currency,
} from "@/types/auto-apply"
import {
  stringsToJobTitles,
  jobTitlesToStrings,
  stringsToLocations,
  locationsToStrings,
  type JobTitlePreference,
  type LocationPreference,
} from "./auto-apply-preferences-helpers"

export function AutoApplyPreferences() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<AutoApplyPreferences | null>(null)
  const [recentJobs, setRecentJobs] = useState<AutoApplyPreferencesResponse['recent_auto_applied_jobs']>([])
  const [stats, setStats] = useState<AutoApplyPreferencesResponse['stats'] | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newSkill, setNewSkill] = useState("")

  // Load preferences
  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    setIsLoading(true)
    try {
      const response = await autoApplyPreferencesService.getPreferences()
      setPreferences(response.preferences)
      setRecentJobs(response.recent_auto_applied_jobs)
      setStats(response.stats)
    } catch (error: any) {
      console.error("Failed to load preferences:", error)
      toast.error(error?.message || "Failed to load preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const validatePreferences = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!preferences) return false

    if (preferences.enabled && preferences.status === 'active') {
      if (preferences.preferred_job_titles.length === 0) {
        newErrors.job_titles = "At least one job title is required"
      }
      if (preferences.job_types.length === 0) {
        newErrors.job_types = "At least one job type is required"
      }
      if (preferences.employment_types.length === 0) {
        newErrors.employment_types = "At least one employment type is required"
      }
      if (preferences.preferred_locations.length === 0) {
        newErrors.locations = "At least one location preference is required"
      }
      if (preferences.salary_min && preferences.salary_max && preferences.salary_min > preferences.salary_max) {
        newErrors.salary = "Minimum salary cannot exceed maximum salary"
      }
      if (preferences.experience_levels.length === 0) {
        newErrors.experience_levels = "At least one experience level is required"
      }
      if (preferences.match_confidence_threshold < 70 || preferences.match_confidence_threshold > 100) {
        newErrors.match_confidence = "Match confidence must be between 70 and 100"
      }
      if (preferences.max_applications_per_day < 1 || preferences.max_applications_per_day > 50) {
        newErrors.max_daily = "Max applications per day must be between 1 and 50"
      }
      if (preferences.max_applications_per_week < 1 || preferences.max_applications_per_week > 200) {
        newErrors.max_weekly = "Max applications per week must be between 1 and 200"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!preferences) return

    if (!validatePreferences()) {
      toast.error("Please fix the errors before saving")
      return
    }

    setIsSaving(true)
    const previousPreferences = { ...preferences }

    try {
      const updated = await autoApplyPreferencesService.updatePreferences(preferences)
      setPreferences(updated)
      toast.success("Preferences saved successfully")
      setErrors({})
    } catch (error: any) {
      console.error("Failed to save preferences:", error)
      toast.error(error?.message || "Failed to save preferences")
      // Rollback on failure
      setPreferences(previousPreferences)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!preferences) return

    const newStatus: AutoApplyPreferences['status'] = enabled ? 'active' : 'disabled'
    
    // Validate before enabling
    if (enabled) {
      const updatedPrefs = { ...preferences, enabled: true, status: newStatus }
      setPreferences(updatedPrefs)
      if (!validatePreferences()) {
        toast.error("Please complete required fields before enabling auto-apply")
        setPreferences(preferences)
        return
      }
    }

    setIsSaving(true)
    try {
      const updated = await autoApplyPreferencesService.updateStatus(newStatus)
      setPreferences(updated)
      toast.success(enabled ? "Auto-apply enabled" : "Auto-apply disabled")
    } catch (error: any) {
      console.error("Failed to update status:", error)
      toast.error(error?.message || "Failed to update status")
      setPreferences(preferences)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = <K extends keyof AutoApplyPreferences>(
    key: K,
    value: AutoApplyPreferences[K]
  ) => {
    if (!preferences) return
    setPreferences({ ...preferences, [key]: value })
  }

  const addJobTitle = () => {
    if (!newJobTitle.trim() || !preferences) return

    const title: JobTitlePreference = {
      id: Date.now().toString(),
      title: newJobTitle.trim(),
      priority: preferences.preferred_job_titles.length,
    }

    updatePreference('preferred_job_titles', [...preferences.preferred_job_titles, title])
    setNewJobTitle("")
  }

  const removeJobTitle = (id: string) => {
    if (!preferences) return
    updatePreference(
      'preferred_job_titles',
      preferences.preferred_job_titles.filter((t) => t.id !== id)
    )
  }

  const addLocation = () => {
    if (!newLocation.trim() || !preferences) return

    const location: LocationPreference = {
      id: Date.now().toString(),
      location: newLocation.trim(),
      type: newLocation.trim().toLowerCase().includes('remote') ? 'remote_only' : 'city',
    }

    updatePreference('preferred_locations', [...preferences.preferred_locations, location])
    setNewLocation("")
  }

  const removeLocation = (id: string) => {
    if (!preferences) return
    updatePreference(
      'preferred_locations',
      preferences.preferred_locations.filter((l) => l.id !== id)
    )
  }

  const toggleJobType = (type: JobType) => {
    if (!preferences) return
    const current = preferences.job_types
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    updatePreference('job_types', updated)
  }

  const toggleEmploymentType = (type: EmploymentType) => {
    if (!preferences) return
    const current = preferences.employment_types
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    updatePreference('employment_types', updated)
  }

  const toggleExperienceLevel = (level: ExperienceLevel) => {
    if (!preferences) return
    const current = preferences.experience_levels
    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level]
    updatePreference('experience_levels', updated)
  }

  const addSkill = () => {
    if (!newSkill.trim() || !preferences) return

    const skill: SkillPreference = {
      id: Date.now().toString(),
      skill: newSkill.trim(),
      weight: 'nice_to_have',
    }

    updatePreference('skills', [...preferences.skills, skill])
    setNewSkill("")
  }

  const removeSkill = (id: string) => {
    if (!preferences) return
    updatePreference('skills', preferences.skills.filter((s) => s.id !== id))
  }

  const toggleSkillWeight = (id: string) => {
    if (!preferences) return
    updatePreference(
      'skills',
      preferences.skills.map((s) =>
        s.id === id
          ? { ...s, weight: s.weight === 'required' ? 'nice_to_have' : 'required' }
          : s
      )
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!preferences) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load preferences. Please try again.</AlertDescription>
      </Alert>
    )
  }

  const isEnabled = preferences.enabled && preferences.status === 'active'
  const isPaused = preferences.enabled && preferences.status === 'paused'
  const canEnable = preferences.preferred_job_titles.length > 0 &&
    preferences.job_types.length > 0 &&
    preferences.employment_types.length > 0 &&
    preferences.preferred_locations.length > 0

  return (
    <div className="space-y-6">
      {/* Auto-Apply Control */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Apply Control</CardTitle>
          <CardDescription>
            Enable automated job applications that match your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-auto-apply">Enable Auto Apply</Label>
              <p className="text-sm text-muted-foreground">
                Automatically apply to jobs that match your preferences
              </p>
            </div>
            <Switch
              id="enable-auto-apply"
              checked={preferences.enabled}
              onCheckedChange={handleToggleEnabled}
              disabled={isSaving || (!canEnable && !preferences.enabled)}
            />
          </div>

          {preferences.enabled && (
            <div className="flex items-center gap-2">
              {isEnabled && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              {isPaused && (
                <Badge variant="secondary">
                  <Pause className="h-3 w-3 mr-1" />
                  Paused
                </Badge>
              )}
              {preferences.status === 'disabled' && (
                <Badge variant="destructive">
                  <X className="h-3 w-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
          )}

          {preferences.enabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Auto apply only happens when jobs strictly match your preferences.
              </AlertDescription>
            </Alert>
          )}

          {!canEnable && !preferences.enabled && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please complete job preferences, locations, and experience levels before enabling auto-apply.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Job Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Job Preferences</CardTitle>
          <CardDescription>Define what types of jobs to apply for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Job Titles */}
          <div className="space-y-2">
            <Label>Preferred Job Titles *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Software Engineer, Product Manager"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addJobTitle()
                  }
                }}
              />
              <Button type="button" onClick={addJobTitle} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.job_titles && (
              <p className="text-sm text-destructive">{errors.job_titles}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_job_titles.map((title) => (
                <Badge key={title.id} variant="secondary" className="gap-2">
                  <GripVertical className="h-3 w-3" />
                  {title.title}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => removeJobTitle(title.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Job Types */}
          <div className="space-y-2">
            <Label>Job Types *</Label>
            {errors.job_types && (
              <p className="text-sm text-destructive">{errors.job_types}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {(['remote', 'hybrid', 'onsite'] as JobType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={preferences.job_types.includes(type) ? 'default' : 'outline'}
                  onClick={() => toggleJobType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Employment Types */}
          <div className="space-y-2">
            <Label>Employment Types *</Label>
            {errors.employment_types && (
              <p className="text-sm text-destructive">{errors.employment_types}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {(['full_time', 'contract', 'freelance', 'part_time', 'internship'] as EmploymentType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={preferences.employment_types.includes(type) ? 'default' : 'outline'}
                  onClick={() => toggleEmploymentType(type)}
                  className="capitalize"
                >
                  {type.replace('_', '-')}
                </Button>
              ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div className="space-y-2">
            <Label>Preferred Locations *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., San Francisco, CA or Remote"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addLocation()
                  }
                }}
              />
              <Button type="button" onClick={addLocation} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.locations && (
              <p className="text-sm text-destructive">{errors.locations}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_locations.map((location) => (
                <Badge key={location.id} variant="secondary" className="gap-2">
                  {location.location}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => removeLocation(location.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary & Seniority Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Salary & Seniority Filters</CardTitle>
          <CardDescription>Set hard constraints for auto-apply (jobs outside these will never apply)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Salary Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Salary Range</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value: Currency) => updatePreference('currency', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary-min">Min Salary</Label>
                <Input
                  id="salary-min"
                  type="number"
                  placeholder="0"
                  value={preferences.salary_min || ''}
                  onChange={(e) =>
                    updatePreference('salary_min', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-max">Max Salary</Label>
                <Input
                  id="salary-max"
                  type="number"
                  placeholder="No limit"
                  value={preferences.salary_max || ''}
                  onChange={(e) =>
                    updatePreference('salary_max', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
            {errors.salary && (
              <p className="text-sm text-destructive">{errors.salary}</p>
            )}
          </div>

          {/* Experience Levels */}
          <div className="space-y-2">
            <Label>Experience Levels *</Label>
            {errors.experience_levels && (
              <p className="text-sm text-destructive">{errors.experience_levels}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {(['intern', 'junior', 'mid', 'senior', 'lead'] as ExperienceLevel[]).map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={preferences.experience_levels.includes(level) ? 'default' : 'outline'}
                  onClick={() => toggleExperienceLevel(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Matching Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Matching Intelligence</CardTitle>
          <CardDescription>Configure skill matching and confidence thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., React, Python, AWS"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant={skill.weight === 'required' ? 'default' : 'secondary'}
                  className="gap-2"
                >
                  {skill.skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => toggleSkillWeight(skill.id)}
                    title={skill.weight === 'required' ? 'Required - Click to make optional' : 'Optional - Click to make required'}
                  >
                    {skill.weight === 'required' ? '✓' : '○'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => removeSkill(skill.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Match Confidence */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Match Confidence Threshold *</Label>
              <span className="text-sm font-medium">{preferences.match_confidence_threshold}%</span>
            </div>
            <Slider
              value={[preferences.match_confidence_threshold]}
              onValueChange={([value]) => updatePreference('match_confidence_threshold', value)}
              min={70}
              max={100}
              step={5}
              className="w-full"
            />
            {errors.match_confidence && (
              <p className="text-sm text-destructive">{errors.match_confidence}</p>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>70% - Aggressive</span>
              <span>80% - Balanced</span>
              <span>90% - Strict</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Auto apply will only trigger when match confidence exceeds this threshold.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Automation Safety Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Safety Controls</CardTitle>
          <CardDescription>Set limits to prevent excessive applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-daily">Max Applications Per Day *</Label>
              <Input
                id="max-daily"
                type="number"
                min={1}
                max={50}
                value={preferences.max_applications_per_day}
                onChange={(e) =>
                  updatePreference('max_applications_per_day', parseInt(e.target.value) || 1)
                }
              />
              {errors.max_daily && (
                <p className="text-sm text-destructive">{errors.max_daily}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-weekly">Max Applications Per Week *</Label>
              <Input
                id="max-weekly"
                type="number"
                min={1}
                max={200}
                value={preferences.max_applications_per_week}
                onChange={(e) =>
                  updatePreference('max_applications_per_week', parseInt(e.target.value) || 1)
                }
              />
              {errors.max_weekly && (
                <p className="text-sm text-destructive">{errors.max_weekly}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="require-review">Require Review Before Final Submission</Label>
              <p className="text-sm text-muted-foreground">
                Pause before submitting each application for your review
              </p>
            </div>
            <Switch
              id="require-review"
              checked={preferences.require_review_before_submission}
              onCheckedChange={(checked) =>
                updatePreference('require_review_before_submission', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Transparency & Trust */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Auto-Applied Jobs</CardTitle>
          <CardDescription>View your recent automated applications</CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{stats.total_auto_applied}</div>
                <div className="text-sm text-muted-foreground">Total Applied</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.successful_applications}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{stats.applications_today}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{stats.applications_this_week}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          )}

          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No auto-applied jobs yet</p>
              <p className="text-sm">Jobs will appear here once auto-apply is active</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{job.job_title}</div>
                    <div className="text-sm text-muted-foreground">{job.company_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Applied {new Date(job.applied_at).toLocaleDateString()} • Using {job.resume_version_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge
                        variant={
                          job.confidence_score >= 90
                            ? 'default'
                            : job.confidence_score >= 80
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {job.confidence_score}% match
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1 capitalize">
                        {job.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => loadPreferences()}
          disabled={isSaving}
        >
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}

