/**
 * @jest-environment node
 */
import { POST, GET } from './route'
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
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset env for each test
        process.env = { ...originalEnv }
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
    })
})
