import { test, expect } from '@playwright/test'

test.describe('Critical API Tests', () => {
  let baseUrl: string

  test.beforeAll(async () => {
    baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
  })

  test('should fetch all products', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/products/all`)
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('should fetch products by category', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/products/all?category=meals`)
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('should handle search functionality', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/products/all?search=cat`)
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
  })

  test('should validate invalid product ID', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/products/all?id=invalid-uuid`)
    
    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('success', false)
  })

  test('should fetch all ingredients', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/ingredients`)
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('should return 200 for homepage', async ({ request }) => {
    const response = await request.get(`${baseUrl}/`)
    expect(response.status()).toBe(200)
  })

  test('should handle 404 for non-existent routes', async ({ request }) => {
    const response = await request.get(`${baseUrl}/non-existent-route`)
    expect(response.status()).toBe(404)
  })

  test('should handle malformed requests gracefully', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/products/all?limit=invalid`)
    
    // Should not crash the server
    expect([200, 400]).toContain(response.status())
  })
})
