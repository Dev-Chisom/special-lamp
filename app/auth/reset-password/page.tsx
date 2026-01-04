import { Suspense } from "react"
import ResetPasswordForm from "./reset-password-form"

export const metadata = {
  title: "Reset Password - PathForge AI",
  description: "Reset your password",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
