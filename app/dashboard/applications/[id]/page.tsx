"use client"

import { useParams, useRouter } from "next/navigation"
import { useApplicationStatus } from "@/hooks/useApplicationStatus"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react"
import type { ApplicationRun } from "@/services/application.service"

// Status badge colors and text
function getStatusBadgeColor(status: ApplicationRun['status']): string {
  const colors: Record<ApplicationRun['status'], string> = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    preparing_materials: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    running: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    waiting_for_user: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    submitted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    aborted: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  }
  return colors[status] || colors.pending
}

function getStatusText(status: ApplicationRun['status']): string {
  const texts: Record<ApplicationRun['status'], string> = {
    pending: 'Pending',
    preparing_materials: 'Preparing Materials',
    running: 'Running',
    waiting_for_user: 'Waiting for User',
    submitted: 'Submitted',
    failed: 'Failed',
    aborted: 'Aborted',
  }
  return texts[status] || 'Unknown'
}

export default function ApplicationRunPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params?.id as string

  const {
    status: application,
    isLoading,
    error,
    isPolling,
    isWaitingForUser,
    resumePolling,
    refresh
  } = useApplicationStatus({
    applicationId: applicationId || '',
    onStatusUpdate: (updatedStatus) => {
      console.log('Status updated:', updatedStatus)
    },
    onError: (err) => {
      console.error('Status update error:', err)
    },
    onComplete: (finalStatus) => {
      console.log('Application completed:', finalStatus)
    }
  })

  if (!applicationId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Invalid application ID</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading && !application) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !application) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="mt-2 ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Application not found</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate progress percentage
  const progressPercent = application.progress
    ? Math.round(application.progress * 100)
    : application.progress_percentage
    ? Math.round(parseFloat(application.progress_percentage))
    : 0

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Go Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Application Progress</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusBadgeColor(application.status)}>
                {getStatusText(application.status)}
              </Badge>
              {/* Polling Status Indicator */}
              {isPolling && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              )}
              {!isPolling && application.status && !['submitted', 'failed', 'aborted'].includes(application.status) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Progress: {progressPercent}%</p>
                {application.total_steps && (
                  <p className="text-sm text-muted-foreground">
                    {application.steps_completed || 0} / {application.total_steps} steps
                  </p>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Current Step */}
            {application.current_step && (
              <div>
                <p className="text-sm text-muted-foreground">Current Step</p>
                <p className="text-lg capitalize mt-1">
                  {application.current_step.replace(/_/g, ' ')}
                </p>
              </div>
            )}

            {/* User Action Required (WAITING_FOR_USER state) */}
            {isWaitingForUser && application.user_action_required && (
              <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertTitle className="text-orange-800 dark:text-orange-200">Action Required</AlertTitle>
                <AlertDescription className="text-orange-700 dark:text-orange-300 mt-2 space-y-3">
                  <p>
                    {application.user_action_required === 'captcha' && 
                      'The application process requires you to solve a CAPTCHA to continue.'}
                    {application.user_action_required === 'consent' && 
                      'The application process requires your consent to continue.'}
                    {!['captcha', 'consent'].includes(application.user_action_required) && 
                      `Action required: ${application.user_action_required}`}
                  </p>
                  {application.user_action_url && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-fit"
                        onClick={() => window.open(application.user_action_url, '_blank')}
                      >
                        Open Action Page →
                      </Button>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        After completing the action, click "Resume Application" below to continue.
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={resumePolling}
                  >
                    Resume Application
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {(application.error_reason || application.error_message) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="mt-2">
                  {application.error_reason || application.error_message}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {application.status === 'submitted' && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">Application Submitted!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 mt-2">
                  Your application has been successfully submitted.
                </AlertDescription>
              </Alert>
            )}

            {/* Last Updated */}
            {application.updated_at && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(application.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TODO: Add Application Steps, Log, and User Action Modal components */}
    </div>
  )
}
