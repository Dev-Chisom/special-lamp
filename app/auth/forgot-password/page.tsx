"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import type { ApiClientError } from "@/services/api-client"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    general?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await authService.forgotPassword({ email: email.trim() })
      setSuccess(true)
      toast.success("Password reset link sent to your email")
    } catch (error: any) {
      console.error("Forgot password error:", error)

      // Handle field-specific errors
      if (error instanceof Error && 'fieldErrors' in error) {
        const apiError = error as ApiClientError
        const fieldErrors = apiError.getAllFieldErrors()
        
        const newErrors: typeof errors = {}
        
        if (fieldErrors.email) {
          newErrors.email = fieldErrors.email[0]
        }
        
        // General error if no field-specific errors
        if (Object.keys(newErrors).length === 0) {
          newErrors.general = apiError.getGeneralError()
        }
        
        setErrors(newErrors)
      } else {
        // General error
        setErrors({
          general: error?.message || "Failed to send reset link. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                If you don't see the email, check your spam folder or try again.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push('/auth/signin')} className="w-full">
                Back to sign in
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
                className="w-full"
              >
                Send another email
              </Button>
            </div>
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
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription>Enter your email and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isSubmitting}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
