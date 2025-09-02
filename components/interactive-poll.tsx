"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users } from "lucide-react"

interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

interface PollProps {
  title: string
  description: string
  options: PollOption[]
  totalVotes: number
  hasVoted?: boolean
}

export function InteractivePoll({ title, description, options, totalVotes, hasVoted = false }: PollProps) {
  const [voted, setVoted] = useState(hasVoted)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleVote = () => {
    if (selectedOption) {
      setVoted(true)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <Badge variant="outline" className="text-xs">
            Live Poll
          </Badge>
        </div>
        <CardTitle className="font-serif text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!voted ? (
          <>
            <div className="space-y-3">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="text-primary"
                  />
                  <span className="text-sm">{option.text}</span>
                </label>
              ))}
            </div>
            <Button onClick={handleVote} disabled={!selectedOption} className="w-full bg-primary hover:bg-primary/90">
              Cast Your Vote
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            {options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{option.text}</span>
                  <span className="font-semibold">{option.percentage}%</span>
                </div>
                <Progress value={option.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">{option.votes} votes</div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Users className="w-4 h-4" />
              <span>{totalVotes} total votes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
