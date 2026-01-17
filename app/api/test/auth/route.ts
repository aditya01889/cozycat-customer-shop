import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ 
        error: 'No user found',
        step: 'auth.getUser()'
      }, { status: 401 })
    }

    // Just return user info without database calls
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: (error as any).message 
    }, { status: 500 })
  }
}
