"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Pause } from "lucide-react"
import { notificationService } from "@/services/notification.service"
import { type Notification, type NotificationType } from "@/types/notification"
import { toast } from "sonner"

interface NotificationsDropdownProps {
  pollInterval?: number // Default: 30000 (30 seconds)
}

export function NotificationsDropdown({ pollInterval = 30000 }: NotificationsDropdownProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const lastFetchTimeRef = useRef<number>(0)
  const isFetchingRef = useRef<boolean>(false)

  // Fetch notifications function - memoized with useCallback (removed isOpen dependency to prevent recreations)
  const fetchNotifications = useCallback(async (force = false) => {
    // Prevent duplicate simultaneous calls
    if (isFetchingRef.current && !force) {
      return
    }

    // Don't refetch if it's been less than 10 seconds (unless forced) - increased from 5 seconds
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTimeRef.current
    if (timeSinceLastFetch < 10000 && !force) {
      return
    }

    isFetchingRef.current = true
    lastFetchTimeRef.current = now

    try {
      setIsLoading(true)
      
      // Fetch notifications and unread count in parallel
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications({
          limit: 50,
          offset: 0,
        }),
        notificationService.getUnreadCount(),
      ])

      setNotifications(notificationsData)
      setUnreadCount(unreadCountData.unread_count)
    } catch (error: any) {
      console.error("Error fetching notifications:", error)
      // Don't show toast on polling errors to avoid spam
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, []) // Removed isOpen dependency - callback is stable now

  // Set up polling - only runs on mount/unmount
  useEffect(() => {
    // Initial fetch
    fetchNotifications(true)

    // Set up polling interval (default 30 seconds, but can be increased)
    const interval = setInterval(() => {
      fetchNotifications(false)
    }, pollInterval)

    return () => clearInterval(interval)
  }, [pollInterval, fetchNotifications])

  // Fetch when dropdown opens (with debounce to prevent rapid refetches)
  useEffect(() => {
    if (isOpen) {
      // Fetch when dropdown opens, but only if it's been more than 5 seconds since last fetch
      const now = Date.now()
      const timeSinceLastFetch = now - lastFetchTimeRef.current
      
      if (timeSinceLastFetch > 5000) {
        fetchNotifications(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]) // Only depend on isOpen, fetchNotifications is stable

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id)
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error: any) {
        console.error("Error marking notification as read:", error)
        // Continue anyway - user can still see the notification
      }
    }

    // Navigate to application URL if available
    if (notification.metadata?.application_url) {
      window.open(notification.metadata.application_url, "_blank")
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "application_submitted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case "application_failed":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case "application_paused":
        return <Pause className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      case "application_aborted":
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 relative">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px] sm:h-[400px]">
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-2">
                Application updates will appear here
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex-col items-start p-3 mb-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                    !notification.is_read ? "bg-muted/30" : ""
                  }`}
                  onSelect={(e) => {
                    e.preventDefault()
                    handleNotificationClick(notification)
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5 shrink-0">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold leading-tight">
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-1">{notification.message}</p>
                      {notification.metadata?.job_title && notification.metadata?.company && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification.metadata.job_title} at {notification.metadata.company}
                        </p>
                      )}
                      {notification.metadata?.error_reason && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {notification.metadata.error_reason}
                        </p>
                      )}
                      {notification.metadata?.application_url && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                          <ExternalLink className="h-3 w-3" />
                          <span>View Application</span>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                try {
                  await notificationService.markAllAsRead()
                  // Update local state
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
                  )
                  setUnreadCount(0)
                  toast.success("All notifications marked as read")
                } catch (error: any) {
                  console.error("Error marking all as read:", error)
                  toast.error(error?.message || "Failed to mark all as read")
                }
              }}
              className="cursor-pointer"
            >
              Mark all as read
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
