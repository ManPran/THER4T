import { createClient } from '@supabase/supabase-js'
import { localDb } from './local-db'

// Function to get Supabase client dynamically
export function getSupabaseClient() {
  console.log('=== GETTING SUPABASE CLIENT ===')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Environment variables:')
  console.log('URL:', supabaseUrl ? `✅ ${supabaseUrl.substring(0, 20)}...` : '❌ Missing')
  console.log('Key:', supabaseAnonKey ? `✅ ${supabaseAnonKey.substring(0, 20)}...` : '❌ Missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }

  console.log('✅ Creating Supabase client with URL:', supabaseUrl)
  // Use minimal configuration
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side client using the service role key (bypasses RLS). NEVER expose this to the client.
export function getServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

// Function to get database client with fallback
export async function getDatabaseClient() {
  try {
    // Try to create Supabase client
    const supabase = getSupabaseClient()
    
    // Test the connection with a timeout
    const connectionTest = Promise.race([
      supabase.from('petitions').select('id').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ])
    
    await connectionTest
    
    // If we get here, Supabase is working
    return {
      client: supabase,
      type: 'supabase' as const,
      testConnection: async () => true
    }
  } catch {
    // Fallback to local database
    console.log('Supabase connection failed, using local database fallback')
    return {
      client: localDb,
      type: 'local' as const,
      testConnection: async () => true
    }
  }
}

// Legacy export for backward compatibility (but this won't work in API routes)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Database types based on your schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          role: 'ADMIN' | 'EDITOR' | 'MODERATOR' | 'USER'
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string | null
          role?: 'ADMIN' | 'EDITOR' | 'MODERATOR' | 'USER'
          display_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string | null
          role?: 'ADMIN' | 'EDITOR' | 'MODERATOR' | 'USER'
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          provider: string
          provider_id: string
          bill_number: string
          chamber: string
          session: string
          title: string
          summary: string
          status: string
          last_action: string
          last_action_date: string
          sponsors: any
          subjects: string[]
          versions: any
          roll_calls: any | null
          is_primary_petition: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          provider_id: string
          bill_number: string
          chamber: string
          session: string
          title: string
          summary: string
          status: string
          last_action: string
          last_action_date: string
          sponsors: any
          subjects: string[]
          versions: any
          roll_calls?: any | null
          is_primary_petition?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          provider_id?: string
          bill_number?: string
          chamber?: string
          session?: string
          title?: string
          summary?: string
          status?: string
          last_action?: string
          last_action_date?: string
          sponsors?: any
          subjects?: string[]
          versions?: any
          roll_calls?: any | null
          is_primary_petition?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      petitions: {
        Row: {
          id: string
          bill_id: string | null
          slug: string
          title: string
          description_md: string
          blurb: string
          category: string
          goal_count: number
          is_main: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bill_id?: string | null
          slug: string
          title: string
          description_md: string
          blurb: string
          category: string
          goal_count: number
          is_main?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bill_id?: string | null
          slug?: string
          title?: string
          description_md?: string
          blurb?: string
          category?: string
          goal_count?: number
          is_main?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      signatures: {
        Row: {
          id: string
          petition_id: string
          user_id: string | null
          name: string
          email_hash: string
          zip_code: string
          display_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          petition_id: string
          user_id?: string | null
          name: string
          email_hash: string
          zip_code: string
          display_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          petition_id?: string
          user_id?: string | null
          name?: string
          email_hash?: string
          zip_code?: string
          display_public?: boolean
          created_at?: string
        }
      }
      social_shares: {
        Row: {
          id: string
          platform: string
          entity_type: string
          entity_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          platform: string
          entity_type: string
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          platform?: string
          entity_type?: string
          entity_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          user_id: string | null
          title: string
          content_md: string
          category: string
          is_approved: boolean
          moderator_id: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          content_md: string
          category: string
          is_approved?: boolean
          moderator_id?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          content_md?: string
          category?: string
          is_approved?: boolean
          moderator_id?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
