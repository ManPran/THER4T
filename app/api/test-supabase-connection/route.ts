import { NextResponse } from 'next/server'
import { getDatabaseClient } from '@/lib/supabase'

// COMPLETELY REWRITTEN ROUTE TO FORCE ENVIRONMENT VARIABLE RELOAD
export async function GET() {
  try {
    console.log('=== FORCED REDEPLOY - TESTING SUPABASE CONNECTION ===')
    
    // Force environment variable check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment variables loaded:')
    console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing')
    console.log('Key:', supabaseKey ? '✅ Loaded' : '❌ Missing')
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Environment variables not loaded',
        url: supabaseUrl ? 'present' : 'missing',
        key: supabaseKey ? 'present' : 'missing',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    const dbClient = await getDatabaseClient()
    console.log(`Database client type: ${dbClient.type}`)
    
    if (dbClient.type === 'supabase') {
      console.log('Testing Supabase connection...')
      // Test Supabase connection
      const { data, error } = await dbClient.client
        .from('petitions')
        .select('id')
        .limit(1)
      
      if (error) {
        console.error('Supabase connection error:', error)
        return NextResponse.json({
          status: 'error',
          message: 'Supabase connection failed',
          error: error.message,
          timestamp: new Date().toISOString()
        }, { status: 500 })
      }
      
      console.log('Supabase connection successful:', data)
      return NextResponse.json({
        status: 'success',
        message: 'Supabase connection working',
        data: data,
        timestamp: new Date().toISOString()
      })
    } else {
      // Using local database
      return NextResponse.json({
        status: 'fallback',
        message: 'Using local database fallback',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Test route error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Test route failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
