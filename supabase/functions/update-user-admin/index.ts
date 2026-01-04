import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

interface UserUpdateData {
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Verify the user is authenticated - validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization header format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix safely
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }


    // Check if the user is an admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      throw new Error('Insufficient permissions')
    }

    // Get the request body
    const { user_id, first_name, last_name, email, role } = await req.json()

    // Validate required fields
    if (!user_id) {
      throw new Error('User ID is required')
    }

    // Prevent admin from changing their own role to user
    if (user_id === user.id && role === 'user') {
      throw new Error('Cannot change your own role from admin to user')
    }

    // Update user email in auth if provided
    if (email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { email }
      )

      if (emailError) {
        throw new Error(`Failed to update email: ${emailError.message}`)
      }
    }

    // Update user profile in the public users table
    const updateData: UserUpdateData = {
      updated_at: new Date().toISOString(),
    }

    if (first_name) updateData.first_name = first_name
    if (last_name) updateData.last_name = last_name
    if (email) updateData.email = email
    if (role) updateData.role = role

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`)
    }

    // Log the activity
    console.log(`User updated: ${user_id} by admin ${user.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        user: updatedUser,
        message: 'User updated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating user:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})