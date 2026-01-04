"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wand2, Copy, RefreshCw, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from "lucide-react"
import { rewriteService } from "@/services/rewrite.service"
import { toast } from "sonner"

type RewriteState = "idle" | "generating" | "complete"

interface RewriteResult {
  original: string
  rewritten: string
}

export function RewriteInterface() {
  const [rewriteState, setRewriteState] = useState<RewriteState>("idle")
  const [originalText, setOriginalText] = useState("")
  const [industry, setIndustry] = useState("Technology")
  const [result, setResult] = useState<RewriteResult | null>(null)

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      toast.error("Please enter some text to rewrite")
      return
    }

    setRewriteState("generating")
    setResult(null)

    try {
      // Determine if it's a single bullet point or a section
      // If it's a single line or short text, use bullet-point endpoint
      // Otherwise use section endpoint
      const isBulletPoint = originalText.split('\n').length === 1 && originalText.length < 500
      
      let rewritten: string
      if (isBulletPoint) {
        const response = await rewriteService.rewriteBulletPoint({
          original: originalText,
          context: `${industry} industry`,
          industry: industry,
        })
        rewritten = response.rewritten
      } else {
        const response = await rewriteService.rewriteSection({
          section_text: originalText,
          context: `${industry} industry`,
        })
        rewritten = response.rewritten
      }

      setResult({
        original: originalText,
        rewritten,
      })
      setRewriteState("complete")
      toast.success("Content rewritten successfully!")
    } catch (error: any) {
      console.error("Rewrite error:", error)
      toast.error(error?.getGeneralError?.() || error?.message || "Failed to rewrite content. Please try again.")
      setRewriteState("idle")
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">AI Resume Rewriter</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Transform your resume with AI-powered suggestions that highlight achievements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {rewriteState === "idle" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Optimize Your Resume Content</CardTitle>
                  <CardDescription className="text-sm">
                    Paste a bullet point or section from your resume to get AI-powered improvements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Context Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger id="industry">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seniority">Seniority Level</Label>
                      <Select value={seniority} onValueChange={setSeniority}>
                        <SelectTrigger id="seniority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                          <SelectItem value="executive">Executive (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Original Text */}
                  <div className="space-y-2">
                    <Label htmlFor="original">Original Resume Content</Label>
                    <Textarea
                      id="original"
                      placeholder="Example: Worked with team to build new features using React and Node.js"
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Paste a bullet point, paragraph, or full section from your resume
                    </p>
                  </div>

                  <Button onClick={handleRewrite} disabled={!originalText} className="w-full" size="lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Rewrite with AI
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Use Strong Action Verbs</p>
                      <p className="text-sm text-muted-foreground">
                        Start with impactful verbs like "Led," "Architected," "Spearheaded"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Quantify Your Impact</p>
                      <p className="text-sm text-muted-foreground">
                        Include numbers, percentages, and measurable results
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Show Business Impact</p>
                      <p className="text-sm text-muted-foreground">Connect your work to business outcomes and value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {rewriteState === "generating" && (
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-pulse" />
              <CardContent className="relative p-12 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="h-10 w-10 text-purple-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Rewriting with AI...</h3>
                <p className="text-muted-foreground">Enhancing your content with powerful language and metrics</p>
              </CardContent>
            </Card>
          )}

          {rewriteState === "complete" && result && (
            <>
              {/* Comparison View */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">AI-Enhanced Version</CardTitle>
                      <CardDescription className="text-sm">Compare original and improved versions</CardDescription>
                    </div>
                    <Badge variant="secondary" className="gap-2 w-fit">
                      <TrendingUp className="h-3 w-3" />
                      {result.confidence}% Confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Version Tabs */}
                  <Tabs defaultValue="improved" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="improved" className="text-xs sm:text-sm">
                        Improved Version
                      </TabsTrigger>
                      <TabsTrigger value="original" className="text-xs sm:text-sm">
                        Original
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="improved">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-6">
                            <p className="text-base leading-relaxed">{result.rewritten}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2 bg-transparent"
                            onClick={() => copyToClipboard(result.rewritten)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>

                        {/* Alternative Versions */}
                        {result.alternatives.length > 0 && (
                          <div className="space-y-3">
                            <Label>Alternative Versions</Label>
                            {result.alternatives.map((alt, idx) => (
                              <div key={idx} className="relative">
                                <div className="bg-muted/50 border border-border rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">{alt}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(alt)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="original">
                      <div className="bg-muted/50 border border-border rounded-lg p-6">
                        <p className="text-base leading-relaxed text-muted-foreground">{result.original}</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setRewriteState("idle")} variant="outline" className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rewrite Another
                    </Button>
                    <Button onClick={() => copyToClipboard(result.rewritten)} className="flex-1">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Improved Version
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">What Changed</CardTitle>
                    <CardDescription className="text-sm">Key improvements made to your content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.changes.map((change, idx) => (
                      <Alert key={idx}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{change}</AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Why It's Better</CardTitle>
                    <CardDescription className="text-sm">Impact of the improvements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.improvements.map((improvement, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-sm">{improvement}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
