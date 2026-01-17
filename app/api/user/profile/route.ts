import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: cookieUser } } = await supabase.auth.getUser()

    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null

    const authedSupabase = bearerToken
      ? createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${bearerToken}`,
              },
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          }
        )
      : null

    const { data: { user: bearerUser } } = authedSupabase
      ? await authedSupabase.auth.getUser()
      : { data: { user: null } }

    const user = cookieUser ?? bearerUser
    const supabaseForWrite = cookieUser ? supabase : authedSupabase

    if (!user || !supabaseForWrite) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, phone } = await request.json()

    let authUpdateWarning: string | null = null
    const { error: updateError } = await supabaseForWrite.auth.updateUser({
      data: {
        name,
        phone
      }
    })

    if (updateError) {
      console.error('Auth metadata update error:', updateError)
      authUpdateWarning = updateError.message
    }

    // Update profile in database
    const { error: profileError } = await (supabaseForWrite as any)
      .from('profiles')
      .update({
        full_name: name,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile database update error:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      ...(authUpdateWarning ? { warning: authUpdateWarning } : {}),
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
