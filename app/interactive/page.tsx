import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractivePoll } from "@/components/interactive-poll"
import { SocialFeed } from "@/components/social-feed"
import { VoteTracker } from "@/components/vote-tracker"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Megaphone, BarChart3, MessageSquare, TrendingUp, Hash, ThumbsUp, Reply } from "lucide-react"

const pollData = [
  {
    title: "Which issue concerns you most?",
    description: "Help us understand community priorities",
          options: [
        { id: "education", text: "Education funding cuts", votes: 0, percentage: 0 },
        { id: "voting", text: "Voting rights restrictions", votes: 0, percentage: 0 },
        { id: "healthcare", text: "Healthcare access limits", votes: 0, percentage: 0 },
      ],
          totalVotes: 0,
  },
  {
    title: "How should we prioritize our advocacy efforts?",
    description: "Guide our strategic focus",
    options: [
      { id: "grassroots", text: "Grassroots organizing", votes: 892, percentage: 45 },
      { id: "lobbying", text: "Direct lobbying", votes: 534, percentage: 27 },
      { id: "media", text: "Media campaigns", votes: 556, percentage: 28 },
    ],
    totalVotes: 1982,
  },
]

const discussionTopics = [
  {
    id: "1",
    title: "Impact of Education Cuts on Rural Districts",
    author: "Sarah Martinez",
    role: "Teacher",
    replies: 23,
    likes: 47,
    lastActivity: "2h ago",
    preview: "Rural districts are already struggling with limited resources. These cuts would be devastating...",
  },
  {
    id: "2",
    title: "Voting Access in Elderly Communities",
    author: "Robert Williams",
    role: "Community Organizer",
    replies: 18,
    likes: 34,
    lastActivity: "4h ago",
    preview: "Many seniors in our community rely on mobile voting units. Eliminating these would...",
  },
  {
    id: "3",
    title: "Healthcare Implications for Working Families",
    author: "Maria Lopez",
    role: "Parent",
    replies: 31,
    likes: 62,
    lastActivity: "6h ago",
    preview: "As a working mother, I'm concerned about how these restrictions would affect...",
  },
]

export default function InteractivePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Megaphone className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-xl text-foreground">Rise for Texas</h1>
                <p className="text-sm text-muted-foreground">Fighting for Our Future</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="/bills" className="text-foreground hover:text-primary transition-colors">
                Bills
              </a>
              <a href="/stories" className="text-foreground hover:text-primary transition-colors">
                Stories
              </a>
              <a href="/action" className="text-foreground hover:text-primary transition-colors">
                Take Action
              </a>
              <a href="/interactive" className="text-primary font-semibold">
                Community
              </a>
            </nav>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Join Discussion
            </Button>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">Interactive Community</Badge>
            <h1 className="font-serif font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Engage, Discuss, and Track Progress
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join the conversation, participate in polls, track legislative votes, and connect with fellow Texans
              fighting for our shared values.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="polls" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="polls">Polls & Surveys</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="tracker">Vote Tracker</TabsTrigger>
                <TabsTrigger value="social">Social Feed</TabsTrigger>
              </TabsList>

              <TabsContent value="polls" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif font-bold text-2xl text-foreground mb-4">Community Polls & Surveys</h2>
                  <p className="text-muted-foreground">
                    Share your opinions and see how the community feels about key issues
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {pollData.map((poll, index) => (
                    <InteractivePoll
                      key={index}
                      title={poll.title}
                      description={poll.description}
                      options={poll.options}
                      totalVotes={poll.totalVotes}
                    />
                  ))}
                </div>

                {/* Additional Polls */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-secondary" />
                      <Badge variant="outline" className="text-xs">
                        Quick Poll
                      </Badge>
                    </div>
                    <CardTitle className="font-serif">How likely are you to attend a local rally?</CardTitle>
                    <CardDescription>Help us plan upcoming events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {["Very Likely", "Somewhat Likely", "Unlikely", "Not Sure"].map((option, index) => (
                        <Button key={index} variant="outline" className="bg-transparent">
                          {option}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif font-bold text-2xl text-foreground mb-4">Community Discussions</h2>
                  <p className="text-muted-foreground">Join moderated discussions about the issues that matter most</p>
                </div>

                {/* Start New Discussion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Start a New Discussion</CardTitle>
                    <CardDescription>Share your thoughts and start a conversation with the community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Discussion Topic</Label>
                      <Input id="topic" placeholder="What would you like to discuss?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Your Thoughts</Label>
                      <Textarea
                        id="content"
                        placeholder="Share your perspective on this issue..."
                        className="min-h-24"
                      />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Discussion
                    </Button>
                  </CardContent>
                </Card>

                {/* Discussion Topics */}
                <div className="space-y-4">
                  {discussionTopics.map((topic) => (
                    <Card key={topic.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="font-serif text-lg mb-2">{topic.title}</CardTitle>
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={`/discussion-avatar-${topic.id}.png`} />
                                <AvatarFallback>
                                  {topic.author
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-semibold text-sm">{topic.author}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {topic.role}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{topic.preview}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Reply className="w-4 h-4" />
                            <span>{topic.replies} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{topic.likes} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Last activity {topic.lastActivity}</span>
                          </div>
                          <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                            Join Discussion
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Discussion Guidelines */}
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="font-serif">Discussion Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Keep discussions respectful and focused on the issues</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Share personal experiences and factual information</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">Report inappropriate content using the flag button</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">All discussions are moderated to maintain quality</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tracker" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif font-bold text-2xl text-foreground mb-4">Legislative Vote Tracker</h2>
                  <p className="text-muted-foreground">Track how legislators are positioning themselves on key bills</p>
                </div>

                <VoteTracker />
              </TabsContent>

              <TabsContent value="social" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif font-bold text-2xl text-foreground mb-4">Social Media Feed</h2>
                  <p className="text-muted-foreground">See what the community is saying across social platforms</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <SocialFeed />
                  </div>

                  <div className="space-y-6">
                    {/* Trending Hashtags */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Hash className="w-5 h-5" />
                          Trending Hashtags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { tag: "#RiseForTexas", posts: "Coming soon" },
                            { tag: "#StopTheBills", posts: "Coming soon" },
                            { tag: "#TexasEducation", posts: "Coming soon" },
                            { tag: "#VotingRights", posts: "Coming soon" },
                            { tag: "#HealthcareForAll", posts: "Coming soon" },
                          ].map((hashtag, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="font-semibold text-primary">{hashtag.tag}</span>
                              <span className="text-xs text-muted-foreground">{hashtag.posts}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Community Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Community Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Posts Today</span>
                            <span className="font-semibold">247</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Active Members</span>
                            <span className="font-semibold">1,892</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Shares This Week</span>
                            <span className="font-semibold">8,756</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Engagement Rate</span>
                            <span className="font-semibold text-green-600">+23%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-accent text-accent-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-3xl mb-4">Join the Conversation</h2>
            <p className="text-xl mb-8 opacity-90">
              Your voice matters in shaping our strategy and building our movement. Participate in polls, join
              discussions, and stay informed about legislative progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="font-semibold text-lg px-8">
                Take a Poll
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent font-semibold text-lg px-8 bg-transparent"
              >
                Start Discussion
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
