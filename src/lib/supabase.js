import { createClient } from '@supabase/supabase-js'

// Updated Supabase project configuration
const SUPABASE_URL = 'https://xealptkblcrvdmiyxqui.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlYWxwdGtibGNydmRtaXl4cXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzEyMTcsImV4cCI6MjA2NzA0NzIxN30.x_n0I0d6hDXzsRVFgr-B71Kr71Ub4kEuiW9Rp4msMLs'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase