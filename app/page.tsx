import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search, FileText, Wand2, MessageSquare, Brain, TrendingUp, Target, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold">ApplyEngine</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="#features"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="text-xs sm:text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Land Your Dream Job with AI-Powered Resume Optimization
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            Beat ATS systems, optimize your resume, generate tailored cover letters, and ace interviews with our
            intelligent platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Sparkles className="h-5 w-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">92%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">ATS Pass Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">50K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Jobs Analyzed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">10K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Success Stories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Everything You Need to Get Hired</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform helps you optimize every step of your job search journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            icon={<Search className="h-6 w-6" />}
            title="ATS Resume Scanner"
            description="Get instant compatibility scores and detailed recommendations to pass applicant tracking systems"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<Wand2 className="h-6 w-6" />}
            title="AI Resume Rewriting"
            description="Transform your resume with AI-powered suggestions that highlight your achievements with impact"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Cover Letter Generator"
            description="Create personalized, compelling cover letters tailored to each job description in seconds"
            gradient="from-emerald-500 to-teal-500"
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Job Recommendations"
            description="Discover relevant job opportunities matched to your skills and preferences automatically"
            gradient="from-orange-500 to-red-500"
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Interview Preparation"
            description="Practice with AI-powered mock interviews and get detailed feedback on your responses"
            gradient="from-indigo-500 to-blue-500"
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Auto Apply"
            description="Automatically apply to jobs that match your preferences, saving hours of application time"
            gradient="from-violet-500 to-purple-500"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Get started in minutes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <StepCard number="1" title="Upload Resume" description="Upload your existing resume in any format" />
          <StepCard
            number="2"
            title="Paste Job Description"
            description="Add the job description you're applying for"
          />
          <StepCard number="3" title="Get AI Analysis" description="Receive instant ATS score and recommendations" />
          <StepCard number="4" title="Optimize & Apply" description="Implement suggestions and land interviews" />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <PricingCard
            name="Free"
            price="$0"
            period=""
            description="Build habits and trust the platform"
            icon={<Sparkles className="h-5 w-5" />}
            features={[
              "1 resume scan per week",
              "3-5 job matches per day",
              "Basic ATS score",
              "Limited AI suggestions",
              "Progress tracking & streaks",
            ]}
            limitations={["Daily caps on features", 'Locked "best match" job', "No bulk exports"]}
            ctaText="Get Started Free"
            ctaVariant="outline"
            ctaHref="/auth/signup"
          />

          {/* Weekly Plan */}
          <PricingCard
            name="Weekly"
            price="$4.99"
            period="/week"
            description="Perfect for urgent job hunters"
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            iconGradient="from-primary to-accent"
            features={[
              "Unlimited resume scans",
              "Full AI optimization",
              "Priority job drops",
              "Unlimited cover letters",
              "Interview preparation",
              "Cancel anytime",
            ]}
            ctaText="Start Weekly Plan"
            ctaVariant="default"
            ctaHref="/auth/signup"
            popular
            badge="Best for quick results"
          />

          {/* Monthly Plan */}
          <PricingCard
            name="Monthly"
            price="$11.99"
            period="/month"
            description="Best value for serious job seekers"
            icon={<Brain className="h-5 w-5 text-white" />}
            iconGradient="from-emerald-500 to-teal-500"
            features={[
              "Everything in Weekly",
              "Better value (save 40%)",
              "Saved resume versions",
              "Auto Apply to matching jobs",
              "Priority support",
              "Advanced analytics",
            ]}
            ctaText="Start Monthly Plan"
            ctaVariant="outline"
            ctaHref="/auth/signup"
            badge="Best value"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
          <CardContent className="relative p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have successfully optimized their resumes and landed interviews at top
              companies
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Sparkles className="h-5 w-5" />
                <span className="hidden sm:inline">Start Free Trial - No Credit Card Required</span>
                <span className="sm:hidden">Start Free Trial</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Target className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">ApplyEngine</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">2025 ApplyEngine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-6">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold sm:text-xl mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  period,
  description,
  icon,
  iconGradient,
  features,
  limitations,
  ctaText,
  ctaVariant,
  ctaHref,
  popular,
  badge,
}: {
  name: string
  price: string
  period?: string
  description: string
  icon: React.ReactNode
  iconGradient?: string
  features: string[]
  limitations?: string[]
  ctaText: string
  ctaVariant: "default" | "outline"
  ctaHref: string
  popular?: boolean
  badge?: string
}) {
  return (
    <Card className={`relative ${popular ? "border-primary shadow-lg shadow-primary/20" : ""}`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className={popular ? "bg-gradient-to-r from-primary to-accent" : ""}>{badge}</Badge>
        </div>
      )}
      <CardContent className="p-6">
        <div
          className={`w-10 h-10 rounded-lg ${iconGradient ? `bg-gradient-to-br ${iconGradient}` : "bg-muted"} flex items-center justify-center mb-4`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="mb-6">
          <span className="text-3xl sm:text-4xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground">{period}</span>}
        </div>
        <Link href={ctaHref}>
          <Button variant={ctaVariant} className={`w-full mb-6 ${ctaVariant === "outline" ? "bg-transparent" : ""}`}>
            {ctaText}
          </Button>
        </Link>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-primary mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
          {limitations && limitations.length > 0 && (
            <>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Limitations:</p>
              </div>
              {limitations.map((limitation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-muted-foreground">{limitation}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
