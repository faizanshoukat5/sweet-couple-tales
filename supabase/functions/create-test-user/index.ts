import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { email, password, userId } = await req.json()

    let data, error

    if (userId) {
      // Update existing user's password
      console.log(`Updating password for user: ${userId}`)
      const result = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
      data = result.data
      error = result.error
    } else {
      // Create new user
      console.log(`Creating test user: ${email}`)
      const result = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Error creating user:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('User created successfully:', data.user?.id)

    return new Response(JSON.stringify({ success: true, user: data.user }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
