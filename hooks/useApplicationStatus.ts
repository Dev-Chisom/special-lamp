"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { applicationService, type ApplicationRun } from '@/services/application.service'

export interface UseApplicationStatusOptions {
  applicationId: string
  onStatusUpdate?: (status: ApplicationRun) => void
  onError?: (error: Error) => void
  onComplete?: (status: ApplicationRun) => void
  // Hard timeout in milliseconds (default: 30 minutes)
  timeout?: number
}

/**
 * React hook for polling application status updates
 * 
 * Golden Rules:
 * - Never overlap requests
 * - Never poll after terminal state
 * - Polling interval depends on status
 * - Hard timeout exists
 * - FE must rely on backend status + step, not assumptions
 * - No retry logic
 * - No WebSocket fallback
 * - No hidden polling restarts
 */
export function useApplicationStatus(options: UseApplicationStatusOptions) {
  const {
    applicationId,
    onStatusUpdate,
    onError,
    onComplete,
    timeout = 30 * 60 * 1000, // 30 minutes default
  } = options

  const [status, setStatus] = useState<ApplicationRun | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Refs to track polling state (control flow)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(true)
  const isRequestInFlightRef = useRef(false) // Prevent overlapping requests
  const startTimeRef = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevStatusRef = useRef<ApplicationRun | null>(null) // Track previous status for callbacks

  // Store callbacks in refs to prevent dependency changes
  const onStatusUpdateRef = useRef(onStatusUpdate)
  const onErrorRef = useRef(onError)
  const onCompleteRef = useRef(onComplete)

  // Update callback refs when they change (but don't trigger re-renders)
  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate
    onErrorRef.current = onError
    onCompleteRef.current = onComplete
  }, [onStatusUpdate, onError, onComplete])

  // Terminal states - stop polling immediately
  const TERMINAL_STATES: ApplicationRun['status'][] = [
    'submitted',
    'failed',
    'aborted'
  ]

  // Waiting states - poll every 5 seconds (slower)
  const WAITING_STATES: ApplicationRun['status'][] = [
    'waiting_for_user'
  ]

  // Active states - poll every 2 seconds (faster)
  const ACTIVE_STATES: ApplicationRun['status'][] = [
    'pending',
    'preparing_materials',
    'running'
  ]

  /**
   * Determine polling interval based on current status
   * - Active states: 2 seconds
   * - Waiting states: 5 seconds
   * - Terminal states: Should never be called (but return 0 to be safe)
   */
  const getPollInterval = useCallback((currentStatus: ApplicationRun | null): number => {
    if (!currentStatus) return 2000 // Default 2 seconds if no status yet
    
    if (TERMINAL_STATES.includes(currentStatus.status)) {
      return 0 // Should not poll terminal states
    }
    
    if (WAITING_STATES.includes(currentStatus.status)) {
      return 5000 // 5 seconds for waiting states
    }
    
    if (ACTIVE_STATES.includes(currentStatus.status)) {
      return 2000 // 2 seconds for active states
    }
    
    return 2000 // Default fallback
  }, [])

  /**
   * Cleanup function to clear all timeouts
   */
  const cleanup = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    isRequestInFlightRef.current = false
  }, [])

  /**
   * Fetch status from backend
   * - Never overlaps requests (isRequestInFlightRef guard)
   * - Stops on terminal state
   * - Stops on timeout
   * - No retry logic on error (just stop)
   * - Only calls callbacks on status changes
   */
  const fetchStatus = useCallback(async () => {
    // Guard: Never overlap requests
    if (isRequestInFlightRef.current) {
      return
    }

    // Guard: Don't poll if stopped
    if (!isPollingRef.current) {
      return
    }

    // Guard: Check hard timeout
    const elapsed = Date.now() - startTimeRef.current
    if (elapsed >= timeout) {
      console.warn('Application status polling timeout reached')
      isPollingRef.current = false
      const timeoutError = new Error('Application timeout: The application process took too long')
      setError(timeoutError)
      onErrorRef.current?.(timeoutError)
      cleanup()
      return
    }

    // Mark request as in-flight
    isRequestInFlightRef.current = true

    try {
      const data = await applicationService.getApplicationStatus(applicationId)
      
      // Update state (UI output only)
      setStatus(data)
      setIsLoading(false)
      setError(null)
      
      // Call callbacks ONLY on status changes (not every poll)
      const prevStatus = prevStatusRef.current
      if (!prevStatus || prevStatus.status !== data.status) {
        onStatusUpdateRef.current?.(data)
      }
      
      // Update previous status ref
      prevStatusRef.current = data

      // Stop polling if terminal state
      if (TERMINAL_STATES.includes(data.status)) {
        isPollingRef.current = false
        onCompleteRef.current?.(data)
        cleanup()
        return
      }

      // For WAITING_FOR_USER state, stop fast polling (user must resume manually)
      if (data.status === 'waiting_for_user') {
        isPollingRef.current = false
        cleanup()
        return
      }

      // Schedule next poll with status-based interval
      if (isPollingRef.current) {
        const interval = getPollInterval(data)
        
        // Only schedule next poll if interval > 0
        if (interval > 0) {
          pollTimeoutRef.current = setTimeout(() => {
            isRequestInFlightRef.current = false
            if (isPollingRef.current) {
              fetchStatus()
            }
          }, interval)
        } else {
          // Terminal state or invalid interval - stop polling
          isPollingRef.current = false
          cleanup()
        }
      }
    } catch (err) {
      console.error('Error fetching application status:', err)
      const error = err instanceof Error ? err : new Error('Failed to fetch status')
      setError(error)
      setIsLoading(false)
      onErrorRef.current?.(error)
      
      // NO RETRY LOGIC - Just stop polling on error
      isPollingRef.current = false
      cleanup()
    } finally {
      isRequestInFlightRef.current = false
    }
  }, [applicationId, getPollInterval, timeout, cleanup])

  /**
   * Manual refresh function
   * Only works if not already polling (to prevent overlapping)
   */
  const refresh = useCallback(() => {
    if (isRequestInFlightRef.current) {
      return // Don't refresh if request is in flight
    }
    
    if (applicationId && isPollingRef.current) {
      fetchStatus()
    }
  }, [applicationId, fetchStatus])

  /**
   * Resume polling after user action (for WAITING_FOR_USER state)
   * This should be called after user completes CAPTCHA/consent
   */
  const resumePolling = useCallback(async () => {
    if (!applicationId || !status) return
    
    try {
      // Get action type from application status
      const actionType = status.user_action_required || 'user_confirmation'
      const actionData: Record<string, any> = {
        confirmed: true,
      }
      
      // Notify backend that user action is complete
      await applicationService.confirmUserAction(applicationId, actionType, actionData)
      
      // Reset state
      isPollingRef.current = true
      isRequestInFlightRef.current = false
      startTimeRef.current = Date.now() // Reset timeout timer
      
      // Clear any existing timeouts
      cleanup()
      
      // Start polling again immediately
      fetchStatus()
    } catch (err) {
      console.error('Error confirming user action:', err)
      const error = err instanceof Error ? err : new Error('Failed to resume application')
      setError(error)
      onErrorRef.current?.(error)
    }
  }, [applicationId, status, fetchStatus, cleanup])

  /**
   * Stop polling manually (for cleanup)
   */
  const stopPolling = useCallback(() => {
    isPollingRef.current = false
    cleanup()
  }, [cleanup])

  // Initialize polling on mount
  useEffect(() => {
    if (!applicationId) return

    // Reset state
    isPollingRef.current = true
    isRequestInFlightRef.current = false
    startTimeRef.current = Date.now()
    prevStatusRef.current = null

    // Set hard timeout
    timeoutRef.current = setTimeout(() => {
      if (isPollingRef.current) {
        console.warn('Application status polling timeout reached')
        isPollingRef.current = false
        const timeoutError = new Error('Application timeout: The application process took too long')
        setError(timeoutError)
        onErrorRef.current?.(timeoutError)
        cleanup()
      }
    }, timeout)

    // Start initial fetch
    fetchStatus()

    // Cleanup on unmount
    return () => {
      isPollingRef.current = false
      cleanup()
    }
  }, [applicationId, timeout, fetchStatus, cleanup])

  // Derived state: isPolling (from ref, not state)
  const isPolling = isPollingRef.current && status !== null && !TERMINAL_STATES.includes(status.status)

  // Check if waiting for user action
  const isWaitingForUser = status?.status === 'waiting_for_user'

  return {
    status,
    isLoading,
    error,
    isPolling,
    isWaitingForUser,
    refresh,
    resumePolling,
    stopPolling
  }
}
