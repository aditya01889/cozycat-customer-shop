import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { profileId, full_name, email, phone } = await request.json()

    console.log('API: Updating profile', { profileId, full_name, email, phone })

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    const { error, data } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        email,
        phone
      })
      .eq('id', profileId)
      .select()

    if (error) {
      console.error('API: Profile update error', error)
      return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
    }

    console.log('API: Profile updated successfully', data)
    return NextResponse.json({ data, message: 'Profile updated successfully' })

  } catch (error: any) {
    console.error('API: Unexpected error', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
