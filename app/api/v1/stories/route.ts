import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const dbClient = await getDatabaseClient()
    console.log(`Using ${dbClient.type} database for stories`)

    let data: any
    let error: any

    if (dbClient.type === 'supabase') {
      const result = await dbClient.client
        .from('stories')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      
      data = result.data
      error = result.error
    } else {
      // Local database fallback
      data = []
      error = null
    }

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform Supabase data to match frontend interface
    const transformedStories = (data || []).map((story: any) => ({
      id: story.id,
      name: story.name || 'Anonymous',
      location: story.location || 'Texas',
      role: story.role || 'community',
      issue: story.issue || 'general',
      title: story.title,
      story: story.story,
      consent: story.consent || true,
      createdAt: story.created_at,
      isApproved: story.is_approved,
    }))

    return NextResponse.json(transformedStories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location, role, issue, title, story, consent } = body

    if (!consent) {
      return NextResponse.json(
        { error: 'Consent is required to submit a story' },
        { status: 400 }
      )
    }

    const dbClient = await getDatabaseClient()
    console.log(`Using ${dbClient.type} database for stories`)

    let data: any
    let error: any

    if (dbClient.type === 'supabase') {
      // Map frontend fields to Supabase table structure
      const storyData = {
        name: name || 'Anonymous',
        location: location || 'Texas',
        role: role || 'community',
        issue: issue || 'general',
        title: title || 'Untitled Story',
        story: story || '',
        consent: consent || false,
        is_approved: true, // Auto-approve for now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const result = await dbClient.client
        .from('stories')
        .insert(storyData)
        .select()
      
      data = result.data
      error = result.error
    } else {
      // Local database fallback
      data = []
      error = null
    }

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      story: data?.[0],
      message: 'Story submitted successfully!'
    })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}
