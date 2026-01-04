"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, AlertCircle } from "lucide-react"
import { oauthService } from "@/services/oauth.service"
import { useAuthStore } from "@/store/auth.store"
import { toast } from "sonner"
import type { ApiClientError } from "@/services/api-client"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, isLoading } = useAuthStore()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    full_name?: string
    email?: string
    password?: string
    general?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleSignUp = () => {
    try {
      oauthService.initiateGoogleOAuth('/dashboard')
    } catch (error) {
      toast.error("Failed to initiate Google sign-up. Please try again.")
      console.error("Google OAuth error:", error)
    }
  }

  const handleLinkedInSignUp = () => {
    try {
      oauthService.initiateLinkedInOAuth('/dashboard')
    } catch (error) {
      toast.error("Failed to initiate LinkedIn sign-up. Please try again.")
      console.error("LinkedIn OAuth error:", error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!fullName.trim()) {
      newErrors.full_name = "Full name is required"
    } else if (fullName.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await signUp({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      })
      
      toast.success("Account created successfully!")
      router.push('/dashboard')
    } catch (error: any) {
      console.error("Sign up error:", error)

      // Handle field-specific errors
      if (error instanceof Error && 'fieldErrors' in error) {
        const apiError = error as ApiClientError
        const fieldErrors = apiError.getAllFieldErrors()
        
        const newErrors: typeof errors = {}
        
        // Map backend field names to form field names
        if (fieldErrors.full_name) {
          newErrors.full_name = fieldErrors.full_name[0]
        } else if (fieldErrors.name) {
          newErrors.full_name = fieldErrors.name[0]
        }
        if (fieldErrors.email) {
          newErrors.email = fieldErrors.email[0]
        }
        if (fieldErrors.password) {
          newErrors.password = fieldErrors.password[0]
        }
        
        // General error if no field-specific errors
        if (Object.keys(newErrors).length === 0) {
          newErrors.general = apiError.getGeneralError()
        }
        
        setErrors(newErrors)
      } else {
        // General error
        setErrors({
          general: error?.message || "Failed to create account. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Start optimizing your resume with AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleGoogleSignUp} disabled={isSubmitting || isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" onClick={handleLinkedInSignUp} disabled={isSubmitting || isLoading}>
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.full_name) {
                    setErrors((prev) => ({ ...prev, full_name: undefined }))
                  }
                }}
                aria-invalid={!!errors.full_name}
                aria-describedby={errors.full_name ? "name-error" : undefined}
                disabled={isSubmitting || isLoading}
                required
              />
              {errors.full_name && (
                <p id="name-error" className="text-sm text-destructive" role="alert">
                  {errors.full_name}
                </p>
              )}
            </div>
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
                disabled={isSubmitting || isLoading}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                disabled={isSubmitting || isLoading}
                required
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
