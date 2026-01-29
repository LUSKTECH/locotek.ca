/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Store original env
const originalEnv = process.env

// Mock Resend
const mockSend = jest.fn().mockResolvedValue({ id: 'test-id' })
jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: {
            send: mockSend,
        },
    })),
}))

// Mock Upstash Redis
const mockZadd = jest.fn().mockResolvedValue(1)
jest.mock('@upstash/redis', () => ({
    Redis: jest.fn().mockImplementation(() => ({
        zadd: mockZadd,
    })),
}))

describe('Presskit API Route', () => {
    // Import dynamically to allow env manipulation
    let POST: typeof import('./route').POST
    let GET: typeof import('./route').GET

    beforeEach(async () => {
        jest.clearAllMocks()
        jest.resetModules()
        // Reset env for each test
        process.env = { ...originalEnv }
        // Re-import to get fresh module with current env
        const routeModule = await import('./route')
        POST = routeModule.POST
        GET = routeModule.GET
    })

    afterAll(() => {
        process.env = originalEnv
    })

    describe('GET', () => {
        it('returns status ok', async () => {
            const response = await GET()
            const data = await response.json()
            
            expect(data).toEqual({ status: 'ok' })
        })
    })

    describe('POST', () => {
        it('returns error when email is missing', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({}),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email is required')
        })

        it('returns error for invalid email format', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'invalid-email-no-at-sign' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid email format')
        })

        it('returns success for valid email', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: {
                    'user-agent': 'Test Browser',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.downloadUrl).toBe('/uploads/PressKit.zip')
        })

        it('normalizes email to lowercase', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'TEST@EXAMPLE.COM' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
        })

        it('rejects emails that are too long', async () => {
            const longEmail = 'a'.repeat(250) + '@test.com'
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: longEmail }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid email format')
        })

        it('rejects emails without dot', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid email format')
        })

        it('rejects non-string email', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 12345 }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email is required')
        })

        it('handles malformed JSON gracefully', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: 'not valid json',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to process request')
        })

        it('saves to Redis when configured', async () => {
            process.env.KV_REST_API_URL = 'https://test.upstash.io'
            process.env.KV_REST_API_TOKEN = 'test-token'
            
            // Re-import with new env
            jest.resetModules()
            const { POST: ConfiguredPOST } = await import('./route')

            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
            })

            const response = await ConfiguredPOST(request)
            expect(response.status).toBe(200)
            expect(mockZadd).toHaveBeenCalled()
        })

        it('sends email notification when configured', async () => {
            process.env.RESEND_API_KEY = 'test-api-key'
            process.env.NOTIFICATION_EMAIL = 'notify@example.com'
            
            // Re-import with new env
            jest.resetModules()
            const { POST: ConfiguredPOST } = await import('./route')

            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: {
                    'x-vercel-ip-city': 'Toronto',
                    'x-vercel-ip-country': 'CA',
                },
            })

            const response = await ConfiguredPOST(request)
            expect(response.status).toBe(200)
            expect(mockSend).toHaveBeenCalled()
        })

        it('handles Redis errors gracefully', async () => {
            process.env.KV_REST_API_URL = 'https://test.upstash.io'
            process.env.KV_REST_API_TOKEN = 'test-token'
            mockZadd.mockRejectedValueOnce(new Error('Redis connection failed'))
            
            jest.resetModules()
            const { POST: ConfiguredPOST } = await import('./route')

            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
            })

            // Should still succeed even if Redis fails
            const response = await ConfiguredPOST(request)
            expect(response.status).toBe(200)
        })

        it('handles email send errors gracefully', async () => {
            process.env.RESEND_API_KEY = 'test-api-key'
            process.env.NOTIFICATION_EMAIL = 'notify@example.com'
            mockSend.mockRejectedValueOnce(new Error('Email send failed'))
            
            jest.resetModules()
            const { POST: ConfiguredPOST } = await import('./route')

            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
            })

            // Should still succeed even if email fails
            const response = await ConfiguredPOST(request)
            expect(response.status).toBe(200)
        })

        it('extracts headers correctly', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: {
                    'user-agent': 'Mozilla/5.0',
                    'x-forwarded-for': '192.168.1.1, 10.0.0.1',
                    'referer': 'https://locotek.ca',
                    'accept-language': 'en-US,en;q=0.9',
                    'x-vercel-ip-country': 'CA',
                    'x-vercel-ip-city': 'Toronto',
                },
            })

            const response = await POST(request)
            expect(response.status).toBe(200)
        })

        it('handles x-real-ip header when x-forwarded-for is missing', async () => {
            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: {
                    'x-real-ip': '192.168.1.100',
                },
            })

            const response = await POST(request)
            expect(response.status).toBe(200)
        })
    })
})
