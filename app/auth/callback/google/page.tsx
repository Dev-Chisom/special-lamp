"use client"

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { oauthService } from '@/services/oauth.service'
import { useAuthStore } from '@/store/auth.store'
import { Spinner } from '@/components/ui/spinner'

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { fetchCurrentUser } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const state = searchParams.get('state')

      console.log('[GoogleCallback] Handling OAuth callback', { code: !!code, error, state })

      try {
        // Handle the OAuth callback - this stores tokens if they exist
        const result = await oauthService.handleOAuthCallback(
          'google',
          code || undefined,
          state || undefined,
          error || undefined
        )

        console.log('[GoogleCallback] OAuth callback result', result)

        if (!result.success) {
          console.error('[GoogleCallback] OAuth callback failed', result.error)
          // Redirect to sign-in with error
          router.push(`/auth/signin?error=${encodeURIComponent(result.error || 'oauth_failed')}`)
          return
        }

        // Tokens are stored, now fetch user data to update the store
        try {
          console.log('[GoogleCallback] Fetching current user...')
          await fetchCurrentUser()
          console.log('[GoogleCallback] User fetched successfully, redirecting...')
          
          // User data fetched successfully, redirect to dashboard
          const redirectUrl = result.redirectUrl || '/dashboard'
          console.log('[GoogleCallback] Redirecting to:', redirectUrl)
          router.push(redirectUrl)
        } catch (err) {
          // If fetch fails, tokens might not be valid
          console.error('[GoogleCallback] Failed to fetch user:', err)
          router.push('/auth/signin?error=invalid_tokens')
        }
      } catch (error) {
        console.error('[GoogleCallback] OAuth callback error:', error)
        router.push('/auth/signin?error=oauth_failed')
      }
    }

    handleCallback()
  }, [searchParams, fetchCurrentUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner className="h-8 w-8 mx-auto" />
        <p className="text-muted-foreground">Completing Google sign-in...</p>
      </div>
    </div>
  )
}

