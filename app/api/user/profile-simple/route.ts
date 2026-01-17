import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No user' }, { status: 401 })
    }

    const { name, phone } = await request.json()
    
    console.log('Profile update attempt:', {
      userId: user.id,
      userEmail: user.email,
      name,
      phone
    })

    // Only update auth metadata for now (skip database profile)
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        name,
        phone
      }
    })

    if (updateError) {
      console.error('Auth update error:', updateError)
      return NextResponse.json({ error: 'Failed to update auth metadata', details: updateError }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Auth metadata updated successfully',
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (err: any) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 })
  }
}
