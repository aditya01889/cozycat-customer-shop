import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('🔍 Starting full auth debug...')
    
    const supabase = await createClient()
    
    // Step 1: Check if we can get the user
    console.log('📋 Step 1: Getting user...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('👤 User result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      userError: userError?.message 
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'No user found',
        details: userError?.message,
        step: 'auth.getUser()'
      }, { status: 401 })
    }

    // Step 2: Try to get session
    console.log('📋 Step 2: Getting session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔐 Session result:', { 
      hasSession: !!session, 
      sessionId: session?.user?.id,
      sessionError: sessionError?.message 
    })

    // Step 3: Check profile directly
    console.log('📋 Step 3: Getting profile...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('👔 Profile result:', { 
      hasProfile: !!profile, 
      profileRole: (profile as any)?.role,
      profileError: profileError?.message 
    })

    // Step 4: Test if we can update profile (the actual operation failing)
    console.log('📋 Step 4: Testing profile update...')
    const { data: testUpdate, error: updateError } = await supabase
      .from('profiles')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()

    console.log('✏️ Update test result:', {
      success: !updateError,
      error: updateError?.message,
      details: updateError
    })

    return NextResponse.json({
      success: true,
      auth: {
        user: {
          id: user.id,
          email: user.email
        },
        session: {
          hasSession: !!session
        }
      },
      profile: {
        exists: !!profile,
        role: (profile as any)?.role,
        data: profile
      },
      permissions: {
        canUpdateProfile: !updateError,
        updateError: updateError?.message
      },
      debug: {
        userError: userError?.message,
        sessionError: sessionError?.message,
        profileError: profileError?.message,
        updateError: updateError?.message
      }
    })
  } catch (error) {
    console.error('💥 Full auth debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: (error as any).message 
    }, { status: 500 })
  }
}
