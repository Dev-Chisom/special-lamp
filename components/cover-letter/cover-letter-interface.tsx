"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Copy, RefreshCw, Sparkles, Download } from "lucide-react"

type GenerateState = "idle" | "generating" | "complete"

interface CoverLetterResult {
  coverLetter: string
  tone: string
  wordCount: number
  keyPoints: string[]
}

export function CoverLetterInterface() {
  const [generateState, setGenerateState] = useState<GenerateState>("idle")
  const [jobDescription, setJobDescription] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [roleName, setRoleName] = useState("")
  const [tone, setTone] = useState("professional")
  const [result, setResult] = useState<CoverLetterResult | null>(null)

  const handleGenerate = async () => {
    if (!jobDescription || !companyName || !roleName) return

    setGenerateState("generating")

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Mock cover letter result
    const mockResult: CoverLetterResult = {
      coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the ${roleName} position at ${companyName}. With over five years of experience in software engineering and a proven track record of delivering scalable solutions, I am excited about the opportunity to contribute to your team's success.

In my current role at TechCorp, I have led the development of microservices architecture that improved system performance by 65% while reducing deployment time by half. This experience aligns closely with ${companyName}'s focus on building robust, scalable infrastructure. I am particularly drawn to your commitment to innovation and technical excellence, as demonstrated by your recent work in cloud-native technologies.

What sets me apart is my ability to bridge technical expertise with business outcomes. I have consistently delivered projects that not only meet technical requirements but also drive measurable business value. For example, I architected a real-time analytics platform that processed over 10 million events daily, enabling data-driven decision-making across the organization.

I am impressed by ${companyName}'s mission and would be thrilled to bring my expertise in distributed systems, cloud infrastructure, and team leadership to your organization. I look forward to discussing how my background and skills can contribute to your team's goals.

Thank you for considering my application. I am eager to explore this opportunity further.

Best regards,
[Your Name]`,
      tone: tone,
      wordCount: 245,
      keyPoints: [
        "Highlighted relevant experience with microservices",
        "Quantified achievements with specific metrics",
        "Connected skills to company's technology focus",
        "Demonstrated business impact awareness",
        "Expressed genuine interest in company mission",
      ],
    }

    setResult(mockResult)
    setGenerateState("complete")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Cover Letter Generator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Create personalized, compelling cover letters tailored to each job
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {generateState === "idle" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Generate Your Cover Letter</CardTitle>
                <CardDescription className="text-sm">
                  Provide job details to create a tailored cover letter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role Name</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Senior Software Engineer"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-desc">Job Description</Label>
                  <Textarea
                    id="job-desc"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={10}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!jobDescription || !companyName || !roleName}
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Cover Letter
                </Button>
              </CardContent>
            </Card>
          )}

          {generateState === "generating" && (
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 animate-pulse" />
              <CardContent className="relative p-12 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="h-10 w-10 text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Crafting Your Cover Letter...</h3>
                <p className="text-muted-foreground">Tailoring content to the job description and company</p>
              </CardContent>
            </Card>
          )}

          {generateState === "complete" && result && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Your Cover Letter</CardTitle>
                      <CardDescription className="text-sm">
                        {result.wordCount} words • {result.tone} tone
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">AI Generated</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 border border-border rounded-lg p-4 sm:p-8">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{result.coverLetter}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => copyToClipboard(result.coverLetter)} className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      Download as PDF
                    </Button>
                    <Button onClick={() => setGenerateState("idle")} variant="outline" className="sm:w-auto">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Points Highlighted</CardTitle>
                  <CardDescription>What makes this cover letter effective</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
