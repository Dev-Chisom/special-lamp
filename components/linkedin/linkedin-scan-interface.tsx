"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Linkedin, ExternalLink, AlertCircle, CheckCircle2, TrendingUp, Users, Sparkles } from "lucide-react"
import { CircularProgress } from "@/components/ui/circular-progress"
import { linkedinService, type LinkedInProfileScan, type LinkedInJobScan } from "@/services/linkedin.service"
import { toast } from "sonner"
import type { ApiClientError } from "@/services/api-client"

export function LinkedInScanInterface() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [profileScanResult, setProfileScanResult] = useState<LinkedInProfileScan | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  
  // Job scan states
  const [isScanningJob, setIsScanningJob] = useState(false)
  const [jobScanComplete, setJobScanComplete] = useState(false)
  const [jobUrl, setJobUrl] = useState("")
  const [jobScanResult, setJobScanResult] = useState<LinkedInJobScan | null>(null)
  const [jobError, setJobError] = useState<string | null>(null)

  const validateLinkedInProfileUrl = (url: string): boolean => {
    const profilePattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[^/]+/
    return profilePattern.test(url)
  }

  const validateLinkedInJobUrl = (url: string): boolean => {
    const jobPattern = /^https:\/\/(www\.)?linkedin\.com\/jobs\/view\/\d+/
    return jobPattern.test(url)
  }

  const handleScan = async () => {
    if (!linkedinUrl.trim()) {
      setProfileError("Please enter a LinkedIn profile URL")
      return
    }

    if (!validateLinkedInProfileUrl(linkedinUrl.trim())) {
      setProfileError("Invalid LinkedIn profile URL. URL must start with 'https://www.linkedin.com/in/' or 'https://linkedin.com/in/'")
      return
    }

    setIsScanning(true)
    setProfileError(null)
    setScanComplete(false)
    setProfileScanResult(null)

    try {
      const result = await linkedinService.scanProfile(linkedinUrl.trim())
      setProfileScanResult(result)
      setScanComplete(true)
      toast.success("Profile scanned successfully!")
    } catch (error: any) {
      console.error("Profile scan error:", error)
      let errorMessage = "Failed to scan LinkedIn profile. Please try again."

      if (error instanceof Error && 'fieldErrors' in error) {
        const apiError = error as ApiClientError
        const fieldErrors = apiError.getAllFieldErrors()
        
        if (fieldErrors.linkedin_url) {
          errorMessage = fieldErrors.linkedin_url[0]
        } else {
          errorMessage = apiError.getGeneralError()
        }
      } else if (error?.message) {
        errorMessage = error.message
      }

      setProfileError(errorMessage)
      toast.error(errorMessage)
      setScanComplete(false)
    } finally {
      setIsScanning(false)
    }
  }

  const handleJobScan = async () => {
    if (!jobUrl.trim()) {
      setJobError("Please enter a LinkedIn job URL")
      return
    }

    if (!validateLinkedInJobUrl(jobUrl.trim())) {
      setJobError("Invalid LinkedIn job URL. URL must start with 'https://www.linkedin.com/jobs/view/'")
      return
    }

    setIsScanningJob(true)
    setJobError(null)
    setJobScanComplete(false)
    setJobScanResult(null)

    try {
      const result = await linkedinService.scanJob(jobUrl.trim())
      setJobScanResult(result)
      setJobScanComplete(true)
      toast.success("Job post analyzed successfully!")
    } catch (error: any) {
      console.error("Job scan error:", error)
      let errorMessage = "Failed to analyze LinkedIn job post. Please try again."

      if (error instanceof Error && 'fieldErrors' in error) {
        const apiError = error as ApiClientError
        const fieldErrors = apiError.getAllFieldErrors()
        
        if (fieldErrors.job_url) {
          errorMessage = fieldErrors.job_url[0]
        } else {
          errorMessage = apiError.getGeneralError()
        }
      } else if (error?.message) {
        errorMessage = error.message
      }

      setJobError(errorMessage)
      toast.error(errorMessage)
      setJobScanComplete(false)
    } finally {
      setIsScanningJob(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Linkedin className="h-10 w-10 text-[#0A66C2]" />
          LinkedIn Profile Scanner
        </h1>
        <p className="text-muted-foreground">
          Analyze LinkedIn profiles and job posts to optimize your resume and application strategy
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Analysis</TabsTrigger>
          <TabsTrigger value="job">Job Post Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan LinkedIn Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin-url"
                  placeholder="https://www.linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => {
                    setLinkedinUrl(e.target.value)
                    if (profileError) setProfileError(null)
                  }}
                  disabled={isScanning}
                />
              </div>

              <Button onClick={handleScan} disabled={isScanning || !linkedinUrl} className="w-full" size="lg">
                {isScanning ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Linkedin className="mr-2 h-4 w-4" />
                    Scan Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {scanComplete && profileScanResult && (
            <div className="space-y-6">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A66C2]/10 to-accent/10" />
                <CardContent className="relative p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <CircularProgress value={88} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-primary">88</span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                      <h3 className="font-semibold">Profile Strength</h3>
                      <p className="text-sm text-muted-foreground">Very Strong</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Headline Quality</span>
                          <span className="text-sm text-primary">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Summary Impact</span>
                          <span className="text-sm text-primary">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Experience Details</span>
                          <span className="text-sm text-primary">90%</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">500+ connections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Strong engagement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">12 skills endorsed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {profileScanResult.analysis && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {profileScanResult.analysis.recommendations && profileScanResult.analysis.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {profileScanResult.analysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {profileScanResult.profile_data.skills && profileScanResult.profile_data.skills.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Key Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {profileScanResult.profile_data.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {profileScanResult.analysis.key_skills && profileScanResult.analysis.key_skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Keyword Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {profileScanResult.analysis.key_skills.map((keyword, index) => (
                            <Badge key={index} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="job" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyze LinkedIn Job Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{jobError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="job-url">LinkedIn Job Post URL</Label>
                <Input
                  id="job-url"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => {
                    setJobUrl(e.target.value)
                    if (jobError) setJobError(null)
                  }}
                  disabled={isScanningJob}
                />
              </div>

              <Button
                onClick={handleJobScan}
                disabled={isScanningJob || !jobUrl}
                className="w-full"
                size="lg"
              >
                {isScanningJob ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Analyzing Job Post...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Analyze Job Post
                  </>
                )}
              </Button>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Paste a LinkedIn job URL to analyze the requirements, preferred skills, and company culture. Get
                  tailored recommendations for optimizing your application.
                </p>
              </div>
            </CardContent>
          </Card>

          {jobScanComplete && jobScanResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Job Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Job Basic Info */}
                  {jobScanResult.job_data && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{jobScanResult.job_data.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {jobScanResult.job_data.company && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {jobScanResult.job_data.company}
                            </span>
                          )}
                          {jobScanResult.job_data.location && (
                            <span>{jobScanResult.job_data.location}</span>
                          )}
                          {jobScanResult.job_data.job_type && (
                            <span>{jobScanResult.job_data.job_type}</span>
                          )}
                        </div>
                      </div>

                      {jobScanResult.job_data.description && (
                        <div>
                          <h4 className="font-medium mb-2">Job Description</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {jobScanResult.job_data.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Skills */}
                  {jobScanResult.analysis?.key_skills && jobScanResult.analysis.key_skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Key Skills Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {jobScanResult.analysis.key_skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Keywords */}
                  {jobScanResult.analysis?.top_keywords && jobScanResult.analysis.top_keywords.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Top Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {jobScanResult.analysis.top_keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Keywords */}
                  {jobScanResult.analysis?.recommended_keywords && jobScanResult.analysis.recommended_keywords.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recommended Keywords to Add</h4>
                      <div className="flex flex-wrap gap-2">
                        {jobScanResult.analysis.recommended_keywords.map((keyword, index) => (
                          <Badge key={index} variant="default">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements Summary */}
                  {jobScanResult.analysis?.requirements_summary && (
                    <div>
                      <h4 className="font-medium mb-2">Requirements Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {jobScanResult.analysis.requirements_summary}
                      </p>
                    </div>
                  )}

                  {/* Job Requirements */}
                  {jobScanResult.job_data?.requirements && jobScanResult.job_data.requirements.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Requirements</h4>
                      <ul className="space-y-2">
                        {jobScanResult.job_data.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
