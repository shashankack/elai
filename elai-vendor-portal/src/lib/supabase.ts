import { createClient } from '@supabase/supabase-js'

// We use the service role key for the backend to bypass RLS when interacting from trusted API routes
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
