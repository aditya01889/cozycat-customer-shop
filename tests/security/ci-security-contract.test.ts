import { test, expect } from '@playwright/test'

test.describe('CI Security Contract (CI_DUMMY_ENV)', () => {
  test('should include CSP header on homepage', async ({ request }) => {
    const res = await request.get('/')
    expect(res.ok()).toBeTruthy()

    const csp = res.headers()['content-security-policy']
    expect(csp).toBeTruthy()
    expect(csp).toContain("default-src 'self'")
  })

  test('should allow /api/ci/ping only in CI dummy mode', async ({ request }) => {
    const res = await request.get('/api/ci/ping')
    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.mode).toBe('ci-dummy')
  })

  test('should enforce CSRF on secure action', async ({ request }) => {
    const csrfRes = await request.get('/api/csrf')
    expect(csrfRes.ok()).toBeTruthy()

    const { csrfToken } = await csrfRes.json()
    expect(typeof csrfToken).toBe('string')
    expect(csrfToken.length).toBeGreaterThan(10)

    const missing = await request.post('/api/ci/secure-action', {
      data: { message: 'hello' },
    })
    expect(missing.status()).toBe(403)

    const ok = await request.post('/api/ci/secure-action', {
      data: { message: 'hello' },
      headers: {
        'x-csrf-token': csrfToken,
      },
    })
    expect(ok.ok()).toBeTruthy()
  })

  test('should rate limit secure action', async ({ request }) => {
    const csrfRes = await request.get('/api/csrf')
    const { csrfToken } = await csrfRes.json()

    const headers = { 'x-csrf-token': csrfToken }

    const r1 = await request.post('/api/ci/secure-action', { data: { message: '1' }, headers })
    const r2 = await request.post('/api/ci/secure-action', { data: { message: '2' }, headers })
    const r3 = await request.post('/api/ci/secure-action', { data: { message: '3' }, headers })
    const r4 = await request.post('/api/ci/secure-action', { data: { message: '4' }, headers })

    expect(r1.status()).toBe(200)
    expect(r2.status()).toBe(200)
    expect(r3.status()).toBe(200)
    expect(r4.status()).toBe(429)
  })

  test('should enforce admin auth contract (CI dummy headers)', async ({ request }) => {
    const unauth = await request.get('/api/ci/admin-only')
    expect(unauth.status()).toBe(401)

    const user = await request.get('/api/ci/admin-only', {
      headers: {
        'x-ci-user': 'user',
      },
    })
    expect(user.status()).toBe(403)

    const admin = await request.get('/api/ci/admin-only', {
      headers: {
        'x-ci-user': 'admin',
      },
    })
    expect(admin.status()).toBe(200)
  })
})
