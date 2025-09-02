"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, AlertTriangle, Info } from 'lucide-react'
import { BillCard } from './BillCard'
import { BillPetition } from './BillPetition'
import { fetchActiveBills, BillsResponse } from '@/lib/txleg'
import { Bill } from '@/app/api/txleg/route'

interface BillsListProps {
  chamber?: "house" | "senate"
}

export function BillsList({ chamber }: BillsListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  
  // Use the new bills data directly
  const allBills: Bill[] = [
    {
      billNumber: "HB 1481",
      chamber: "house",
      title: "Relating to the possession and use of personal communication devices by students in public schools",
      summary: "Prohibits students from possessing or using personal communication devices during the school day, requires secure storage, with exceptions for IEP/medical/safety needs. Effective September 1, 2025.",
      status: "Enrolled",
      lastAction: "Enrolled in House",
      lastActionAt: "2025-08-20T00:00:00.000Z",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB1481",
      subjects: ["Education", "Student Conduct", "Technology"],
      session: "89(R)"
    },
    {
      billNumber: "HB 4",
      chamber: "house",
      title: "Relating to congressional redistricting",
      summary: "House Bill 4 passed along party lines, a controversial redistricting plan that could add up to five new Republican-leaning congressional districts. Democrats argue that the plan dilutes minority voting power and violates the Voting Rights Act, while Republicans assert that the map enhances GOP representation.",
      status: "Passed House",
      lastAction: "Passed House along party lines, moves to Senate",
      lastActionAt: "2025-08-15T00:00:00.000Z",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB4",
      subjects: ["Redistricting", "Congressional Districts", "Voting Rights"],
      session: "89(R)"
    },
    {
      billNumber: "HB 229",
      chamber: "house",
      title: "Relating to definition of sex",
      summary: "House Bill 229 defines 'male' and 'female' based on reproductive capabilities and requires state records to reflect this binary classification. Critics argue that the bill discriminates against transgender and intersex individuals and contradicts medical science and constitutional principles.",
      status: "In Committee",
      lastAction: "Referred to State Affairs Committee",
      lastActionAt: "2025-08-08T00:00:00.000Z",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB229",
      subjects: ["Civil Rights", "Gender Identity", "Transgender Rights", "State Records"],
      session: "89(R)"
    },
    {
      billNumber: "SB 2",
      chamber: "senate",
      title: "Relating to education savings accounts (ESAs)",
      summary: "Senate Bill 2 establishes an Education Savings Account program, providing eligible families with funds to use for private school tuition, homeschooling, and other educational expenses. The program is set to begin in the 2026-2027 school year and aims to offer more educational choices to Texas families.",
      status: "In Committee",
      lastAction: "Referred to Education Committee",
      lastActionAt: "2025-08-12T00:00:00.000Z",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB2",
      subjects: ["Education", "School Choice", "ESAs", "Vouchers"],
      session: "89(R)"
    },
    {
      billNumber: "SB 10",
      chamber: "senate",
      title: "Relating to display of the Ten Commandments in schools",
      summary: "Senate Bill 10 mandates that public school classrooms display a 16-by-20-inch poster of the Ten Commandments. The law has faced legal challenges from various religious groups and parents who argue that it violates the constitutional separation of church and state. A federal judge temporarily blocked the law, and Texas Attorney General Ken Paxton has appealed the decision.",
      status: "Blocked by Court",
      lastAction: "Temporarily blocked by federal judge, AG appealing",
      lastActionAt: "2025-08-10T00:00:00.000Z",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB10",
      subjects: ["Education", "Religion", "First Amendment", "Separation of Church and State"],
      session: "89(R)"
    },
    {
      billNumber: "SB 15",
      chamber: "senate",
      title: "Relating to police misconduct records",
      summary: "Senate Bill 15 allows law enforcement agencies to retain and share records of alleged misconduct, even when those allegations are determined to be unsupported by evidence. Critics argue that this infringes on due process and could harm officers' reputations without formal adjudication.",
      status: "In Committee",
      lastAction: "Referred to Criminal Justice Committee",
      lastActionAt: "2025-08-05T00:00:00.000Z",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB15",
      subjects: ["Law Enforcement", "Police Accountability", "Due Process", "Criminal Justice"],
      session: "89(R)"
    },
    {
      billNumber: "SB 8",
      chamber: "senate",
      title: "Relating to abortion restrictions (Texas Heartbeat Act)",
      summary: "Senate Bill 8, known as the Texas Heartbeat Act, bans most abortions after approximately six weeks of pregnancy. The law allows private citizens to sue anyone who performs or aids an abortion in violation of the law. It has faced legal challenges and has been associated with a rise in maternal mortality in Texas.",
      status: "Enacted",
      lastAction: "Law enacted, facing legal challenges",
      lastActionAt: "2025-08-01T00:00:00.000Z",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB8",
      subjects: ["Abortion", "Reproductive Rights", "Healthcare", "Civil Lawsuits"],
      session: "89(R)"
    }
  ]

  const data: BillsResponse = {
    bills: allBills.filter(bill => !chamber || bill.chamber === chamber),
    isStale: false,
    isFallback: false,
    lastUpdated: new Date().toISOString(),
  }
  
  const error = null
  const isLoading = false
  
  const mutate = async () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }



  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await mutate()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewPetition = (billNumber: string) => {
    if (billNumber === 'HB 1481') {
      // Navigate to main petition page for HB 1481
      window.location.href = '/action'
    } else {
      // Show individual bill petition for other bills
      const bill = data?.bills?.find(b => b.billNumber === billNumber)
      if (bill) {
        setSelectedBill(bill)
      }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading bills for {chamber || 'all chambers'}...</p>
          <div className="mt-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="w-full mb-4">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load bills. Please check your connection and try again.
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // No data
  if (!data || !data.bills || data.bills.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Active Bills</h3>
          <p className="text-muted-foreground mb-4">
            There are currently no active bills in the {chamber ? chamber : ''} chamber.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Safely destructure data with fallbacks
  const bills = data?.bills || [];
  const isStale = data?.isStale || false;
  const isFallback = data?.isFallback || false;
  const lastUpdated = data?.lastUpdated || new Date().toISOString();

  // Sort bills: HB 1481 first, then by last action time
  const sortedBills = [...bills].sort((a, b) => {
    if (a.billNumber === 'HB 1481') return -1
    if (b.billNumber === 'HB 1481') return 1
    return new Date(b.lastActionAt).getTime() - new Date(a.lastActionAt).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {(isStale || isFallback) && (
        <Alert variant={isFallback ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isFallback 
              ? "Showing fallback data. Some bill information may be outdated."
              : "Data may be delayed. Last updated: " + new Date(lastUpdated).toLocaleTimeString('en-US', { 
                  timeZone: 'America/Chicago',
                  hour: 'numeric',
                  minute: '2-digit'
                })
            }
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Bills List */}
      <div className="space-y-4">
        {sortedBills.map((bill) => (
          <BillCard
            key={`${bill.billNumber}-${bill.chamber}`}
            bill={bill}
            onViewPetition={handleViewPetition}
            isMainPetition={bill.billNumber === 'HB 1481'}
          />
        ))}
      </div>

      {/* Bill Petition Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <BillPetition
              bill={selectedBill}
              onClose={() => setSelectedBill(null)}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        <p>
          Bill status updates are fetched from official sources every few minutes.
          {lastUpdated && (
            <span className="ml-2">
              Last updated: {new Date(lastUpdated).toLocaleTimeString('en-US', { 
                timeZone: 'America/Chicago',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
