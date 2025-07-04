import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const SUPABASE_URL = 'https://armobxruxzsghbmgxffs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybW9ieHJ1eHpzZ2hibWd4ZmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTc4OTksImV4cCI6MjA2NjQzMzg5OX0.UXflif6dwc_7nriILIxJ94cuWExf0ThAiVMIawaQueE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase