import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabaseClient, getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL

    let client: any
    let clientUsed = 'service'
    try {
      client = getServiceSupabaseClient()
    } catch {
      client = getSupabaseClient()
      clientUsed = 'anon'
    }

    const { data, error } = await client
      .from('petitions')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle()

    return NextResponse.json({ clientUsed, hasServiceKey, hasUrl, exists: !!data, id: data?.id || null, error: error?.message || null })
  } catch (e) {
    return NextResponse.json({ error: (e as any)?.message || String(e) })
  }
}
