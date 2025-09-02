import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseClient, getServiceSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ petitionId: string }> }
) {
  try {
    // Prefer service client (bypasses RLS) if available
    let serviceClient: any | null = null
    try {
      serviceClient = getServiceSupabaseClient()
    } catch {
      serviceClient = null
    }

    // Get database client with fallback
    const dbClient = await getDatabaseClient()
    console.log(`Using ${dbClient.type} database for petition stats`)
    
    // Await params in Next.js 15
    const { petitionId } = await params

    // Resolve slug -> id if needed
    let resolvedPetitionId = petitionId
    if ((serviceClient || dbClient.type === 'supabase') && petitionId.includes('-')) {
      const resolver = serviceClient ?? dbClient.client
      const { data: petition } = await resolver
        .from('petitions')
        .select('id')
        .eq('slug', petitionId)
        .maybeSingle()
      if (petition?.id) resolvedPetitionId = petition.id
    }
    
    let signatureCount = 0
    let goalCount = 10000

    if (serviceClient) {
      // Count all signatures bypassing RLS
      const { count } = await serviceClient
        .from('signatures')
        .select('*', { count: 'exact', head: true })
        .eq('petition_id', resolvedPetitionId)
      signatureCount = count || 0

      const { data: petition } = await serviceClient
        .from('petitions')
        .select('goal_count')
        .eq('id', resolvedPetitionId)
        .maybeSingle()
      if (petition?.goal_count) goalCount = petition.goal_count
    } else if (dbClient.type === 'supabase') {
      // Public (RLS) count - may only count public signatures
      const { count } = await dbClient.client
        .from('signatures')
        .select('*', { count: 'exact', head: true })
        .eq('petition_id', resolvedPetitionId)
      signatureCount = count || 0

      const { data: petition } = await dbClient.client
        .from('petitions')
        .select('goal_count')
        .eq('id', resolvedPetitionId)
        .maybeSingle()
      if (petition?.goal_count) goalCount = petition.goal_count
    } else {
      // Local database
      const { data } = await dbClient.client.countSignatures(resolvedPetitionId)
      signatureCount = data[0]?.count || 0
    }
    
    const progress = Math.min((signatureCount / goalCount) * 100, 100)
    
    return NextResponse.json({
      petitionId: resolvedPetitionId,
      signatureCount,
      goalCount,
      progress: Math.round(progress)
    })
  } catch (error) {
    console.error('Error fetching petition stats:', error)
    // Get petitionId from params even in error case
    let petitionId = 'unknown'
    try {
      const { petitionId: id } = await params
      petitionId = id
    } catch {}
    
    return NextResponse.json(
      { 
        petitionId: petitionId,
        signatureCount: 0,
        goalCount: 10000,
        progress: 0
      },
      { status: 500 }
    )
  }
}
