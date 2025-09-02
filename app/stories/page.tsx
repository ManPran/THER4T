"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Users, MessageSquare, FileText, Calendar, MapPin, User } from "lucide-react"
import { useStories } from "@/store/stories"
import { Story } from "@/store/stories"
import { useStatsStore } from "@/store/stats"
import { StoryCard } from "@/components/StoryCard"
import { Navigation } from "@/components/Navigation"

export default function StoriesPage() {
  const { 
    stories, 
    totalCount, 
    roleCounts, 
    isLoading, 
    error, 
    fetchStories, 
    createStory,
    clearError 
  } = useStories();
  
  const { setStats } = useStatsStore();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    role: "",
    issue: "",
    title: "",
    story: "",
    consent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("stories")

  // Fetch stories on component mount and sync with stats
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);
  
  // Sync stories data with stats store only when stories are fetched
  useEffect(() => {
    if (totalCount > 0) {
      setStats(prevStats => ({
        ...prevStats,
        storiesShared: totalCount,
        totalEngagement: prevStats.petitionSignatures + totalCount + prevStats.socialShares,
      }));
    }
  }, [totalCount, setStats]);
  
  // Sync stats store immediately after story creation
  useEffect(() => {
    if (submitSuccess && totalCount > 0) {
      setStats(prevStats => ({
        ...prevStats,
        storiesShared: totalCount,
        totalEngagement: prevStats.petitionSignatures + totalCount + prevStats.socialShares,
      }));
    }
  }, [submitSuccess, totalCount, setStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitSuccess(false)
    clearError()

    try {
      const success = await createStory(formData)
      if (success) {
        setSubmitSuccess(true)
        
        // Immediately sync with stats store
        setStats(prevStats => ({
          ...prevStats,
          storiesShared: prevStats.storiesShared + 1,
          totalEngagement: prevStats.petitionSignatures + (prevStats.storiesShared + 1) + prevStats.socialShares,
        }));
        
        // Reset form
        setFormData({
          name: "",
          location: "",
          role: "",
          issue: "",
          title: "",
          story: "",
          consent: false,
        })
        // Hide success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error submitting story:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-secondary/10 text-secondary border-secondary/20">Community Voices</Badge>
            <h1 className="font-serif font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Your Stories, Our Strength
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Real stories from real Texans about how harmful legislation affects our families, schools, and
              communities. Every voice matters in our fight for justice.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8"
              onClick={() => setActiveTab("share")}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Share Your Story
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await fetchStories();
                } catch (error) {
                  console.error('Error refreshing stories:', error);
                }
              }}
              className="text-xs"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Stories Count'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">{totalCount}</div>
                <div className="text-sm text-muted-foreground">Stories Shared</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalCount === 0 ? 'Be the first!' : `${totalCount} voice${totalCount === 1 ? '' : 's'} heard`}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-secondary mb-2">{roleCounts.teachers}</div>
                <div className="text-sm text-muted-foreground">Teachers</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roleCounts.teachers === 0 ? 'Share your experience' : 'Educator stories'}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-accent mb-2">{roleCounts.parents}</div>
                <div className="text-sm text-muted-foreground">Parents</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roleCounts.parents === 0 ? 'Tell your story' : 'Parent perspectives'}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">{roleCounts.students}</div>
                <div className="text-sm text-muted-foreground">Students</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roleCounts.students === 0 ? 'Your voice matters' : 'Student voices'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="stories">Community Stories</TabsTrigger>
                <TabsTrigger value="share" id="share-tab">
                  Share Your Story
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stories" className="space-y-8">
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading stories...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-foreground mb-4">Error Loading Stories</h3>
                    <p className="text-muted-foreground mb-8">{error}</p>
                    <Button onClick={fetchStories} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : stories.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="font-serif font-bold text-2xl text-foreground mb-4">No Stories Yet</h3>
                      <p className="text-muted-foreground mb-8">
                        Be the first to share your story and help build our community of voices fighting for Texas.
                      </p>
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        onClick={() => setActiveTab("share")}
                      >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Share the First Story
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {stories.map((story) => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="share" className="space-y-8">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="font-serif font-bold text-2xl text-foreground mb-4">Share Your Story</h2>
                    <p className="text-muted-foreground">
                      Your experience matters. Help others understand how these bills affect real Texans.
                    </p>
                  </div>

                  {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✅ Story submitted successfully! Thank you for sharing your voice.</p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">❌ {error}</p>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Tell Us Your Story</CardTitle>
                      <CardDescription>
                        Share how the proposed legislation would impact you, your family, or your community.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Your Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => handleInputChange("location", e.target.value)}
                              placeholder="City, County, or Region"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="role">Your Role *</Label>
                            <Select
                              value={formData.role}
                              onValueChange={(value) => handleInputChange("role", value)}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="teacher">Teacher/Educator</SelectItem>
                                <SelectItem value="parent">Parent/Guardian</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="healthcare">Healthcare Worker</SelectItem>
                                <SelectItem value="community">Community Member</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="issue">Main Issue *</Label>
                            <Input
                              id="issue"
                              value={formData.issue}
                              onChange={(e) => handleInputChange("issue", e.target.value)}
                              placeholder="e.g., Education funding, Healthcare access"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title">Story Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            placeholder="Give your story a compelling title"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="story">Your Story *</Label>
                          <Textarea
                            id="story"
                            value={formData.story}
                            onChange={(e) => handleInputChange("story", e.target.value)}
                            placeholder="Share your personal experience, concerns, or how this legislation affects you..."
                            rows={6}
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="consent"
                            checked={formData.consent}
                            onChange={(e) => handleInputChange("consent", e.target.checked)}
                            required
                            className="rounded"
                          />
                          <Label htmlFor="consent" className="text-sm">
                            I consent to share this story publicly on the Rise for Texas website. *
                          </Label>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Share My Story
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  )
}
