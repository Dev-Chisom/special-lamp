"use client"

import { useParams, useRouter } from "next/navigation"
import { useApplicationStatus } from "@/hooks/useApplicationStatus"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, AlertTriangle, CheckCircle2, RefreshCw, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { applicationService, type ApplicationRun, type ApplicationLogEntry, type ApplicationStep, type ApplicationEvent } from "@/services/application.service"
import { ApplicationReviewModal } from "@/components/application/application-review-modal"
import { toast } from "sonner"

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
  const [logs, setLogs] = useState<ApplicationLogEntry[]>([])
  const [events, setEvents] = useState<ApplicationEvent[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

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
      // Update logs if they're included in the status response
      if (updatedStatus.log_entries && updatedStatus.log_entries.length > 0) {
        setLogs(updatedStatus.log_entries)
      }
      // Show review modal if status is waiting_for_user and it's a review action
      if (updatedStatus.status === 'waiting_for_user' && isReviewAction(updatedStatus.user_action_required)) {
        setShowReviewModal(true)
      }
    },
    onError: (err) => {
      console.error('Status update error:', err)
      toast.error(err.message || 'Failed to update application status')
    },
    onComplete: (finalStatus) => {
      console.log('Application completed:', finalStatus)
      toast.success('Application process completed')
    }
  })

  // Fetch logs and events separately
  useEffect(() => {
    if (!applicationId) return

    const fetchLogsAndEvents = async () => {
      // Fetch logs
      setIsLoadingLogs(true)
      try {
        const fetchedLogs = await applicationService.getApplicationLogs(applicationId)
        setLogs(fetchedLogs)
      } catch (error: any) {
        console.error('Failed to fetch logs:', error)
        // Use logs from application status if available
        if (application?.log_entries) {
          setLogs(application.log_entries)
        }
      } finally {
        setIsLoadingLogs(false)
      }

      // Fetch events
      setIsLoadingEvents(true)
      try {
        const fetchedEvents = await applicationService.getApplicationEvents(applicationId)
        setEvents(fetchedEvents)
      } catch (error: any) {
        console.error('Failed to fetch events:', error)
        // Events are optional, so don't fail if they're not available
      } finally {
        setIsLoadingEvents(false)
      }
    }

    // Fetch logs and events on mount and when status changes
    if (application) {
      fetchLogsAndEvents()
    }
  }, [applicationId, application?.status])

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
            {isWaitingForUser && application.user_action_required && !isReviewAction(application.user_action_required) && (
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

            {/* Review Required Alert (shows when review modal is closed but status is still waiting) */}
            {isWaitingForUser && application.user_action_required && isReviewAction(application.user_action_required) && !showReviewModal && (
              <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertTitle className="text-orange-800 dark:text-orange-200">Review Required</AlertTitle>
                <AlertDescription className="text-orange-700 dark:text-orange-300 mt-2 space-y-3">
                  <p>
                    The application process has been paused for your review. Please review the application details before it's submitted.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-fit"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Review Application
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

      {/* Application Steps and Logs */}
      {(application.current_step || logs.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Track the progress and view logs of your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="mt-4">
                <ApplicationSteps 
                  currentStep={application.current_step} 
                  stepsCompleted={application.steps_completed || 0}
                  totalSteps={application.total_steps || 0}
                  status={application.status}
                />
              </TabsContent>

              <TabsContent value="logs" className="mt-4">
                <ApplicationLogs 
                  logs={logs} 
                  isLoading={isLoadingLogs}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <ApplicationTimeline 
                  events={events} 
                  isLoading={isLoadingEvents}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Application Review Modal */}
      {application && (
        <ApplicationReviewModal
          application={application}
          open={showReviewModal}
          onApprove={() => {
            setShowReviewModal(false)
            // Resume polling will be triggered by the modal
            resumePolling()
          }}
          onReject={() => {
            setShowReviewModal(false)
            // Status will update to aborted/failed after rejection
            refresh()
          }}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  )
}

// Helper function to check if user_action_required is a review action
function isReviewAction(actionType: string | null | undefined): boolean {
  if (!actionType) return false
  const reviewActions = ['review', 'review_required', 'review_before_submission', 'user_review']
  return reviewActions.some(action => actionType.toLowerCase().includes(action.toLowerCase()))
}

// Application Steps Component
function ApplicationSteps({
  currentStep,
  stepsCompleted,
  totalSteps,
  status,
}: {
  currentStep?: ApplicationStep | null
  stepsCompleted: number
  totalSteps: number
  status: ApplicationRun['status']
}) {
  const allSteps: ApplicationStep[] = [
    'initializing',
    'filling_form',
    'uploading_resume',
    'answering_questions',
    'verification_required',
    'submitting',
    'completed'
  ]

  const getStepStatus = (step: ApplicationStep): 'completed' | 'current' | 'pending' => {
    const stepIndex = allSteps.indexOf(step)
    const currentIndex = currentStep ? allSteps.indexOf(currentStep) : -1
    
    if (stepIndex < stepsCompleted) return 'completed'
    if (stepIndex === currentIndex && status !== 'submitted' && status !== 'failed' && status !== 'aborted') return 'current'
    return 'pending'
  }

  const formatStepName = (step: ApplicationStep): string => {
    return step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="space-y-3">
      {allSteps.map((step, index) => {
        const stepStatus = getStepStatus(step)
        const isActive = stepStatus === 'current'
        const isCompleted = stepStatus === 'completed'
        const isPending = stepStatus === 'pending'

        return (
          <div
            key={step}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              isActive
                ? 'bg-primary/5 border-primary/20'
                : isCompleted
                ? 'bg-muted/50 border-border'
                : 'bg-background border-border/50 opacity-60'
            }`}
          >
            <div className="flex-shrink-0">
              {isCompleted ? (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              ) : isActive ? (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {formatStepName(step)}
              </p>
              {isActive && (
                <p className="text-xs text-muted-foreground mt-0.5">In progress...</p>
              )}
            </div>
            {isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
            {isActive && (
              <Badge variant="default" className="flex-shrink-0">
                Current
              </Badge>
            )}
          </div>
        )
      })}
      
      {status === 'submitted' && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              All steps completed successfully!
            </p>
          </div>
        </div>
      )}
      
      {(status === 'failed' || status === 'aborted') && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Application process {status === 'failed' ? 'failed' : 'was aborted'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Application Logs Component
function ApplicationLogs({
  logs,
  isLoading,
}: {
  logs: ApplicationLogEntry[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">No logs available yet</p>
      </div>
    )
  }

  const getLogIcon = (log: ApplicationLogEntry) => {
    // Use step_type if available (new format), otherwise fall back to level (old format)
    const logType = log.step_type || log.level
    switch (logType) {
      case 'success':
      case 'extraction':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
      case 'navigation':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'captcha':
      case 'consent':
      case 'input':
        return <Loader2 className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getLogColor = (log: ApplicationLogEntry) => {
    // Use step_type if available (new format), otherwise fall back to level (old format)
    const logType = log.step_type || log.level
    switch (logType) {
      case 'success':
      case 'extraction':
        return 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10'
      case 'info':
      case 'navigation':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
      case 'captcha':
      case 'consent':
      case 'input':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
      default:
        return 'border-border bg-muted/30'
    }
  }

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-2 pr-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getLogColor(log.level)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getLogIcon(log)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-foreground">
                  {log.message}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {(log.step_name || log.step) && (
                  <Badge variant="outline" className="text-xs">
                    {log.step_name || log.step?.replace(/_/g, ' ')}
                  </Badge>
                )}
                {log.step_type && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {log.step_type.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              {log.screenshot_url && (
                <div className="mt-2">
                  <a
                    href={`${log.screenshot_url}?token=${typeof window !== 'undefined' ? localStorage.getItem('applyengine_access_token') || '' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View Screenshot
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

// Application Timeline Component
function ApplicationTimeline({
  events,
  isLoading,
}: {
  events: ApplicationEvent[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">No events available yet</p>
      </div>
    )
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'STARTED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'STEP_COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'PAUSED':
      case 'WAITING_FOR_USER':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'COMPLETED':
      case 'SUBMITTED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'STARTED':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
      case 'STEP_COMPLETED':
        return 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
      case 'PAUSED':
      case 'WAITING_FOR_USER':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
      case 'ERROR':
        return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
      case 'COMPLETED':
      case 'SUBMITTED':
        return 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
      default:
        return 'border-border bg-muted/30'
    }
  }

  const formatEventType = (eventType: string): string => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-2 pr-4">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getEventColor(event.event_type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getEventIcon(event.event_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {formatEventType(event.event_type)}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.event_data && Object.keys(event.event_data).length > 0 && (
                <div className="mt-2 p-2 bg-background/50 rounded text-xs font-mono overflow-auto max-h-32">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(event.event_data, null, 2)}
                  </pre>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
