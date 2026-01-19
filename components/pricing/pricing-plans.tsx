"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Sparkles, Zap, TrendingUp, X } from "lucide-react"
import Link from "next/link"

export function PricingPlans() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle>Free</CardTitle>
              <CardDescription>Build habits and trust the platform</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started Free
                </Button>
              </Link>
              <div className="space-y-3">
                <Feature>1 resume scan per week</Feature>
                <Feature>3-5 job matches per day</Feature>
                <Feature>Basic ATS score</Feature>
                <Feature>Limited AI suggestions</Feature>
                <Feature>Progress tracking & streaks</Feature>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Limitations:</p>
                <Limitation>Daily caps on features</Limitation>
                <Limitation>Locked "best match" job</Limitation>
                <Limitation>No bulk exports</Limitation>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Plan */}
          <Card className="relative border-primary shadow-lg shadow-primary/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-primary to-accent">Best for quick results</Badge>
            </div>
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <CardTitle>Weekly</CardTitle>
              <CardDescription>Perfect for urgent job hunters</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$4.99</span>
                <span className="text-muted-foreground">/week</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Start Weekly Plan</Button>
              <div className="space-y-3">
                <Feature>Unlimited resume scans</Feature>
                <Feature>Full AI optimization</Feature>
                <Feature>Priority job drops</Feature>
                <Feature>Unlimited cover letters</Feature>
                <Feature>Interview preparation</Feature>
                <Feature>Cancel anytime</Feature>
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-center text-muted-foreground">
                  "I just need this for a week" - converts very well
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">
                Best value
              </Badge>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <CardTitle>Monthly</CardTitle>
              <CardDescription>Best value for serious job seekers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$11.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Save 40% vs weekly</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full bg-transparent">
                Start Monthly Plan
              </Button>
              <div className="space-y-3">
                <Feature>Everything in Weekly</Feature>
                <Feature>Better value (save 40%)</Feature>
                <Feature>Saved resume versions</Feature>
                <Feature>Auto Apply to matching jobs</Feature>
                <Feature>Priority support</Feature>
                <Feature>Advanced analytics</Feature>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-center text-muted-foreground">Most serious users choose this</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      <span className="text-sm">{children}</span>
    </div>
  )
}

function Limitation({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 mb-2">
      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  )
}
