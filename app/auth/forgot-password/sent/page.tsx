import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Check Your Email - PathForge AI",
  description: "Password reset email sent",
}

export default function ResetEmailSentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription className="text-balance">
            We've sent a password reset link to your email. Click the link in the email to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or{" "}
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              try again
            </Link>
          </div>

          <div className="text-center">
            <Link href="/auth/signin">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
