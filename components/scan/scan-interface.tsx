"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CircularProgress } from "@/components/ui/circular-progress"
import {
  Scan,
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Brain,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

type ScanState = "idle" | "uploading" | "scanning" | "complete"

interface ScanResult {
  overallScore: number
  breakdown: {
    atsScore: number
    semanticScore: number
    formatScore: number
    experienceMatch: number
    educationMatch: number
  }
  strengths: string[]
  weaknesses: string[]
  missingKeywords: string[]
  recommendations: Array<{
    priority: "high" | "medium" | "low"
    action: string
    impact: string
    section: string
  }>
}

export function ScanInterface() {
  const [scanState, setScanState] = useState<ScanState>("idle")
  const [progress, setProgress] = useState(0)
  const [jobDescription, setJobDescription] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  const handleScan = async () => {
    if (!resumeFile || !jobDescription) return

    setScanState("scanning")

    // Simulate scanning progress
    const stages = [
      { progress: 20, duration: 500 },
      { progress: 40, duration: 800 },
      { progress: 60, duration: 1000 },
      { progress: 80, duration: 700 },
      { progress: 100, duration: 500 },
    ]

    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, stage.duration))
      setProgress(stage.progress)
    }

    // Mock scan result
    const mockResult: ScanResult = {
      overallScore: 85,
      breakdown: {
        atsScore: 82,
        semanticScore: 88,
        formatScore: 90,
        experienceMatch: 85,
        educationMatch: 80,
      },
      strengths: [
        "Strong technical skills alignment (React, Node.js, TypeScript)",
        "Relevant experience level (5+ years)",
        "Clear quantifiable achievements",
        "Well-structured sections with consistent formatting",
      ],
      weaknesses: [
        "Missing keywords: AWS, Docker, Kubernetes",
        "Limited leadership experience mentioned",
        "Could improve metrics in most recent role",
        "No mention of CI/CD or DevOps practices",
      ],
      missingKeywords: ["AWS", "Docker", "Kubernetes", "CI/CD", "Microservices", "GraphQL"],
      recommendations: [
        {
          priority: "high",
          action: "Add AWS experience from Project X",
          impact: "+8 points",
          section: "skills",
        },
        {
          priority: "high",
          action: "Include Docker and Kubernetes from infrastructure work",
          impact: "+6 points",
          section: "experience",
        },
        {
          priority: "medium",
          action: "Quantify impact in most recent role with metrics",
          impact: "+5 points",
          section: "experience",
        },
        {
          priority: "medium",
          action: "Add CI/CD pipeline contributions",
          impact: "+4 points",
          section: "experience",
        },
        {
          priority: "low",
          action: "Mention team leadership or mentoring",
          impact: "+3 points",
          section: "experience",
        },
      ],
    }

    setScanResult(mockResult)
    setScanState("complete")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent Match!"
    if (score >= 80) return "Great Match!"
    if (score >= 70) return "Good Match"
    if (score >= 60) return "Fair Match"
    return "Needs Improvement"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Scan className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resume Scanner</h1>
              <p className="text-sm text-muted-foreground">Get instant ATS compatibility score and recommendations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {scanState === "idle" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  Upload your resume and paste the job description to get instant ATS analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume (PDF, DOCX)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input id="resume" type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="resume" className="cursor-pointer">
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{resumeFile.name}</p>
                            <p className="text-sm text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">PDF or DOCX (Max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Include the full job description for best results</p>
                </div>

                <Button onClick={handleScan} disabled={!resumeFile || !jobDescription} className="w-full" size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Scan Resume
                </Button>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">ATS Keyword Match</h3>
                  <p className="text-sm text-muted-foreground">Analyzes keyword alignment with job requirements</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Semantic Analysis</h3>
                  <p className="text-sm text-muted-foreground">AI-powered understanding of context and relevance</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">Get detailed feedback in seconds</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="max-w-2xl mx-auto">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse" />
              <CardContent className="relative p-12">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Scan className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">Analyzing Your Resume...</h3>
                  <p className="text-muted-foreground mb-8">
                    {progress < 30 && "Extracting keywords and parsing structure..."}
                    {progress >= 30 && progress < 60 && "Running semantic analysis..."}
                    {progress >= 60 && progress < 90 && "Calculating match score..."}
                    {progress >= 90 && "Generating recommendations..."}
                  </p>

                  <Progress value={progress} className="h-2 mb-4" />
                  <p className="text-sm text-muted-foreground">{progress}% Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {scanState === "complete" && scanResult && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Score Reveal */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
              </div>
              <CardContent className="relative p-12 text-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="relative w-48 h-48 mx-auto mb-8"
                >
                  <CircularProgress value={scanResult.overallScore} size="lg" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className={`text-6xl font-bold ${getScoreColor(scanResult.overallScore)}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {scanResult.overallScore}
                    </motion.span>
                    <span className="text-sm text-muted-foreground">ATS Score</span>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <h2 className="text-3xl font-bold mb-2">{getScoreMessage(scanResult.overallScore)}</h2>
                  <p className="text-muted-foreground mb-6">
                    Your resume has a {scanResult.overallScore}% compatibility with this job description
                  </p>

                  <div className="flex gap-3 justify-center">
                    <Link href="/dashboard/rewrite">
                      <Button size="lg">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Improve Score
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" onClick={() => setScanState("idle")}>
                      Scan Another
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <ScoreCard title="ATS Keywords" score={scanResult.breakdown.atsScore} icon={<Target />} />
              <ScoreCard title="Semantic Match" score={scanResult.breakdown.semanticScore} icon={<Brain />} />
              <ScoreCard title="Format Quality" score={scanResult.breakdown.formatScore} icon={<FileText />} />
              <ScoreCard title="Experience" score={scanResult.breakdown.experienceMatch} icon={<TrendingUp />} />
              <ScoreCard title="Education" score={scanResult.breakdown.educationMatch} icon={<CheckCircle2 />} />
            </div>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="recommendations" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                <TabsTrigger value="keywords">Missing Keywords</TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Actionable Recommendations</CardTitle>
                    <CardDescription>Prioritized suggestions to improve your score</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scanResult.recommendations.map((rec, index) => (
                      <Alert
                        key={index}
                        className={
                          rec.priority === "high"
                            ? "border-red-500/50 bg-red-500/5"
                            : rec.priority === "medium"
                              ? "border-amber-500/50 bg-amber-500/5"
                              : "border-blue-500/50 bg-blue-500/5"
                        }
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <div>
                            <Badge
                              variant="outline"
                              className={
                                rec.priority === "high"
                                  ? "border-red-500 text-red-600 dark:text-red-400"
                                  : rec.priority === "medium"
                                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                                    : "border-blue-500 text-blue-600 dark:text-blue-400"
                              }
                            >
                              {rec.priority}
                            </Badge>
                            <p className="mt-2 font-medium">{rec.action}</p>
                            <p className="text-sm text-muted-foreground">Section: {rec.section}</p>
                          </div>
                          <Badge variant="secondary">{rec.impact}</Badge>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strengths">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Strengths</CardTitle>
                    <CardDescription>What's working well in your resume</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scanResult.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-sm">{strength}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weaknesses">
                <Card>
                  <CardHeader>
                    <CardTitle>Areas for Improvement</CardTitle>
                    <CardDescription>Opportunities to strengthen your resume</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scanResult.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm">{weakness}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords">
                <Card>
                  <CardHeader>
                    <CardTitle>Missing Keywords</CardTitle>
                    <CardDescription>
                      Important keywords from the job description not found in your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.missingKeywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-red-500/50 text-red-600 dark:text-red-400"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">{icon}</div>
        <div className={`text-2xl font-bold ${getColor(score)} mb-1`}>{score}</div>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  )
}
