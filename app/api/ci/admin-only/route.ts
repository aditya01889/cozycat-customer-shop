import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthContext } from '@/lib/auth/auth-middleware'

async function handler(_req: NextRequest, _ctx: AuthContext) {
  const isCiDummy = process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true'

  if (!isCiDummy) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}

export const GET = withAdminAuth(handler)
