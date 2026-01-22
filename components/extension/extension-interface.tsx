"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Chrome, Download, CheckCircle2, Zap, Target, FileText, Sparkles, Shield } from "lucide-react"

export function ExtensionInterface() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
          <Chrome className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4">ApplyEngine Chrome Extension</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Apply to jobs faster with real-time ATS scoring and instant resume optimization
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            Add to Chrome - It's Free
          </Button>
          <Badge variant="secondary" className="text-sm py-2 px-4">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            10,000+ users
          </Badge>
        </div>
      </div>

      {/* Preview Image Placeholder */}
      <Card className="mb-12 overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="text-center">
            <Chrome className="h-16 w-16 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Extension Preview</p>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Real-Time ATS Scoring</h3>
                <p className="text-muted-foreground text-sm">
                  See your match score instantly as you browse job listings on LinkedIn, Indeed, and more
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">One-Click Application</h3>
                <p className="text-muted-foreground text-sm">
                  Auto-fill applications with your optimized resume and cover letter in seconds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Smart Job Tracking</h3>
                <p className="text-muted-foreground text-sm">
                  Automatically save and track all your applications without leaving the job site
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant recommendations to improve your match score before you apply
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Install the Extension</h4>
                <p className="text-muted-foreground text-sm">
                  Add ApplyEngine to Chrome in one click - it's completely free
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Browse Jobs Normally</h4>
                <p className="text-muted-foreground text-sm">
                  Visit LinkedIn, Indeed, or any job board - our extension works everywhere
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">See Your Match Score</h4>
                <p className="text-muted-foreground text-sm">
                  Get instant ATS scores and recommendations overlaid on job listings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Apply with Confidence</h4>
                <p className="text-muted-foreground text-sm">
                  Use our one-click apply feature with your optimized resume
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Your Privacy Matters</h3>
              <p className="text-muted-foreground text-sm">
                We never share your data with third parties. Your resumes and applications stay private and secure. The
                extension only activates on job sites when you're actively browsing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center mt-12">
        <Button size="lg" className="gap-2">
          <Download className="h-5 w-5" />
          Get the Extension Now
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          Compatible with Chrome, Edge, Brave, and other Chromium-based browsers
        </p>
      </div>
    </div>
  )
}
