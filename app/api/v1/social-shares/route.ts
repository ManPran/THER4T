import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, entityType, entityId } = body

    const dbClient = await getDatabaseClient()
    console.log(`Using ${dbClient.type} database for social shares`)

    let data: any
    let error: any

    if (dbClient.type === 'supabase') {
      const result = await dbClient.client
        .from('social_shares')
        .insert({
          platform,
          entity_type: entityType,
          entity_id: entityId,
          created_at: new Date().toISOString()
        })
        .select()
      
      data = result.data
      error = result.error
    } else {
      // Local database
      const result = await dbClient.client.insertSocialShare({
        platform,
        entity_type: entityType,
        entity_id: entityId
      })
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating social share:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create social share' },
      { status: 500 }
    )
  }
}
