import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getServiceSupabaseClient, getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('=== HB 1481 PETITION SIGNING API ===')
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { name, email, zipCode, displayPublic } = body
    
    if (!name || !email || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, zipCode' },
        { status: 400 }
      )
    }

    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
    console.log('Email hash created:', emailHash.substring(0, 8) + '...')

    // Prefer service client (bypasses RLS) for reliable inserts
    let client: any
    try {
      client = getServiceSupabaseClient()
      console.log('Using service role client for insert')
    } catch {
      client = getSupabaseClient()
      console.log('Service role not available, using anon client')
    }

    // Resolve slug -> petition id
    const { data: petition, error: petitionErr } = await client
      .from('petitions')
      .select('id')
      .eq('slug', 'hb1481-device-restrictions')
      .maybeSingle()

    if (petitionErr || !petition?.id) {
      console.error('Error finding petition:', petitionErr)
      throw new Error('Petition not found in database')
    }

    const petitionId = petition.id as string

    // Check duplicate
    const { data: existing, error: checkError } = await client
      .from('signatures')
      .select('id')
      .eq('petition_id', petitionId)
      .eq('email_hash', emailHash)
      .maybeSingle()

    if (!checkError && existing) {
      return NextResponse.json(
        { error: 'You have already signed this petition' },
        { status: 400 }
      )
    }

    // Insert
    const { data, error: insertError } = await client
      .from('signatures')
      .insert({
        petition_id: petitionId,
        name,
        email_hash: emailHash,
        zip_code: zipCode,
        display_public: !!displayPublic
      })
      .select()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      throw new Error(`Supabase insert failed: ${insertError.message}`)
    }

    console.log('✅ Supabase signature saved successfully:', data)
    return NextResponse.json(data?.[0])
  } catch (error) {
    console.error('=== PETITION SIGNING API ERROR ===')
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
