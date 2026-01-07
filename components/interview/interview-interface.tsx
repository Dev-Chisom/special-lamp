"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Play, CheckCircle2, AlertCircle, TrendingUp, Clock, Target } from "lucide-react"
import { motion } from "framer-motion"
import { interviewService, type InterviewQuestion } from "@/services/interview.service"
import { toast } from "sonner"

type InterviewState = "setup" | "active" | "complete"

interface Question {
  id: number
  question: string
  type: string
  difficulty: string
}

interface InterviewResult {
  questions: Array<{
    question: string
    answer: string
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
  }>
  overallScore: number
  aggregateScores: {
    completeness: number
    depth: number
    clarity: number
    relevance: number
    communication: number
  }
  summary: {
    strengths: string[]
    improvements: string[]
    recommendations: string[]
  }
}

export function InterviewInterface() {
  const [interviewState, setInterviewState] = useState<InterviewState>("setup")
  const [role, setRole] = useState("software-engineer")
  const [seniority, setSeniority] = useState<"Junior" | "Mid" | "Senior" | "Lead" | "Principal">("Senior")
  const [stage, setStage] = useState<"phone_screen" | "technical" | "behavioral" | "final">("technical")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<InterviewResult | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionResults, setQuestionResults] = useState<Array<{
    question: string
    answer: string
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
  }>>([])

  const handleStartInterview = async () => {
    setIsStarting(true)
    try {
      const response = await interviewService.startInterview({
        role: role,
        seniority: seniority,
        stage: stage,
      })

      setSessionId(response.session_id)
      setQuestions(response.questions)
      setInterviewState("active")
      setCurrentQuestionIndex(0)
      setAnswers([])
      setAnswer("")
      setQuestionResults([])
      toast.success("Interview session started!")
    } catch (error: any) {
      console.error("Failed to start interview:", error)
      toast.error(error?.message || "Failed to start interview. Please try again.")
    } finally {
      setIsStarting(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer before submitting")
      return
    }

    if (!sessionId || questions.length === 0) {
      toast.error("Interview session not initialized")
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) {
      toast.error("Question not found")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await interviewService.submitAnswer(sessionId, {
        question: currentQuestion.question,
        answer: answer,
      })

      // Store result for this question
      const questionResult = {
        question: currentQuestion.question,
        answer: answer,
        score: response.score,
        feedback: response.feedback,
        strengths: response.strengths,
        improvements: response.improvements,
      }

      const updatedResults = [...questionResults, questionResult]
      setQuestionResults(updatedResults)
      const newAnswers = [...answers, answer]
      setAnswers(newAnswers)
      setAnswer("")

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        toast.success("Answer submitted! Moving to next question...")
      } else {
        // Complete interview - calculate overall scores using updated results
        completeInterview(updatedResults, newAnswers)
      }
    } catch (error: any) {
      console.error("Failed to submit answer:", error)
      toast.error(error?.message || "Failed to submit answer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const completeInterview = (allResults: typeof questionResults, finalAnswers: string[]) => {
    // Calculate overall score from all question results
    const totalScore = allResults.reduce((sum, r) => sum + r.score, 0)
    const overallScore = Math.round(totalScore / allResults.length)

    // Calculate aggregate scores (using average from individual scores)
    const allStrengths = allResults.flatMap(r => r.strengths)
    const allImprovements = allResults.flatMap(r => r.improvements)

    const result: InterviewResult = {
      questions: allResults.map((qr, idx) => ({
        question: qr.question,
        answer: finalAnswers[idx] || "",
        score: qr.score,
        feedback: qr.feedback,
        strengths: qr.strengths,
        improvements: qr.improvements,
      })),
      overallScore: overallScore,
      aggregateScores: {
        completeness: Math.round(overallScore * 0.9), // Approximate based on overall
        depth: Math.round(overallScore * 0.95),
        clarity: Math.round(overallScore * 0.9),
        relevance: Math.round(overallScore * 0.85),
        communication: Math.round(overallScore * 0.9),
      },
      summary: {
        strengths: Array.from(new Set(allStrengths)).slice(0, 5), // Unique strengths
        improvements: Array.from(new Set(allImprovements)).slice(0, 5), // Unique improvements
        recommendations: [
          "Review your answers to identify patterns in feedback",
          "Practice the STAR method for behavioral questions",
          "Prepare more examples with quantifiable metrics",
        ],
      },
    }

    setResult(result)
    setInterviewState("complete")
    toast.success("Interview completed! Review your results below.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Interview Preparation</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Practice with AI and get detailed feedback on your answers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {interviewState === "setup" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Setup Your Mock Interview</CardTitle>
                  <CardDescription>Choose the role and interview stage to practice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Target Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="software-engineer">Software Engineer</SelectItem>
                          <SelectItem value="product-manager">Product Manager</SelectItem>
                          <SelectItem value="data-scientist">Data Scientist</SelectItem>
                          <SelectItem value="designer">UX/UI Designer</SelectItem>
                          <SelectItem value="marketing">Marketing Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seniority">Seniority Level</Label>
                      <Select value={seniority} onValueChange={(value) => setSeniority(value as any)}>
                        <SelectTrigger id="seniority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior (0-2 years)</SelectItem>
                          <SelectItem value="Mid">Mid-Level (3-5 years)</SelectItem>
                          <SelectItem value="Senior">Senior (6-10 years)</SelectItem>
                          <SelectItem value="Lead">Lead (10+ years)</SelectItem>
                          <SelectItem value="Principal">Principal (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">Interview Stage</Label>
                    <Select value={stage} onValueChange={(value) => setStage(value as any)}>
                      <SelectTrigger id="stage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone_screen">Phone Screening</SelectItem>
                        <SelectItem value="technical">Technical Interview</SelectItem>
                        <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                        <SelectItem value="final">Final Round</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-sm">What to expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>3-5 questions tailored to your role and stage</li>
                      <li>Detailed AI feedback on each answer</li>
                      <li>Overall performance score and recommendations</li>
                      <li>Approximately 15-20 minutes</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleStartInterview} 
                    className="w-full" 
                    size="lg"
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <>Starting Interview...</>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start Mock Interview
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Interview Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Use the STAR Method</p>
                      <p className="text-sm text-muted-foreground">
                        Situation, Task, Action, Result for behavioral questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Be Concise</p>
                      <p className="text-sm text-muted-foreground">Aim for 2-3 minute answers for most questions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Show Impact</p>
                      <p className="text-sm text-muted-foreground">Always include measurable results and outcomes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {interviewState === "active" && questions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <Badge>{questions[currentQuestionIndex]?.type || "unknown"}</Badge>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 mb-4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <p className="text-lg font-medium leading-relaxed">{questions[currentQuestionIndex]?.question || ""}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Type your answer here... (Aim for 2-3 minutes worth of content)"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={isSubmitting}
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Tip: Use the STAR method for behavioral questions</p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={!answer.trim() || isSubmitting} 
                    className="flex-1" 
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>{currentQuestionIndex < questions.length - 1 ? "Submit & Next Question" : "Submit & Complete Interview"}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {interviewState === "complete" && result && (
            <>
              {/* Overall Score */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
                </div>
                <CardContent className="relative p-8 sm:p-12 text-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-5xl sm:text-6xl font-bold text-primary mb-2">{result.overallScore}</div>
                    <p className="text-base sm:text-lg font-medium mb-1">Overall Performance Score</p>
                    <p className="text-sm sm:text-base text-muted-foreground mb-8">
                      Great job! You're well-prepared for interviews
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
                    <ScoreMetric label="Completeness" score={result.aggregateScores.completeness} />
                    <ScoreMetric label="Depth" score={result.aggregateScores.depth} />
                    <ScoreMetric label="Clarity" score={result.aggregateScores.clarity} />
                    <ScoreMetric label="Relevance" score={result.aggregateScores.relevance} />
                    <ScoreMetric label="Communication" score={result.aggregateScores.communication} />
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Question-by-Question Feedback</CardTitle>
                  <CardDescription className="text-sm">Detailed analysis of each answer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.questions.map((q, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-4 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-3">
                            Question {idx + 1}
                          </Badge>
                          <p className="font-medium mb-2 text-sm sm:text-base">{q.question}</p>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-3xl font-bold text-primary">{q.score}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Your Answer:</p>
                        <p className="text-sm">{q.answer || "No answer provided"}</p>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium text-sm mb-2">Feedback</p>
                          <p className="text-sm">{q.feedback}</p>
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2 text-emerald-600 dark:text-emerald-400">Strengths</p>
                          <ul className="text-sm space-y-1">
                            {q.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">Improvements</p>
                          <ul className="text-sm space-y-1">
                            {q.improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                {imp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Strengths</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.summary.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-sm">{strength}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.summary.improvements.map((improvement, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-sm">{improvement}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Next steps to improve your interview performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.summary.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button onClick={() => setInterviewState("setup")} variant="outline" className="w-full" size="lg">
                Practice Another Interview
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreMetric({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center">
      <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{score}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
