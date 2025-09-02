"use client"

import React, { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, AlertTriangle, Info, Calendar } from 'lucide-react'
import { BillsList } from '@/components/bills/BillsList'
import { useImpact } from '@/store/impact'
import { fetchImpactData } from '@/store/impact'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'

export default function BillsPage() {
  const [activeChamber, setActiveChamber] = useState<"house" | "senate">("senate")
  const { setAll } = useImpact()

  // Prefetch impact data on page load
  useEffect(() => {
    const loadImpactData = async () => {
      try {
        const impactData = await fetchImpactData()
        setAll(impactData)
      } catch (error) {
        console.error('Failed to load impact data:', error)
      }
    }

    loadImpactData()
  }, [setAll])



  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <Navigation />

      {/* Page Title Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-serif font-bold text-2xl text-foreground">Texas Bills</h1>
              <p className="text-sm text-muted-foreground">Track active legislation impacting civil liberties and education</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-muted/50">
            Real-time Updates
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* HB 1481 Callout */}
          <Card className="mb-8 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <CardTitle className="text-xl text-amber-900">
                  HB 1481 — Personal Device Restrictions in Schools
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  Effective Sept 1, 2025
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800 mb-4">
                This bill has been enrolled and will prohibit students from possessing or using personal communication devices 
                during the school day, with exceptions for IEP/medical/safety needs. It requires secure storage and will take 
                effect on September 1, 2025, unless immediate effect is granted.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB1481"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 underline"
                >
                  <FileText className="w-4 h-4" />
                  Read Official Text (TLO)
                </a>
                <a
                  href="/action"
                  className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 underline"
                >
                  <Calendar className="w-4 h-4" />
                  Sign Main Petition
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Texas Legislative Representatives Section */}
          <Card className="mb-8 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl text-blue-900">Texas Legislative Representatives</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Civics API</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-4">
                Track your state representatives and their legislative activities. Use this information to contact your representatives about bills that matter to you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-100/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">31</div>
                  <div className="text-sm text-blue-700">State Senators</div>
                </div>
                <div className="text-center p-4 bg-blue-100/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">150</div>
                  <div className="text-sm text-blue-700">State Representatives</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <a 
                  href="https://wrm.capitol.texas.gov/home" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 underline"
                >
                  <Info className="w-4 h-4" />
                  Find Your Representatives
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Chamber Tabs */}
          <Tabs value={activeChamber} onValueChange={(value) => setActiveChamber(value as "house" | "senate")}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="senate" className="text-sm font-medium">
                  Senate
                </TabsTrigger>
                <TabsTrigger value="house" className="text-sm font-medium">
                  House
                </TabsTrigger>
              </TabsList>
              
              <div className="text-sm text-muted-foreground">
                Showing {activeChamber === 'senate' ? 'Senate' : 'House'} bills
              </div>
            </div>

            <TabsContent value="senate" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Senate Bills</h2>
                <p className="text-muted-foreground">
                  Track active Senate legislation that may impact education, civil liberties, and community values.
                </p>
              </div>
              
              <BillsList 
                chamber="senate" 
              />
            </TabsContent>

            <TabsContent value="house" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">House Bills</h2>
                <p className="text-muted-foreground">
                  Monitor House legislation including HB 1481 and other bills affecting Texas communities.
                </p>
              </div>
              
              <BillsList 
                chamber="house" 
              />
            </TabsContent>
          </Tabs>

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Track Bills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  • <strong>Introduced:</strong> Bill has been filed and assigned a number
                </p>
                <p>
                  • <strong>In Committee:</strong> Bill is being reviewed by a legislative committee
                </p>
                <p>
                  • <strong>On Calendar:</strong> Bill is scheduled for floor debate and vote
                </p>
                <p>
                  • <strong>Passed:</strong> Bill has been approved by one or both chambers
                </p>
                <p>
                  • <strong>Enrolled:</strong> Bill has been finalized and sent to the governor
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  • <strong>Texas Legislature Online (TLO):</strong> Official bill status and text
                </p>
                <p>
                  • <strong>LegiScan:</strong> Real-time legislative tracking and analysis
                </p>
                <p>
                  • <strong>RSS Feeds:</strong> Automatic updates from official sources
                </p>
                <p>
                  • <strong>Cache Policy:</strong> Data refreshes every 5 minutes with fallback
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <Alert className="mt-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> Bill status updates are fetched from official sources every few minutes. 
              For the most current information, always verify with the Texas Legislature Online (TLO) or contact 
              your representative directly.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
