import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-side Supabase client with service role key (full access)
// Used for file storage, database queries, etc. - NOT for OTP anymore
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * OTP is now handled by custom system in @/lib/otp
 * - Uses email instead of SMS (100% FREE!)
 * - Stores OTPs in database with bcrypt hashing
 * - No more paid SMS providers needed!
 */
