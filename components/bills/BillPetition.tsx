"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Megaphone, FileText, Clock, Users } from 'lucide-react'
import { Bill } from '@/app/api/txleg/route'

interface BillPetitionProps {
  bill: Bill
  onClose: () => void
}

export function BillPetition({ bill, onClose }: BillPetitionProps) {
  const [petitionForm, setPetitionForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    zipCode: "",
    comment: "",
    updates: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handlePetitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call - in real implementation, this would send to your backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store in localStorage for now (similar to stories)
      const existingPetitions = JSON.parse(localStorage.getItem('rise-for-texas-bill-petitions') || '{}')
      const billPetitions = existingPetitions[bill.billNumber] || []
      
      const newSignature = {
        id: Date.now().toString(),
        billNumber: bill.billNumber,
        firstName: petitionForm.firstName,
        lastName: petitionForm.lastName,
        email: petitionForm.email,
        zipCode: petitionForm.zipCode,
        comment: petitionForm.comment,
        updates: petitionForm.updates,
        timestamp: new Date().toISOString(),
      }
      
      billPetitions.push(newSignature)
      existingPetitions[bill.billNumber] = billPetitions
      localStorage.setItem('rise-for-texas-bill-petitions', JSON.stringify(existingPetitions))
      
      setIsSubmitted(true)
      setPetitionForm({
        firstName: "",
        lastName: "",
        email: "",
        zipCode: "",
        comment: "",
        updates: false,
      })
    } catch (error) {
      console.error('Error submitting petition:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'introduced':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in committee':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'on calendar':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'enrolled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Thank You!</CardTitle>
          <CardDescription className="text-lg">
            Your signature has been added to the petition for {bill.billNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You've joined other Texans in speaking out against this legislation. 
            Your voice matters in protecting our rights and values.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
            <Button onClick={() => setIsSubmitted(false)}>
              Sign Another Petition
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getStatusColor(bill.status)}>
                {bill.status}
              </Badge>
              <Badge variant="secondary">
                {bill.chamber === 'house' ? 'House' : 'Senate'}
              </Badge>
              <Badge className="bg-primary text-primary-foreground">
                Petition
              </Badge>
            </div>
            
            <CardTitle className="text-2xl font-serif mb-2">
              {bill.billNumber} — {bill.title}
            </CardTitle>
            
            <p className="text-muted-foreground mb-4">
              {bill.summary}
            </p>

            {/* Bill Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Last action: {bill.lastAction}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Current signatures: {(() => {
                  const existingPetitions = JSON.parse(localStorage.getItem('rise-for-texas-bill-petitions') || '{}')
                  return (existingPetitions[bill.billNumber] || []).length
                })()}</span>
              </div>
            </div>

            {/* Subjects */}
            {bill.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {bill.subjects.map((subject, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-muted/50"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Petition Form */}
          <div className="bg-muted/30 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Sign the Petition Against {bill.billNumber}</h4>
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
                  placeholder="Share why you oppose this bill..."
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing Petition...' : `Sign Petition Against ${bill.billNumber}`}
              </Button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(bill.url, '_blank', 'noopener,noreferrer')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Read Official Bill Text
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open('https://wrm.capitol.texas.gov/home', '_blank', 'noopener,noreferrer')}
            >
              <Users className="w-4 h-4 mr-2" />
              Contact Your Representatives
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
