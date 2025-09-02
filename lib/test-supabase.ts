import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection by trying to get a count
    const { count, error } = await supabase
      .from('social_shares')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase connection failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Current social shares count:', count || 0)
    return true
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
    return false
  }
}
