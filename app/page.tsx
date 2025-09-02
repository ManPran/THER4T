"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, FileText, Calendar, ArrowRight, Heart, Share2, Users, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useStats } from "@/store/stats"
import { Navigation } from "@/components/Navigation"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase"
import { getDatabaseClient } from '@/lib/supabase'
import { localDb } from '@/lib/local-db'

export default function HomePage() {
  const { stats, fetchStats, isLoading } = useStats()
  const { toast } = useToast()
  
  // Add local state for consistent data with action page
  const [petitionStats, setPetitionStats] = useState({
    signatureCount: 0,
    goalCount: 10000,
    progress: 0,
  })
  const [socialShares, setSocialShares] = useState(0)
  const [storiesShared, setStoriesShared] = useState(0)
  const [mainPetitionId, setMainPetitionId] = useState<string | null>(null)

  useEffect(() => {
    // Load fresh stats from Supabase on component mount
    const loadFreshStats = async () => {
      try {
        await getMainPetitionId()
        await fetchPetitionStats()
        await fetchSocialShares() // This no longer needs mainPetitionId
        await fetchStories()
      } catch (error) {
        console.error('Error loading fresh stats:', error)
      }
    }
    loadFreshStats()

    // Set up real-time subscriptions for instant updates
    const setupRealTimeSubscriptions = async () => {
      try {
        const supabase = getSupabaseClient()
        
        const signaturesSubscription = mainPetitionId ? supabase
          .channel('signatures-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'signatures',
              filter: `petition_id=eq.${mainPetitionId}`
            },
            () => {
              fetchPetitionStats()
            }
          )
          .subscribe() : null

        const socialSharesSubscription = supabase
          .channel('social-shares-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'social_shares'
            },
            () => {
              fetchSocialShares()
            }
          )
          .subscribe()

        const storiesSubscription = supabase
          .channel('stories-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'stories'
            },
            () => {
              fetchStories()
            }
          )
          .subscribe()

        // Cleanup subscriptions on component unmount
        return () => {
          if (signaturesSubscription) {
            supabase.removeChannel(signaturesSubscription)
          }
          if (socialSharesSubscription) {
            supabase.removeChannel(socialSharesSubscription)
          }
          if (storiesSubscription) {
            supabase.removeChannel(storiesSubscription)
          }
        }
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error)
        return () => {}
      }
    }

    // Set up periodic refresh every 30 seconds as backup
    const refreshInterval = setInterval(async () => {
      try {
        await fetchSocialShares()
        await fetchStories()
      } catch (error) {
        console.error('Error refreshing stats:', error)
      }
    }, 30000) // 30 seconds

    // Setup real-time subscriptions
    const cleanupSubscriptions = setupRealTimeSubscriptions()

    // Cleanup intervals and subscriptions on component unmount
    return () => {
      clearInterval(refreshInterval)
      cleanupSubscriptions.then(cleanup => cleanup())
    }
  }, [mainPetitionId])

  const getMainPetitionId = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('petitions')
        .select('id')
        .eq('is_main', true)
        .eq('is_active', true)
        .single()
      
      if (error) {
        console.error('Error fetching main petition ID:', error)
        return
      }
      
      setMainPetitionId(data.id)
    } catch (error) {
      console.error('Error getting main petition ID:', error)
    }
  }

  // Fetch petition stats
  const fetchPetitionStats = async () => {
    if (!mainPetitionId) return
    
    try {
      // Try Supabase first, fallback to local
      let signatureCount = 0
      
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('signatures')
          .select('id', { count: 'exact' })
          .eq('petition_id', mainPetitionId)

        if (!error && data) {
          signatureCount = data.length || 0
        } else {
          throw new Error('Supabase query failed')
        }
      } catch {
        // Fallback to local database
        console.log('Using local database fallback for petition stats')
        const { data } = await localDb.countSignatures(mainPetitionId)
        signatureCount = data[0]?.count || 0
      }

      setPetitionStats({
        signatureCount,
        goalCount: 10000,
        progress: Math.min((signatureCount / 10000) * 100, 100)
      })
    } catch (error) {
      console.error('Error fetching petition stats:', error)
    }
  }

  // Fetch social shares
  const fetchSocialShares = async () => {
    try {
      // Try Supabase first, fallback to local
      let socialSharesCount = 0
      
      try {
        const supabase = getSupabaseClient()
        // Count ALL social shares, not just petition-specific ones
        const { data, error } = await supabase
          .from('social_shares')
          .select('id', { count: 'exact' })

        if (!error && data) {
          socialSharesCount = data.length || 0
        } else {
          throw new Error('Supabase query failed')
        }
      } catch {
        // Fallback to local database
        console.log('Using local database fallback for social shares')
        const { data } = await localDb.countSocialShares('general', null)
        socialSharesCount = data[0]?.count || 0
      }

      setSocialShares(socialSharesCount)
    } catch (error) {
      console.error('Error fetching social shares:', error)
    }
  }

  // Fetch stories
  const fetchStories = async () => {
    try {
      // Try Supabase first, fallback to local
      let storiesCount = 0
      
      try {
        const response = await fetch('/api/v1/stories')
        if (response.ok) {
          const stories = await response.json()
          storiesCount = stories.length || 0
        } else {
          throw new Error('API request failed')
        }
      } catch {
        // Fallback to local database
        console.log('Using local database fallback for stories')
        storiesCount = 0 // Local DB doesn't have stories yet
      }

      setStoriesShared(storiesCount)
    } catch (error) {
      console.error('Error fetching stories:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/texas-capitol-dramatic.png"
            alt="Texas State Capitol"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-secondary/10" />
        </div>

        <div className="relative z-10 py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Urgent Action Needed
              </Badge>
              <h1 className="font-serif font-bold text-4xl lg:text-6xl text-foreground mb-6 leading-tight">
                Stand Up for Texas. <span className="text-primary">Fight Back</span> Against Harmful Legislation.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of Texans mobilizing against bills that threaten our education, freedom, and community
                values. Your voice matters. Your action counts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/action">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 shadow-lg"
                  >
                    Sign the Petition
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/bills">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 bg-background/80 backdrop-blur-sm"
                  >
                    Learn About the Bills
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Impact Counter */}
          <div className="container mx-auto px-4 mt-16">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-4xl font-bold text-primary mb-2">
                        {isLoading ? '...' : petitionStats.signatureCount}
                      </div>
                      <div className="text-muted-foreground font-medium">Petition Signatures</div>
                      <div className="text-xs text-muted-foreground mt-1">Be the first to sign!</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-secondary" />
                      </div>
                      <div className="text-4xl font-bold text-secondary mb-2">
                        {isLoading ? '...' : storiesShared}
                      </div>
                      <div className="text-muted-foreground font-medium">Stories Shared</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Share your story
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                        <Share2 className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-4xl font-bold text-accent mb-2">
                        {isLoading ? '...' : socialShares}
                      </div>
                      <div className="text-muted-foreground font-medium">Social Shares</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Spread the word
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-4xl text-foreground mb-6">Take Action Today</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Every action counts in our fight for Texas. Choose how you want to make a difference and join a growing
              movement of engaged citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Link href="/action">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-card to-card/50 h-full flex flex-col">
                <CardHeader className="text-center pb-4 flex-shrink-0">
                  <div className="relative mb-6">
                    <Image
                      src="/diverse-students-studying.png"
                      alt="Students engaged in learning - Sign petition for education"
                      width={300}
                      height={200}
                      className="rounded-lg object-cover w-full h-32"
                    />
                    <div className="absolute inset-0 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors" />
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                  <CardTitle className="font-serif text-xl">Sign Petition</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-1 flex flex-col justify-between">
                  <CardDescription className="mb-6 text-base flex-shrink-0">
                    Add your voice to thousands demanding action against harmful bills.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0"
                  >
                    Sign Now
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/stories">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-card to-card/50 h-full flex flex-col">
                <CardHeader className="text-center pb-4 flex-shrink-0">
                  <div className="relative mb-6">
                    <Image
                      src="/texas-family-discussion.png"
                      alt="Family sharing stories"
                      width={300}
                      height={200}
                      className="rounded-lg object-cover w-full h-32"
                    />
                    <div className="absolute inset-0 bg-secondary/20 rounded-lg group-hover:bg-secondary/30 transition-colors" />
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-secondary/90 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-secondary-foreground" />
                    </div>
                  </div>
                  <CardTitle className="font-serif text-xl">Share Your Story</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-1 flex flex-col justify-between">
                  <CardDescription className="mb-6 text-base flex-shrink-0">
                    Tell us how these bills will impact you and your community.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors flex-shrink-0"
                  >
                    Share Story
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/events">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-card to-card/50 h-full flex flex-col">
                <CardHeader className="text-center pb-4 flex-shrink-0">
                  <div className="relative mb-6">
                    <Image
                      src="/texas-capitol-rally.png"
                      alt="Community rally"
                      width={300}
                      height={200}
                      className="rounded-lg object-cover w-full h-32"
                    />
                    <div className="absolute inset-0 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors" />
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-accent/90 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent-foreground" />
                    </div>
                  </div>
                  <CardTitle className="font-serif text-xl">Join Events</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-1 flex flex-col justify-between">
                  <CardDescription className="mb-6 text-base flex-shrink-0">
                    Attend rallies, town halls, and community organizing meetings.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent group-hover:bg-accent group-hover:text-accent-foreground transition-colors flex-shrink-0"
                  >
                    Find Events
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-card to-card/50 h-full flex flex-col">
              <CardHeader className="text-center pb-4 flex-shrink-0">
                <div className="relative mb-6">
                  <Image
                    src="/texas-social-share.png"
                    alt="Social media sharing"
                    width={300}
                    height={200}
                    className="rounded-lg object-cover w-full h-32"
                  />
                  <div className="absolute inset-0 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors" />
                  <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="font-serif text-xl">Spread the Word</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-1 flex flex-col justify-between">
                <CardDescription className="mb-6 text-base flex-shrink-0">
                  Share on social media and help us reach more Texans.
                </CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0"
                  onClick={async () => {
                    try {
                      // Record social share in backend first
                      const response = await fetch('/api/v1/social-shares', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          platform: 'navigator' in window && typeof navigator.share === 'function' ? 'native-share' : 'clipboard',
                          entityType: 'general',
                          entityId: null,
                        }),
                      });

                      if (response.ok) {
                        // Refresh the data to reflect the new share count
                        await fetchSocialShares()
                        // Also refresh stories to check for any new local stories
                        await fetchStories()
                      }

                      // Then perform the share action
                      if ('navigator' in window && typeof navigator.share === 'function') {
                        await navigator.share({
                          title: "Rise for Texas",
                          text: "Join the fight against harmful legislation in Texas",
                          url: window.location.href,
                        })
                      } else {
                        try {
                          await navigator.clipboard.writeText(window.location.href)
                          alert("Link copied to clipboard!")
                        } catch (clipboardError) {
                          console.warn('Clipboard access failed:', clipboardError)
                          // Fallback: try to copy using a different method
                          try {
                            const textArea = document.createElement('textarea')
                            textArea.value = window.location.href
                            textArea.style.position = 'fixed'
                            textArea.style.left = '-999999px'
                            textArea.style.top = '-999999px'
                            document.body.appendChild(textArea)
                            textArea.focus()
                            textArea.select()
                            document.execCommand('copy')
                            document.body.removeChild(textArea)
                            alert("Link copied to clipboard!")
                          } catch (fallbackError) {
                            console.error('All clipboard methods failed:', fallbackError)
                            alert('Could not copy to clipboard. Please copy manually: ' + window.location.href)
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error sharing:', error)
                    }
                  }}
                >
                  Share Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Spotlight & Stories */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif font-bold text-4xl text-foreground mb-6">Community Voices</h2>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
                Real stories from real Texans will appear here as our community grows.
              </p>
            </div>

            {/* Stories Display */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <div className="text-center mb-4">
                  <h3 className="font-serif font-bold text-2xl text-foreground">Recent Stories</h3>
                </div>
                <p className="text-muted-foreground">
                  {storiesShared > 0 
                    ? `${storiesShared} story${storiesShared === 1 ? '' : 'ies'} shared so far`
                    : 'Be the first to share your story!'
                  }
                </p>
              </div>
              
              {/* Stories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storiesShared > 0 ? (
                  // Placeholder for actual stories - will be populated when backend is ready
                  <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Stories Coming Soon</h4>
                          <p className="text-sm text-muted-foreground">Backend integration in progress</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        We're working on displaying your stories here. In the meantime, visit the stories page to share yours!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  // Empty state
                  <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg col-span-full max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-secondary-foreground" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">No Stories Yet</h4>
                      <p className="text-muted-foreground mb-4">
                        Be the first to share how these bills affect you and your community.
                      </p>
                      <Link href="/stories">
                        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                          Share Your Story
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-2xl">Be the First Voice</h3>
                        <p className="text-muted-foreground">Share your story with the community</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                      Your experiences and perspectives matter. Be among the first to share how current legislation
                      affects your daily life, your family, and your community.
                    </p>
                    <Link href="/stories">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Share Your Story
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
              <div className="relative">
                <Image
                  src="/texas-town-hall.png"
                  alt="Community meeting"
                  width={500}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bills Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif font-bold text-4xl text-foreground mb-6">The Main Bill We're Fighting</h2>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
                HB 1481 threatens student rights and communication access. Join us in opposing this harmful legislation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Bill - HB 1481 */}
              <Card className="border-l-4 border-l-primary shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20">Main Bill</Badge>
                        <Badge variant="outline">HB 1481</Badge>
                      </div>
                      <CardTitle className="font-serif text-2xl mb-3">
                        Stop HB 1481: Personal Device Restrictions in Schools
                      </CardTitle>
                    </div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center ml-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-6 leading-relaxed">
                    Join Texans demanding our legislators vote NO on HB 1481, which will prohibit students from possessing 
                    or using personal communication devices during the school day, effective September 1, 2025.
                  </CardDescription>
                  
                  {/* HB 1481 Specific Information */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
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

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/action">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Sign Petition Against HB 1481
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open('https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB1481', '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Read Official Text
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Find Your Representatives */}
              <Card className="border-l-4 border-l-secondary shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-serif text-2xl mb-3">Find Your Representatives</CardTitle>
                    </div>
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center ml-4">
                      <MapPin className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-6 leading-relaxed">
                    Find your elected officials and let them know where you stand on these critical issues.
                  </CardDescription>
                  <div className="text-center">
                    <Button 
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8"
                      onClick={() => window.open('https://wrm.capitol.texas.gov/home', '_blank')}
                    >
                      Get Your Representative
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/texas-sunset-hills-silhouette.png" alt="Texas landscape" fill className="object-cover" />
          <div className="absolute inset-0 bg-primary/80" />
        </div>

        <div className="relative z-10 py-20 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif font-bold text-4xl lg:text-5xl mb-6">The Time for Action is Now</h2>
              <p className="text-xl lg:text-2xl mb-10 opacity-90 leading-relaxed">
                Join thousands of Texans who refuse to let harmful legislation define our future. Together, we can
                protect what matters most to our communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/action">
                  <Button size="lg" variant="secondary" className="font-semibold text-lg px-10 py-4 shadow-lg">
                    Sign the Petition
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-10 py-4 bg-transparent backdrop-blur-sm"
                  onClick={() => {
                    document.querySelector('input[name="zipcode"]')?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Contact Representatives
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
