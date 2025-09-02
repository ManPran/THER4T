"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Repeat2, ExternalLink, Twitter, Facebook, Instagram } from "lucide-react"

interface SocialPost {
  id: string
  platform: "twitter" | "facebook" | "instagram"
  author: string
  handle: string
  content: string
  timestamp: string
  likes: number
  shares: number
  comments: number
  hashtags: string[]
}

const mockPosts: SocialPost[] = []

export function SocialFeed() {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="w-4 h-4 text-blue-500" />
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-xl">Social Media Feed</h3>
        <Badge className="bg-primary/10 text-primary border-primary/20">Live Updates</Badge>
      </div>

      <div className="space-y-4">
        {mockPosts.length > 0 ? (
          mockPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`/social-avatar-${post.id}.png`} />
                    <AvatarFallback>
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{post.author}</span>
                      <span className="text-xs text-muted-foreground">@{post.handle}</span>
                      {getPlatformIcon(post.platform)}
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-3 leading-relaxed">{post.content}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                      {hashtag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Heart className="w-3 h-3" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageCircle className="w-3 h-3" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Repeat2 className="w-3 h-3" />
                    <span>{post.shares}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors ml-auto">
                    <ExternalLink className="w-3 h-3" />
                    <span>View Post</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">Social Media Feed Coming Soon</p>
                <p className="text-sm">Real community posts will appear here as our movement grows.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-center">
        <Button variant="outline" size="sm" className="bg-transparent">
          Load More Posts
        </Button>
      </div>
    </div>
  )
}
