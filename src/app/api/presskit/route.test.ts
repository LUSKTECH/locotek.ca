/**
 * @jest-environment node
 */
import { POST, GET } from './route'
import { NextRequest } from 'next/server'
import { promises as fs } from 'fs'

// Mock fs
jest.mock('fs', () => ({
    promises: {
        access: jest.fn(),
        mkdir: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn(),
    },
}))

const mockFs = fs as jest.Mocked<typeof fs>

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
                body: JSON.stringify({ email: 'invalid-email' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid email format')
        })

        it('saves valid email and returns success', async () => {
            mockFs.access.mockRejectedValueOnce(new Error('Not found'))
            mockFs.mkdir.mockResolvedValueOnce(undefined)
            mockFs.readFile.mockRejectedValueOnce(new Error('Not found'))
            mockFs.writeFile.mockResolvedValueOnce(undefined)

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
            expect(mockFs.writeFile).toHaveBeenCalled()
        })

        it('appends to existing emails', async () => {
            const existingEmails = [
                { email: 'existing@example.com', timestamp: '2024-01-01T00:00:00.000Z' }
            ]
            
            mockFs.access.mockResolvedValueOnce(undefined)
            mockFs.readFile.mockResolvedValueOnce(JSON.stringify(existingEmails))
            mockFs.writeFile.mockResolvedValueOnce(undefined)

            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'new@example.com' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            
            // Verify writeFile was called with both emails
            const writeCall = mockFs.writeFile.mock.calls[0]
            const writtenData = JSON.parse(writeCall[1] as string)
            expect(writtenData).toHaveLength(2)
            expect(writtenData[0].email).toBe('existing@example.com')
            expect(writtenData[1].email).toBe('new@example.com')
        })

        it('normalizes email to lowercase', async () => {
            mockFs.access.mockResolvedValueOnce(undefined)
            mockFs.readFile.mockRejectedValueOnce(new Error('Not found'))
            mockFs.writeFile.mockResolvedValueOnce(undefined)

            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'TEST@EXAMPLE.COM' }),
            })

            await POST(request)

            const writeCall = mockFs.writeFile.mock.calls[0]
            const writtenData = JSON.parse(writeCall[1] as string)
            expect(writtenData[0].email).toBe('test@example.com')
        })

        it('handles file system errors gracefully', async () => {
            mockFs.access.mockRejectedValueOnce(new Error('Not found'))
            mockFs.mkdir.mockRejectedValueOnce(new Error('Permission denied'))

            const request = new NextRequest('http://localhost/api/presskit', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to process request')
        })
    })
})
