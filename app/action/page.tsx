"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useStats } from "@/store/stats"
import { Navigation } from "@/components/Navigation"
import {
  Megaphone,
  FileText,
  Download,
  Share2,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  ExternalLink,
} from "lucide-react"
import { SB10LetterTemplate } from "./letter-templates/sb10-ten-commandments"
import { SB2LetterTemplate } from "./letter-templates/sb2-education-savings"
import { HB229LetterTemplate } from "./letter-templates/hb229-sex-definition"
import { HB1481LetterTemplate } from "./letter-templates/hb1481-device-restrictions"
import { HB4LetterTemplate } from "./letter-templates/hb4-redistricting"
import { ComprehensiveOppositionTemplate } from "./letter-templates/comprehensive-opposition"

export default function ActionPage() {
  const [petitionForm, setPetitionForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    zipCode: "",
    comment: "",
    updates: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [petitionStats, setPetitionStats] = useState({
    signatureCount: 0,
    goalCount: 10000,
    progress: 0,
  })
  const [recentSignatures, setRecentSignatures] = useState<any[]>([])
  const { stats, fetchStats, optimisticIncrement, rollbackOptimistic } = useStats()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Fetch petition stats on component mount
  useEffect(() => {
    // Clear any old localStorage data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rise-for-texas-social-shares')
    }
    
    // Load data with simple fallback
    const loadData = async () => {
      try {
        await fetchPetitionStats()
        await fetchRecentSignatures()
        await fetchStats() // Use global store instead of individual fetches
      } catch (error) {
        console.error('Error loading data:', error)
        // Global store will handle fallbacks
      }
    }
    
    loadData()
  }, [])

  const fetchPetitionStats = async () => {
    try {
      // Get stats for the HB 1481 petition
      const response = await fetch('/api/v1/signatures/petition/hb1481-device-restrictions/stats')
      if (response.ok) {
        const stats = await response.json()
        setPetitionStats({
          signatureCount: stats.signatureCount,
          goalCount: stats.goalCount,
          progress: stats.progress,
        })
      }
    } catch (error) {
      console.error('Error fetching petition stats:', error)
    }
  }

  const fetchRecentSignatures = async () => {
    try {
      // Get recent signatures for the HB 1481 petition
      const response = await fetch('/api/v1/signatures/petition/hb1481-device-restrictions?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentSignatures(data.signatures || [])
      }
    } catch (error) {
        console.error('Error fetching recent signatures:', error)
    }
  }

  const handlePetitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Use the correct petition ID from the database
      const response = await fetch('/api/petitions/hb1481-device-restrictions/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${petitionForm.firstName} ${petitionForm.lastName}`,
          email: petitionForm.email,
          zipCode: petitionForm.zipCode,
          displayPublic: petitionForm.updates,
        }),
      })

      if (response.ok) {
        try {
          const signatureData = await response.json()
          console.log('✅ Petition signed successfully:', signatureData)
          
          // Reset form
          setPetitionForm({
            firstName: "",
            lastName: "",
            email: "",
            zipCode: "",
            comment: "",
            updates: false,
          })
          
          // IMMEDIATELY update the UI optimistically
          setPetitionStats(prev => ({
            ...prev,
            signatureCount: prev.signatureCount + 1,
            progress: Math.min(100, ((prev.signatureCount + 1) / prev.goalCount) * 100)
          }))
          
          // Add the new signature to the recent signatures list
          setRecentSignatures(prev => [{
            id: signatureData.id,
            name: signatureData.name,
            zipCode: signatureData.zip_code,
            createdAt: signatureData.created_at,
            displayPublic: signatureData.display_public
          }, ...prev.slice(0, 4)]) // Keep only 5 most recent
          
          // Refresh all data from the database
          await Promise.all([
            fetchPetitionStats(),
            fetchRecentSignatures(),
            fetchStats()
          ])
          
          alert('Thank you for signing the petition! Your voice matters.')
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
          // Even if parsing fails, the signature was successful
          alert('Thank you for signing the petition! Your voice matters.')
        }
      } else {
        let errorMessage = 'Unknown error occurred'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          console.error('Petition submission error:', errorData)
        } catch (parseError) {
          console.error('Petition submission failed with status:', response.status)
        }
        alert(`There was an error submitting your signature: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error submitting petition:', error)
      alert('There was an error submitting your signature. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = async (platform: string, text: string) => {
    try {
      // Save to backend first
      const response = await fetch('/api/v1/social-shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: platform,
          entityType: 'general',
          entityId: null,
        }),
      });

      if (response.ok) {

        optimisticIncrement('socialShares');
        await fetchStats(); // Refresh stats from database
      } else {
        console.warn('Failed to save social share to backend');
      }
    } catch (error) {
      console.warn('Backend not available:', error);
    }

    // Try to use native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rise for Texas',
          text: text,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or share failed, fall back to copying
        try {
          await navigator.clipboard.writeText(text)
          alert('Content copied to clipboard!')
        } catch (clipboardError) {
          console.warn('Clipboard access failed:', clipboardError)
          // Fallback: try to copy using a different method
          try {
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            alert('Content copied to clipboard!')
          } catch (fallbackError) {
            console.error('All clipboard methods failed:', fallbackError)
            alert('Could not copy to clipboard. Please copy manually: ' + text)
          }
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text)
        alert('Content copied to clipboard!')
      } catch (clipboardError) {
        console.warn('Clipboard access failed:', clipboardError)
        // Fallback: try to copy using a different method
        try {
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert('Content copied to clipboard!')
        } catch (fallbackError) {
          console.error('All clipboard methods failed:', fallbackError)
          alert('Could not copy to clipboard. Please copy manually: ' + text)
        }
      }
    }
  }

  const handleCopy = async (text: string) => {
    try {
      // Save to backend first
      const response = await fetch('/api/v1/social-shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'clipboard',
          entityType: 'general',
          entityId: null,
        }),
      });

      if (response.ok) {

        optimisticIncrement('socialShares');
        await fetchStats(); // Refresh stats from database
      } else {
        console.warn('Failed to save copy action to backend');
      }
    } catch (error) {
      console.warn('Backend not available:', error);
    }

    // Copy to clipboard with proper error handling
    try {
      await navigator.clipboard.writeText(text)
      alert('Content copied to clipboard!')
    } catch (clipboardError) {
      console.warn('Clipboard access failed:', clipboardError)
      // Fallback: try to copy using a different method
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Content copied to clipboard!')
      } catch (fallbackError) {
        console.error('All clipboard methods failed:', fallbackError)
        alert('Could not copy to clipboard. Please copy manually: ' + text)
      }
    }
  }

  const handlePDFDownload = (templateName: string) => {
    const pdfMap: { [key: string]: string } = {
      'sb10-ten-commandments': 'SB 10 Opposition Letter.pdf',
      'sb2-education-savings': 'SB 2 Opposition Letter.pdf', 
      'hb229-sex-definition': 'HB 229 Opposition Letter.pdf',
      'hb1481-device-restrictions': 'HB 1481 Opposition Letter.pdf',
      'hb4-redistricting': 'HB 4 Opposition Letter.pdf',
      'comprehensive-opposition': 'Comprehensive Opposition Letter.pdf'
    };

    const pdfFile = pdfMap[templateName];
    if (pdfFile) {
      const link = document.createElement('a');
      link.href = `/${pdfFile}`;
      link.download = pdfFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const handleTemplatePreview = (templateName: string) => {
    setSelectedTemplate(templateName)
  }

  const handleTemplateDownload = (templateName: string) => {
    let content = ''
    let filename = ''

    switch (templateName) {
      case 'sb10-ten-commandments':
        content = SB10LetterTemplate.content
        filename = 'SB10_Opposition_Letter.txt'
        break
      case 'sb2-education-savings':
        content = SB2LetterTemplate.content
        filename = 'SB2_Opposition_Letter.txt'
        break
      case 'hb229-sex-definition':
        content = HB229LetterTemplate.content
        filename = 'HB229_Opposition_Letter.txt'
        break
      case 'hb1481-device-restrictions':
        content = HB1481LetterTemplate.content
        filename = 'HB1481_Opposition_Letter.txt'
        break
      case 'hb4-redistricting':
        content = HB4LetterTemplate.content
        filename = 'HB4_Opposition_Letter.txt'
        break
      case 'comprehensive-opposition':
        content = ComprehensiveOppositionTemplate.content
        filename = 'Comprehensive_Opposition_Letter.txt'
        break
      default:
        content = `Letter Template: ${templateName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\n[Your Name]\n[Your Address]\n[City, TX ZIP]\n[Email]\n[Phone]\n\n[Date]\n\n[Representative/Senator Name]\n[Office Address]\n\nSubject: Opposition to [Bill Number]\n\nDear [Representative/Senator Last Name],\n\nAs your constituent, I'm writing to express my opposition to [Bill Number] and urge you to vote against it.\n\n[Add your personal story and concerns here]\n\n[Add specific details about how this bill affects you, your family, or your community]\n\nKey Concerns:\n• [List your main concerns]\n\nWhat I'm Asking:\n• [List your specific requests]\n\nThank you for your time and consideration.\n\nRespectfully,\n\n[Your Name]`
        filename = `${templateName.replace(/-/g, '_')}_Letter.txt`
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const closeTemplatePreview = () => {
    setSelectedTemplate(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">Action Center</Badge>
            <h1 className="font-serif font-bold text-4xl lg:text-5xl text-foreground mb-6">Take Action for Texas</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your voice has power. Use these tools to contact representatives, sign petitions, and make a real
              difference in the fight against harmful bills like HB 1481, SB 2, SB 10, and others. Download professional PDF letter templates.
            </p>
          </div>
        </div>
      </section>

      {/* Action Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {petitionStats.signatureCount}
                </div>
                <div className="text-sm text-muted-foreground">Petition Signatures</div>
                <div className="text-xs text-muted-foreground mt-1">Be the first to sign!</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">{stats.socialShares || 0}</div>
                <div className="text-sm text-muted-foreground">Social Shares</div>
                <div className="text-xs text-muted-foreground mt-1">Spread the word!</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="petition" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="petition">Petition</TabsTrigger>
                <TabsTrigger value="contact">Contact Reps</TabsTrigger>
                <TabsTrigger value="letters">Letter Templates</TabsTrigger>
                <TabsTrigger value="share">Share & Spread</TabsTrigger>
              </TabsList>

              <TabsContent value="petition" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Petition */}
                  <div className="lg:col-span-2">
                    <Card className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-primary/10 text-primary border-primary/20">Main Petition</Badge>
                          <Badge variant="outline">{petitionStats.signatureCount} signatures</Badge>
                        </div>
                        <CardTitle className="font-serif text-2xl">
                          Stop HB 1481: Personal Device Restrictions in Schools
                        </CardTitle>
                        <CardDescription className="text-base">
                          Join Texans demanding our legislators vote NO on HB 1481, which will prohibit students from possessing 
                          or using personal communication devices during the school day, effective September 1, 2025.
                        </CardDescription>
                        
                        {/* HB 1481 Specific Information */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-amber-600 text-lg">⚠️</div>
                            <div>
                              <h5 className="font-semibold text-amber-900 mb-2">HB 1481 - Personal Device Restrictions</h5>
                              <ul className="text-sm text-amber-800 space-y-1">
                                <li>• Prohibits students from possessing personal communication devices during school hours</li>
                                <li>• Requires secure storage of devices during the school day</li>
                                <li>• Limited exceptions for IEP, medical, and safety needs</li>
                                <li>• Takes effect September 1, 2025</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Progress to Goal */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress to {petitionStats.goalCount} signatures</span>
                            <span className="text-sm text-muted-foreground">{petitionStats.progress}%</span>
                          </div>
                          <Progress value={petitionStats.progress} className="h-3" />
                          <p className="text-xs text-muted-foreground mt-2">
                            Be the first to sign and start the movement!
                          </p>
                        </div>

                        {/* Petition Form */}
                        <div className="bg-muted/30 p-6 rounded-lg" id="petition-form">
                          <h4 className="font-semibold mb-4">Sign Petition Against HB 1481</h4>
                          <form onSubmit={handlePetitionSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                  id="firstName"
                                  placeholder="Enter your first name"
                                  value={petitionForm.firstName}
                                  onChange={(e) => setPetitionForm({ ...petitionForm, firstName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                  id="lastName"
                                  placeholder="Enter your last name"
                                  value={petitionForm.lastName}
                                  onChange={(e) => setPetitionForm({ ...petitionForm, lastName: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="your.email@example.com"
                                  value={petitionForm.email}
                                  onChange={(e) => setPetitionForm({ ...petitionForm, email: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="zipCode">ZIP Code *</Label>
                                <Input
                                  id="zipCode"
                                  placeholder="12345"
                                  value={petitionForm.zipCode}
                                  onChange={(e) => setPetitionForm({ ...petitionForm, zipCode: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="comment">Personal Comment (Optional)</Label>
                              <Textarea
                                id="comment"
                                placeholder="Share why this issue matters to you..."
                                className="min-h-20"
                                value={petitionForm.comment}
                                onChange={(e) => setPetitionForm({ ...petitionForm, comment: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="updates"
                                className="rounded"
                                checked={petitionForm.updates}
                                onChange={(e) => setPetitionForm({ ...petitionForm, updates: e.target.checked })}
                              />
                              <Label htmlFor="updates" className="text-sm">
                                Send me updates about this campaign and other important issues
                              </Label>
                            </div>
                            <Button
                              type="submit"
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Signing..." : "Sign Petition Against HB 1481"}
                            </Button>
                          </form>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">Recent HB 1481 Petition Signatures</h4>
                          {recentSignatures.length > 0 ? (
                            <div className="space-y-3">
                              {recentSignatures.map((signature, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {signature.displayPublic ? signature.name : `${signature.name.charAt(0)}***`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {signature.zipCode} • {new Date(signature.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No signatures yet. Be the first to sign the HB 1481 petition and start the movement!</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg">Other Bill Petitions</CardTitle>
                        <CardDescription>Sign petitions for other harmful bills</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          View and sign petitions for other bills that threaten Texas education, voting rights, and healthcare.
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => window.location.href = '/bills'}
                        >
                          View All Bills
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg">Petition Progress</CardTitle>
                        <CardDescription>Track our collective impact</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-6">
                          <div className="text-3xl font-bold text-primary mb-2">{petitionStats.signatureCount}</div>
                          <p className="text-sm text-muted-foreground">Total signatures collected</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Goal: {petitionStats.goalCount.toLocaleString()}</span>
                              <span>{petitionStats.progress}%</span>
                            </div>
                            <Progress value={petitionStats.progress} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif font-bold text-2xl text-foreground mb-4">Contact Your Representatives</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                    Find your elected officials and let them know where you stand on critical bills like HB 1481, SB 2, SB 10, and others.
                  </p>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8"
                    onClick={() => window.open('https://wrm.capitol.texas.gov/home', '_blank')}
                  >
                    Get Your Representative
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="letters" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif font-bold text-2xl text-foreground mb-4">Letter Templates</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Download professional PDF letter templates to send to your representatives about specific bills like HB 1481, SB 2, SB 10, and others. These are ready-to-use, professionally formatted templates.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "HB 1481 Opposition Letter",
                      description: "Template opposing personal device restrictions in schools",
                      issue: "Education",
                      pages: 2,
                      billNumber: "HB 1481",
                      template: "hb1481-device-restrictions",
                    },
                    {
                      title: "SB 2 Opposition Letter",
                      description: "Template opposing education savings accounts (ESAs)",
                      issue: "Education",
                      pages: 2,
                      billNumber: "SB 2",
                      template: "sb2-education-savings",
                    },
                    {
                      title: "SB 10 Opposition Letter",
                      description: "Professional template opposing Ten Commandments display in classrooms",
                      issue: "Education",
                      pages: 1,
                      billNumber: "SB 10",
                      template: "sb10-ten-commandments",
                    },
                    {
                      title: "HB 4 Opposition Letter",
                      description: "Template opposing congressional redistricting plan",
                      issue: "Voting Rights",
                      pages: 2,
                      billNumber: "HB 4",
                      template: "hb4-redistricting",
                    },
                    {
                      title: "HB 229 Opposition Letter",
                      description: "Template opposing binary sex definition bill",
                      issue: "Civil Rights",
                      pages: 2,
                      billNumber: "HB 229",
                      template: "hb229-sex-definition",
                    },
                    {
                      title: "Comprehensive Opposition Letter",
                      description: "Template addressing all major bills and issues",
                      issue: "All Issues",
                      pages: 3,
                      billNumber: "Multiple",
                      template: "comprehensive-opposition",
                    },
                  ].map((template, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <CardTitle className="font-serif text-lg">{template.title}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                            {template.billNumber && template.billNumber !== "Multiple" && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  {template.billNumber}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.issue}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Professional template</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {template.pages} page{template.pages > 1 ? "s" : ""}
                            </span>
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                              Professional PDF
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => handlePDFDownload(template.template || '')}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download PDF
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 bg-transparent"
                            onClick={() => handleTemplatePreview(template.template || '')}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Template Preview Modal */}
                {selectedTemplate && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                      <div className="flex items-center justify-between p-6 border-b">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {selectedTemplate === "sb10-ten-commandments" 
                              ? SB10LetterTemplate.title 
                              : selectedTemplate === "sb2-education-savings"
                              ? SB2LetterTemplate.title
                              : selectedTemplate === "hb229-sex-definition"
                              ? HB229LetterTemplate.title
                              : selectedTemplate === "hb1481-device-restrictions"
                              ? HB1481LetterTemplate.title
                              : selectedTemplate === "hb4-redistricting"
                              ? HB4LetterTemplate.title
                              : selectedTemplate === "comprehensive-opposition"
                              ? ComprehensiveOppositionTemplate.title
                              : `Letter Template: ${selectedTemplate.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                            }
                          </h3>
                          <p className="text-muted-foreground mt-1">
                            Preview this professional template and download the PDF for your representative
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={closeTemplatePreview}>
                          ✕
                        </Button>
                      </div>
                      
                      <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {selectedTemplate === "sb10-ten-commandments" ? (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Instructions:</h4>
                              <p className="text-sm text-muted-foreground">{SB10LetterTemplate.instructions}</p>
                            </div>
                            
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Tips:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {SB10LetterTemplate.tips.map((tip, index) => (
                                  <li key={index}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-white">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {SB10LetterTemplate.content}
                              </pre>
                            </div>
                          </div>
                        ) : selectedTemplate === "sb2-education-savings" ? (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Instructions:</h4>
                              <p className="text-sm text-muted-foreground">{SB2LetterTemplate.instructions}</p>
                            </div>
                            
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Tips:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {SB2LetterTemplate.tips.map((tip, index) => (
                                  <li key={index}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-white">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {SB2LetterTemplate.content}
                              </pre>
                            </div>
                          </div>
                        ) : selectedTemplate === "hb229-sex-definition" ? (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Instructions:</h4>
                              <p className="text-sm text-muted-foreground">{HB229LetterTemplate.instructions}</p>
                            </div>
                            
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Tips:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {HB229LetterTemplate.tips.map((tip, index) => (
                                  <li key={index}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-white">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {HB229LetterTemplate.content}
                              </pre>
                            </div>
                          </div>
                        ) : selectedTemplate === "hb1481-device-restrictions" ? (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Instructions:</h4>
                              <p className="text-sm text-muted-foreground">{HB1481LetterTemplate.instructions}</p>
                            </div>
                            
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Tips:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {HB1481LetterTemplate.tips.map((tip, index) => (
                                  <li key={index}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-white">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {HB1481LetterTemplate.content}
                              </pre>
                            </div>
                          </div>
                        ) : selectedTemplate === "hb4-redistricting" ? (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Instructions:</h4>
                              <p className="text-sm text-muted-foreground">{HB4LetterTemplate.instructions}</p>
                            </div>
                            
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Tips:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {HB4LetterTemplate.tips.map((tip, index) => (
                                  <li key={index}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-white">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {HB4LetterTemplate.content}
                              </pre>
                            </div>
                          </div>
                        ) : selectedTemplate === "comprehensive-opposition" ? (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Instructions:</h4>
                              <p className="text-sm text-muted-foreground">{ComprehensiveOppositionTemplate.instructions}</p>
                            </div>
                            
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Tips:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {ComprehensiveOppositionTemplate.tips.map((tip, index) => (
                                  <li key={index}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-white">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {ComprehensiveOppositionTemplate.content}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Template Preview:</h4>
                              <p className="text-sm text-muted-foreground">
                                This is a basic letter template structure. Customize it with your personal information, 
                                specific concerns about the bill, and how it affects you or your community.
                              </p>
                            </div>
                            
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">General Tips:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Include your full name and address to verify you're a constituent</li>
                                <li>• Be specific about which bills you're addressing</li>
                                <li>• Mention how these bills will directly impact you, your family, or your community</li>
                                <li>• Keep it concise - one to two pages maximum</li>
                                <li>• Send via email and postal mail for maximum impact</li>
                              </ul>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-white">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {`Letter Template: ${selectedTemplate.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

[Your Name]
[Your Address]
[City, TX ZIP]
[Email]
[Phone]

[Date]

[Representative/Senator Name]
[Office Address]

Subject: Opposition to [Bill Number]

Dear [Representative/Senator Last Name],

As your constituent, I'm writing to express my opposition to [Bill Number] and urge you to vote against it.

[Add your personal story and concerns here]

[Add specific details about how this bill affects you, your family, or your community]

Key Concerns:
• [List your main concerns]

What I'm Asking:
• [List your specific requests]

Thank you for your time and consideration.

Respectfully,

[Your Name]`}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-6 border-t bg-muted/30">
                        <div className="text-sm text-muted-foreground">
                          Download the professional PDF template and customize with your personal information
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handlePDFDownload(selectedTemplate)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Professional PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleTemplateDownload(selectedTemplate)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Download Text
                          </Button>
                          <Button onClick={closeTemplatePreview}>
                            Close Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Letter Writing Tips */}
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="font-serif">Letter Writing Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Personalize the template with your own story and details</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Include your full name and address to verify you're a constituent</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Be specific about which bills you're addressing (HB 1481, SB 2, SB 10, etc.)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Mention how these bills will directly impact you, your family, or your community</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Keep it concise - one to two pages maximum</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Send via email and postal mail for maximum impact</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="share" className="space-y-6 md:space-y-8">
                <div className="text-center mb-6 md:mb-8 px-4">
                  <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-3 md:mb-4">Share & Spread the Word</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                    Help us reach more Texans by sharing our message on social media and with your networks.
                  </p>
                </div>

                {/* Social Media Sharing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Share on Social Media</CardTitle>
                      <CardDescription>Pre-written posts ready to share on your social platforms</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          platform: "Twitter",
                          icon: Twitter,
                          text: "Texas legislators are pushing harmful bills: HB 1481 (device restrictions), SB 2 (ESAs), SB 10 (Ten Commandments). We can't let this happen. Join the fight at RiseForTexas.org #RiseForTexas #StopTheBills",
                          color: "text-blue-500",
                        },
                        {
                          platform: "Facebook",
                          icon: Facebook,
                          text: "Our children's education is under attack in Texas with bills like HB 1481, SB 2, and SB 10. But together, we can fight back. Sign the petition and make your voice heard.",
                          color: "text-blue-600",
                        },
                        {
                          platform: "Instagram",
                          icon: Instagram,
                          text: "Texas families deserve better than harmful legislation like HB 1481, SB 2, and SB 10. Join the movement fighting for our children's future. #RiseForTexas",
                          color: "text-pink-500",
                        },
                      ].map((post, index) => (
                        <div key={index} className="border rounded-lg p-3 md:p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <post.icon className={`w-5 h-5 ${post.color}`} />
                            <span className="font-semibold">{post.platform}</span>
                          </div>
                          <p className="text-sm mb-3 bg-muted/30 p-3 rounded">{post.text}</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                              onClick={() => handleShare(post.platform, post.text)}
                            >
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent w-full sm:w-auto"
                              onClick={() => handleCopy(post.text)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Share Resources</CardTitle>
                      <CardDescription>Direct links to share specific content with your network</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          title: "HB 1481 Petition",
                          description: "Direct link to sign the HB 1481 petition",
                          url: "risefortexas.org/action",
                        },
                        {
                          title: "Bill Information",
                          description: "Educational content about the harmful bills",
                          url: "risefortexas.org/bills",
                        },
                        {
                          title: "Personal Stories",
                          description: "Real stories from affected Texans",
                          url: "risefortexas.org/stories",
                        },
                        {
                          title: "Action Center",
                          description: "Tools to contact representatives",
                          url: "risefortexas.org/action",
                        },
                      ].map((resource, index) => (
                        <div key={index} className="border rounded-lg p-3 md:p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{resource.title}</h4>
                              <p className="text-xs text-muted-foreground">{resource.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Ready to share
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1">{resource.url}</code>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                              onClick={() => handleShare("general", `Check out ${resource.title}: ${resource.url}`)}
                            >
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent w-full sm:w-auto"
                              onClick={() => handleCopy(resource.url)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Social Media Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Follow Us on Social Media</CardTitle>
                      <CardDescription>Stay connected and help spread our message across platforms</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          platform: "TikTok",
                          icon: "🎵",
                          handle: "@risefortexas",
                          description: "Follow us for short-form videos about Texas legislation and activism",
                          url: "https://www.tiktok.com/@risefortexas?_t=ZT-8z7z7qJrRhP&_r=1",
                          color: "text-black",
                        },
                        {
                          platform: "Instagram",
                          icon: "📷",
                          handle: "@risefortexas",
                          description: "Follow us for visual content and updates about our movement",
                          url: "https://www.instagram.com/risefortexas",
                          color: "text-pink-500",
                        },
                      ].map((social, index) => (
                        <div key={index} className="border rounded-lg p-3 md:p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{social.icon}</span>
                            <div>
                              <span className="font-semibold">{social.platform}</span>
                              <span className="text-sm text-muted-foreground ml-2">{social.handle}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{social.description}</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                              onClick={async () => {
                                // Increment social shares when someone follows
                                try {
                                  const response = await fetch('/api/v1/social-shares', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      platform: social.platform.toLowerCase(),
                                      entityType: 'social-follow',
                                      entityId: null,
                                    }),
                                  });
                                  if (response.ok) {
                                    await fetchStats();
                                  }
                                } catch (error) {
                                  console.error('Error recording social follow:', error);
                                }
                                // Open the social media link
                                window.open(social.url, '_blank');
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Follow Us
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent w-full sm:w-auto"
                              onClick={() => handleCopy(social.url)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Hashtag Campaign */}
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="font-serif text-lg md:text-xl">Join Our Hashtag Campaign</CardTitle>
                    <CardDescription className="text-sm">
                      Use these hashtags to connect with the movement and amplify our message
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
                      {["#RiseForTexas", "#StopTheBills", "#TexasEducation", "#VotingRights", "#HealthcareAccess"].map(
                        (hashtag, index) => (
                          <Badge key={index} className="bg-primary/10 text-primary border-primary/20 px-2 md:px-3 py-1 text-xs md:text-sm">
                            {hashtag}
                          </Badge>
                        ),
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Include these hashtags in your posts to join the conversation and help others find our movement.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-2xl md:text-3xl mb-3 md:mb-4 px-4">Every Action Counts</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90 px-4">
              Whether you sign a petition, call your representative, or share our message - your participation makes a
              difference in the fight for Texas.
            </p>
            <div className="flex justify-center px-4">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold text-base md:text-lg px-6 md:px-8 w-full sm:w-auto"
                onClick={() => document.getElementById("petition-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Sign HB 1481 Petition
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}