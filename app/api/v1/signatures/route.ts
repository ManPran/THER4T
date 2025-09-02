import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get Supabase client dynamically
    const supabase = getSupabaseClient()
    
    const body = await request.json()
    
    // Hash email for privacy (simple hash for demo - use crypto in production)
    const emailHash = Buffer.from(body.email).toString('base64')
    
    // Check if user already signed this petition
    const { data: existingSignature, error: checkError } = await supabase
      .from('signatures')
      .select('id')
      .eq('petition_id', body.petitionId)
      .eq('email_hash', emailHash)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing signature:', checkError)
      throw new Error(`Database error: ${checkError.message}`)
    }
    
    if (existingSignature) {
      return NextResponse.json(
        { message: 'You have already signed this petition' },
        { status: 400 }
      )
    }
    
    // Insert signature into Supabase
    const { data, error } = await supabase
      .from('signatures')
      .insert({
        petition_id: body.petitionId,
        user_id: body.userId,
        name: body.name,
        email_hash: emailHash,
        zip_code: body.zipCode,
        display_public: body.displayPublic || false,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error signing petition:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
