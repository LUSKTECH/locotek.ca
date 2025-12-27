/**
 * @jest-environment node
 */
import { POST, GET } from './route'
import { NextRequest } from 'next/server'

// Mock Resend
jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: {
            send: jest.fn().mockResolvedValue({ id: 'test-id' }),
        },
    })),
}))

// Mock Vercel KV
jest.mock('@vercel/kv', () => ({
    kv: {
        zadd: jest.fn().mockResolvedValue(1),
    },
}))

describe('Presskit API Route', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
    })
})
