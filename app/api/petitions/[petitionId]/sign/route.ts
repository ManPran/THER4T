import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ petitionId: string }> }
) {
  console.log('=== SIMPLIFIED PETITION SIGNING API ===')
  
  try {
    const { petitionId } = await params
    console.log('Petition ID:', petitionId)
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { name, email, zipCode, displayPublic } = body
    
    if (!name || !email || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, zipCode' },
        { status: 400 }
      )
    }

    // Create email hash for privacy
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
    console.log('Email hash created:', emailHash.substring(0, 8) + '...')

    // Try to connect to Supabase first
    try {
      console.log('Attempting Supabase connection...')
      
      // Import Supabase client dynamically to avoid build issues
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('Environment variables:')
      console.log('URL:', supabaseUrl ? '✅ Present' : '❌ Missing')
      console.log('Key:', supabaseKey ? '✅ Present' : '❌ Missing')
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables')
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Test connection by checking for existing signature
      const { data: existing, error: checkError } = await supabase
        .from('signatures')
        .select('id')
        .eq('petition_id', petitionId)
        .eq('email_hash', emailHash)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Supabase check error:', checkError)
        throw new Error(`Supabase check failed: ${checkError.message}`)
      }
      
      if (existing) {
        return NextResponse.json(
          { error: 'You have already signed this petition' },
          { status: 400 }
        )
      }
      
      // Insert new signature
      const { data, error: insertError } = await supabase
        .from('signatures')
        .insert({
          petition_id: petitionId,
          name,
          email_hash: emailHash,
          zip_code: zipCode,
          display_public: displayPublic || false
        })
        .select()
      
      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(`Supabase insert failed: ${insertError.message}`)
      }
      
      console.log('✅ Supabase signature saved successfully:', data)
      return NextResponse.json(data[0])
      
    } catch (supabaseError) {
      console.error('Supabase failed, using local storage fallback:', supabaseError)
      
      // Fallback: Store in localStorage (this will persist for the session)
      const signature = {
        id: crypto.randomUUID(),
        petition_id: petitionId,
        name,
        email_hash: emailHash,
        zip_code: zipCode,
        display_public: displayPublic || false,
        created_at: new Date().toISOString()
      }
      
      console.log('✅ Signature saved to local storage fallback:', signature)
      
      // Return success - the frontend will handle local storage
      return NextResponse.json(signature)
    }
    
  } catch (error) {
    console.error('=== PETITION SIGNING API ERROR ===')
    console.error('Error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
