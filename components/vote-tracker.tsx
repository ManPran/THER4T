"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react"

interface Legislator {
  id: string
  name: string
  title: string
  party: "R" | "D" | "I"
  district: string
  position: "support" | "oppose" | "undecided"
  influence: "high" | "medium" | "low"
  lastUpdate: string
}

interface BillVoteData {
  billNumber: string
  billTitle: string
  status: "committee" | "house-floor" | "senate-floor" | "passed" | "failed"
  supportCount: number
  opposeCount: number
  undecidedCount: number
  keyLegislators: Legislator[]
}

const mockVoteData: BillVoteData = {
  billNumber: "HB 1481",
  billTitle: "Device Restrictions in Schools",
  status: "committee",
  supportCount: 0,
  opposeCount: 0,
  undecidedCount: 0,
  keyLegislators: [],
}

export function VoteTracker() {
  const getPositionIcon = (position: string) => {
    switch (position) {
      case "support":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "oppose":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "undecided":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "support":
        return (
          <Badge variant="destructive" className="text-xs">
            Supporting Bill
          </Badge>
        )
      case "oppose":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Opposing Bill</Badge>
      case "undecided":
        return (
          <Badge variant="secondary" className="text-xs">
            Undecided
          </Badge>
        )
      default:
        return null
    }
  }

  const getInfluenceIcon = (influence: string) => {
    switch (influence) {
      case "high":
        return <TrendingUp className="w-3 h-3 text-primary" />
      case "low":
        return <TrendingDown className="w-3 h-3 text-muted-foreground" />
      default:
        return null
    }
  }

  const totalVotes = mockVoteData.supportCount + mockVoteData.opposeCount + mockVoteData.undecidedCount
  const supportPercentage = (mockVoteData.supportCount / totalVotes) * 100
  const opposePercentage = (mockVoteData.opposeCount / totalVotes) * 100
  const undecidedPercentage = (mockVoteData.undecidedCount / totalVotes) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div>
              <CardTitle className="font-serif text-xl">{mockVoteData.billTitle}</CardTitle>
              <CardDescription>{mockVoteData.billNumber} • Committee Review Stage</CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {mockVoteData.status.replace("-", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vote Breakdown */}
          {totalVotes > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-2xl font-bold text-destructive mb-1">{mockVoteData.supportCount}</div>
                <div className="text-sm text-muted-foreground">Supporting Bill</div>
                <div className="text-xs text-muted-foreground mt-1">{supportPercentage.toFixed(1)}%</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700 mb-1">{mockVoteData.opposeCount}</div>
                <div className="text-sm text-muted-foreground">Opposing Bill</div>
                <div className="text-xs text-muted-foreground mt-1">{opposePercentage.toFixed(1)}%</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700 mb-1">{mockVoteData.undecidedCount}</div>
                <div className="text-sm text-muted-foreground">Undecided</div>
                <div className="text-xs text-muted-foreground mt-1">{undecidedPercentage.toFixed(1)}%</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">Vote Tracking Coming Soon</p>
                <p className="text-sm">Real-time voting data will be available when the system launches.</p>
              </div>
            </div>
          )}

          {/* Progress Bars */}
          {totalVotes > 0 && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-destructive">Supporting Bill</span>
                  <span>{supportPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={supportPercentage} className="h-2 bg-muted [&>div]:bg-destructive" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-green-700">Opposing Bill</span>
                  <span>{opposePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={opposePercentage} className="h-2 bg-muted [&>div]:bg-green-600" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-yellow-700">Undecided</span>
                  <span>{undecidedPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={undecidedPercentage} className="h-2 bg-muted [&>div]:bg-yellow-600" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Legislators */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Key Legislators to Watch</CardTitle>
          <CardDescription>High-influence legislators whose positions could sway the vote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVoteData.keyLegislators.length > 0 ? (
              mockVoteData.keyLegislators.map((legislator) => (
                <div key={legislator.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`/legislator-${legislator.id}.png`} />
                    <AvatarFallback>
                      {legislator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{legislator.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {legislator.party}
                      </Badge>
                      {getInfluenceIcon(legislator.influence)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {legislator.title} • {legislator.district}
                    </p>
                    <div className="flex items-center gap-3">
                      {getPositionIcon(legislator.position)}
                      {getPositionBadge(legislator.position)}
                      <span className="text-xs text-muted-foreground">Updated {legislator.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Legislator Tracking Coming Soon</p>
                  <p className="text-sm">Real-time legislator positions and voting data will be available when the system launches.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
