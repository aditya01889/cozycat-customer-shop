import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('🔍 Session debug - Starting...')
    
    // Test 1: Create client and check environment
    const supabase = await createClient()
    console.log('📋 Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
    })

    // Test 2: Try to get session directly
    console.log('📋 Getting session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔐 Session result:', {
      hasSession: !!session,
      sessionId: session?.user?.id,
      sessionEmail: session?.user?.email,
      sessionError: sessionError?.message
    })

    // Test 3: Try to get user from session
    if (session?.user) {
      console.log('👤 Getting user from session...')
      const { data: user, error: userError } = await supabase.auth.getUser(session.user.id)
      
      console.log('👤 User result:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userError: userError?.message
      })
    }

    // Test 4: Check cookies manually
    const cookieStore = await require('next/headers').cookies()
    const allCookies = cookieStore.getAll()
    console.log('🍪 All cookies:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) })))

    return NextResponse.json({
      success: true,
      session: {
        exists: !!session,
        id: session?.user?.id,
        email: session?.user?.email
      },
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email
      },
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name)
      },
      errors: {
        session: sessionError?.message,
        user: userError?.message
      }
    })
  } catch (error) {
    console.error('💥 Session debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: (error as any).message 
    }, { status: 500 })
  }
}
