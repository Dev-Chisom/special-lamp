"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, AlertCircle, CheckCircle2 } from "lucide-react"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import type { ApiClientError } from "@/services/api-client"

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
    token?: string
    general?: string
  }>({})
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!token) {
      setErrors({
        token: "Invalid or missing reset token. Please request a new password reset link.",
      })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await authService.resetPassword({
        token,
        new_password: password,
      })
      
      setSuccess(true)
      toast.success("Password reset successfully!")
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
    } catch (error: any) {
      console.error("Reset password error:", error)

      // Handle field-specific errors
      if (error instanceof Error && 'fieldErrors' in error) {
        const apiError = error as ApiClientError
        const fieldErrors = apiError.getAllFieldErrors()
        
        const newErrors: typeof errors = {}
        
        // Map backend field names to form field names
        if (fieldErrors.password || fieldErrors.new_password) {
          newErrors.password = (fieldErrors.password || fieldErrors.new_password)?.[0]
        }
        if (fieldErrors.token) {
          newErrors.token = fieldErrors.token[0]
        }
        
        // General error if no field-specific errors
        if (Object.keys(newErrors).length === 0) {
          newErrors.general = apiError.getGeneralError()
        }
        
        setErrors(newErrors)
      } else {
        // General error
        const errorMessage = error?.message || "Failed to reset password. Please try again."
        
        // Check if it's a token error
        if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('expired')) {
          setErrors({
            token: errorMessage,
          })
        } else {
          setErrors({
            general: errorMessage,
          })
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/forgot-password">
              <Button className="w-full">Request new reset link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Password reset successful</CardTitle>
            <CardDescription>
              Your password has been successfully reset. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full">Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(errors.general || errors.token) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general || errors.token}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }))
                  }
                }}
                placeholder="At least 8 characters"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                disabled={isSubmitting}
                required
                minLength={8}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must contain uppercase, lowercase, and number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
                placeholder="Re-enter your password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                disabled={isSubmitting}
                required
                minLength={8}
              />
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting password..." : "Reset password"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
