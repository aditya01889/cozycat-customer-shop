import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { createRateLimiter } from '@/lib/middleware/rate-limiter'

const schema = z.object({
  message: z.string().min(1).max(200),
})

const ciLimiter = createRateLimiter(60 * 1000, 3)

export const POST = createSecureHandler({
  schema,
  rateLimiter: ciLimiter,
  requireCSRF: true,
  preCheck: async (req: NextRequest) => {
    const isCiDummy = process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true'
    if (!isCiDummy) {
      return { allowed: false, error: 'Not allowed' }
    }
    return { allowed: true }
  },
  handler: async (_req: NextRequest, data: z.infer<typeof schema>) => {
    return NextResponse.json({ ok: true, echoed: data.message })
  },
})
