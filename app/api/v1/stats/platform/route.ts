import { NextResponse } from 'next/server'
import { getDatabaseClient, getServiceSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const dbClient = await getDatabaseClient()
    console.log(`Using ${dbClient.type} database for platform stats`)
    
    let signaturesCount = 0
    let socialSharesCount = 0

    if (dbClient.type === 'supabase') {
      // Try to use service client first (bypasses RLS)
      let client: any
      try {
        client = getServiceSupabaseClient()
        console.log('Using service role client for platform stats')
      } catch {
        client = dbClient.client
        console.log('Service role not available, using anon client for platform stats')
      }
      
      // Get signatures count from Supabase
      const { count: sigCount } = await client
        .from('signatures')
        .select('*', { count: 'exact', head: true })
      
      // Get social shares count from Supabase
      const { count: shareCount } = await client
        .from('social_shares')
        .select('*', { count: 'exact', head: true })
      
      signaturesCount = sigCount || 0
      socialSharesCount = shareCount || 0
    } else {
      // Fallback to local database
      const stats = await dbClient.client.getStats()
      signaturesCount = stats.data.signatures
      socialSharesCount = stats.data.social_shares
    }

    return NextResponse.json({
      signatures: signaturesCount,
      social_shares: socialSharesCount,
      total_impact: signaturesCount + socialSharesCount
    })
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 }
    )
  }
}
