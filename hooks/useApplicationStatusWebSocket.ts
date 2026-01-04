"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ApplicationRun } from '@/services/application.service'

export type WebSocketConnectionState = 
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"

export interface UseApplicationStatusWebSocketOptions {
  applicationId: string
  token: string
  onStatusUpdate?: (status: ApplicationRun) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onComplete?: (status: ApplicationRun) => void
  autoReconnect?: boolean
  maxReconnectAttempts?: number
}

const PING_INTERVAL = 30000 // 30 seconds - ping every 30s to keep connection alive

/**
 * React hook for WebSocket connection to application status updates
 * 
 * Follows backend WebSocket specification:
 * - Endpoint: WS /api/v1/applications/{application_id}/ws?token={jwt_token}
 * - Token must be URL-encoded in query parameter
 * - Uses ws:// for dev, wss:// for production
 * - Supports ping/pong heartbeat for connection health
 */
export function useApplicationStatusWebSocket(
  options: UseApplicationStatusWebSocketOptions
) {
  const {
    applicationId,
    token,
    onStatusUpdate,
    onError,
    onConnect,
    onDisconnect,
    onComplete,
    autoReconnect = true,
    maxReconnectAttempts = 5
  } = options

  const [status, setStatus] = useState<ApplicationRun | null>(null)
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>("disconnected")
  const [error, setError] = useState<Error | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const isManualCloseRef = useRef(false)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Build WebSocket URL following backend specification
  const getWebSocketUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    
    // Determine protocol: wss:// for https, ws:// for http
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    
    // Get host from env or default to localhost:8000
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                   process.env.NEXT_PUBLIC_API_BASE_URL || 
                   'http://localhost:8000/api/v1'
    
    // Extract host from API URL (remove protocol and /api/v1)
    const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '')
    
    // Build WebSocket URL with URL-encoded token in query parameter
    const wsUrl = `${protocol}//${host}/api/v1/applications/${applicationId}/ws?token=${encodeURIComponent(token)}`
    
    return wsUrl
  }, [applicationId, token])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!applicationId || !token) {
      console.warn('⚠️ Cannot connect: missing applicationId or token')
      return
    }

    // Don't reconnect if manually closed
    if (isManualCloseRef.current) {
      return
    }

    // Don't connect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected')
      return
    }

    // Don't connect if already connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('⏳ WebSocket already connecting')
      return
    }

    try {
      setConnectionState("connecting")
      setError(null)

      const url = getWebSocketUrl()
      console.log('🔌 Connecting to WebSocket...', {
        applicationId,
        url: url.replace(/token=[^&]+/, 'token=***'), // Don't log actual token
        readyState: wsRef.current?.readyState
      })
      
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected for application', applicationId)
        setConnectionState("connected")
        reconnectAttemptsRef.current = 0 // Reset reconnect attempts on successful connection
        isManualCloseRef.current = false
        onConnect?.()

        // Start ping interval for connection health (heartbeat)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping')
          }
        }, PING_INTERVAL)
      }

      ws.onmessage = (event) => {
        try {
          // Handle pong response (heartbeat acknowledgment)
          if (event.data === 'pong') {
            // Connection is alive, just acknowledge
            return
          }

          // Parse JSON status update
          const statusUpdate: ApplicationRun = JSON.parse(event.data)
          console.log('📨 WebSocket status update:', {
            id: statusUpdate.id,
            status: statusUpdate.status,
            progress: statusUpdate.progress,
            current_step: statusUpdate.current_step,
            requires_user_action: statusUpdate.requires_user_action
          })
          
          setStatus(statusUpdate)
          onStatusUpdate?.(statusUpdate)

          // Handle user action required (WAITING_FOR_USER status)
          if (statusUpdate.status === 'waiting_for_user' && statusUpdate.requires_user_action) {
            console.log('⚠️ User action required:', {
              action: statusUpdate.user_action_required,
              url: statusUpdate.user_action_url
            })
          }

          // Check if terminal state and call onComplete
          const TERMINAL_STATES: ApplicationRun['status'][] = [
            'submitted', 
            'failed', 
            'aborted'
          ]
          if (TERMINAL_STATES.includes(statusUpdate.status)) {
            onComplete?.(statusUpdate)
          }
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err)
          const parseError = err instanceof Error ? err : new Error('Invalid message format')
          setError(parseError)
          onError?.(parseError)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error event:', error)
        // Note: The actual error details are in ws.onclose
        setConnectionState("error")
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean
        })
        
        setConnectionState("disconnected")

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }

        // Handle different close codes per backend specification
        if (event.code === 1008) {
          // Policy violation - Authentication/authorization error
          // This includes token expiration
          // Note: Token refresh should be handled at the component level
          // The WebSocket closes with 1008, and the component should:
          // 1. Refresh the token using the refresh token endpoint
          // 2. Reconnect with the new token
          const authError = new Error(
            event.reason || 'Authentication failed. Token may have expired.'
          )
          setError(authError)
          setConnectionState("error")
          onError?.(authError)
          console.error('❌ Connection rejected (auth error):', event.reason)
          return // Don't attempt to reconnect automatically on auth errors
        } else if (event.code === 1006) {
          // Abnormal closure (network issue, server error)
          console.warn('⚠️ Connection closed abnormally (network/server error)')
          if (!event.wasClean) {
            const networkError = new Error('Connection closed abnormally. Network or server issue.')
            setError(networkError)
            setConnectionState("error")
            onError?.(networkError)
          }
        } else if (event.code === 1000) {
          // Normal closure
          console.log('✅ Connection closed normally')
          setError(null)
        } else {
          // Other close codes
          if (!event.wasClean) {
            const closeError = new Error(
              event.reason || `WebSocket closed with code ${event.code}`
            )
            setError(closeError)
            setConnectionState("error")
            onError?.(closeError)
          }
        }

        onDisconnect?.()

        // Auto-reconnect on non-auth errors (if enabled and not manually closed)
        if (
          autoReconnect && 
          !isManualCloseRef.current && 
          event.code !== 1008 && // Don't reconnect on auth errors
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000)
          
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          const maxAttemptsError = new Error('Failed to reconnect after multiple attempts')
          setError(maxAttemptsError)
          setConnectionState("error")
          onError?.(maxAttemptsError)
        }
      }

    } catch (err) {
      console.error('❌ Failed to create WebSocket:', err)
      setConnectionState("error")
      const error = err instanceof Error ? err : new Error('Failed to connect')
      setError(error)
      onError?.(error)
    }
  }, [
    applicationId, 
    token, 
    getWebSocketUrl, 
    autoReconnect, 
    maxReconnectAttempts, 
    onStatusUpdate, 
    onError, 
    onConnect, 
    onDisconnect, 
    onComplete
  ])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    isManualCloseRef.current = true
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect') // Normal closure
      wsRef.current = null
    }

    setConnectionState("disconnected")
  }, [])

  // Reconnect manually
  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    isManualCloseRef.current = false
    setTimeout(() => {
      connect()
    }, 100)
  }, [connect, disconnect])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (applicationId && token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [applicationId, token, connect, disconnect])

  return {
    status,
    connectionState,
    error,
    isConnected: connectionState === "connected",
    connect,
    disconnect,
    reconnect
  }
}
