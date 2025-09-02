import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseClient, getServiceSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ petitionId: string }> }
) {
  try {
    let serviceClient: any | null = null
    try { serviceClient = getServiceSupabaseClient() } catch { serviceClient = null }

    const dbClient = await getDatabaseClient()
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '5'
    const { petitionId } = await params

    let resolvedPetitionId = petitionId
    let resolverUsed = 'none'

    try {
      if ((serviceClient || dbClient.type === 'supabase') && petitionId.includes('-')) {
        const resolver = serviceClient ?? dbClient.client
        resolverUsed = serviceClient ? 'service' : 'anon'
        const { data: petition } = await resolver
          .from('petitions')
          .select('id')
          .eq('slug', petitionId)
          .maybeSingle()
        if (petition?.id) resolvedPetitionId = petition.id
      }
    } catch (e) {
      console.error('Slug resolution failed:', e)
    }

    let signatures: any[] = []
    let clientUsed = 'local'

    try {
      const client = serviceClient ?? (dbClient.type === 'supabase' ? dbClient.client : null)
      if (client) {
        clientUsed = serviceClient ? 'service' : 'anon'
        const { data, error } = await client
          .from('signatures')
          .select('id,name,zip_code,display_public,created_at')
          .eq('petition_id', resolvedPetitionId)
          .eq('display_public', true)
          .order('created_at', { ascending: false })
          .limit(parseInt(limit))
        if (error) throw error
        signatures = data || []
      } else {
        const { data } = await dbClient.client.selectSignatures({ petition_id: resolvedPetitionId })
        signatures = data
          .filter(s => s.display_public)
          .sort((a, b) => new Date(b.signed_at).getTime() - new Date(a.signed_at).getTime())
          .slice(0, parseInt(limit))
          .map(s => ({ id: s.id, name: s.name, zip_code: s.zip_code, display_public: s.display_public, created_at: s.signed_at }))
      }
      return NextResponse.json({ signatures, debug: { clientUsed, resolverUsed, resolvedPetitionId } })
    } catch (error) {
      console.error('Error fetching recent signatures:', error)
      return NextResponse.json({ signatures: [], debug: { clientUsed, resolverUsed, resolvedPetitionId, error: (error as any)?.message || String(error) } })
    }
  } catch (outerError) {
    console.error('Route failure:', outerError)
    return NextResponse.json({ signatures: [], debug: { routeError: (outerError as any)?.message || String(outerError) } })
  }
}
