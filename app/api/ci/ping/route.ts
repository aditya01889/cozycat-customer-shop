import { NextResponse } from 'next/server'

export async function GET() {
  const isCiDummy = process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true'

  if (!isCiDummy) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, mode: 'ci-dummy' })
}
