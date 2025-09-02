"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, FileText, Megaphone, Clock } from 'lucide-react'
import { Bill } from '@/app/api/txleg/route'
import { 
  getStatusColor, 
  getChamberDisplay, 
  getChamberAbbr, 
  formatTimestamp, 
  getTimeAgo 
} from '@/lib/txleg'

interface BillCardProps {
  bill: Bill
  onViewPetition: (billNumber: string) => void
  isMainPetition?: boolean
}

export function BillCard({ bill, onViewPetition, isMainPetition = false }: BillCardProps) {
  const isHB1481 = bill.billNumber === 'HB 1481'
  
  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-md ${
      isMainPetition ? 'ring-2 ring-primary/20 bg-primary/5' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(bill.status)} font-medium`}
              >
                {bill.status}
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-muted text-muted-foreground"
              >
                {getChamberDisplay(bill.chamber)}
              </Badge>
              {isHB1481 && (
                <Badge className="bg-primary text-primary-foreground">
                  Main Petition
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-lg font-semibold leading-tight mb-2">
              {bill.billNumber} — {bill.title}
            </CardTitle>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bill.summary}
            </p>
            
            {isHB1481 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Effective September 1, 2025
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  This bill has been enrolled and will take effect unless immediate effect is granted.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Status and Action Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last action: {bill.lastAction}</span>
            </div>
            <span>{getTimeAgo(bill.lastActionAt)}</span>
          </div>
          
          {/* Subjects */}
          {bill.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bill.subjects.slice(0, 3).map((subject, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-muted/50"
                >
                  {subject}
                </Badge>
              ))}
              {bill.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs bg-muted/50">
                  +{bill.subjects.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => window.open(bill.url, '_blank', 'noopener,noreferrer')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Read Official Text
            </Button>
            
            {onViewPetition && (
              <Button
                size="sm"
                className={`flex-1 sm:flex-none ${
                  isMainPetition 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                }`}
                onClick={() => onViewPetition(bill.billNumber)}
              >
                <Megaphone className="w-4 h-4 mr-2" />
                {isMainPetition ? 'Sign Main Petition' : 'View Petition'}
              </Button>
            )}
          </div>
          
          {/* Source Attribution */}
          <div className="text-xs text-muted-foreground text-right">
            Source: {bill.url.includes('capitol.texas.gov') ? 'Texas Legislature Online' : 'LegiScan'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
