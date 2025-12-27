import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PressKitModal from './PressKitModal'

// Mock fetch
global.fetch = jest.fn()

describe('PressKitModal', () => {
    const mockOnClose = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders nothing when closed', () => {
        const { container } = render(
            <PressKitModal isOpen={false} onClose={mockOnClose} />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders modal when open', () => {
        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        expect(screen.getByText('Download Press Kit')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
    })

    it('closes when clicking overlay', () => {
        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const overlay = screen.getByText('Download Press Kit').parentElement?.parentElement
        fireEvent.click(overlay!)
        
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes when clicking close button', () => {
        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const closeButton = screen.getByRole('button', { name: '×' })
        fireEvent.click(closeButton)
        
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not close when clicking modal content', () => {
        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const modal = screen.getByText('Download Press Kit').parentElement
        fireEvent.click(modal!)
        
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('submits email and triggers download on success', async () => {
        const user = userEvent.setup()
        
        // Mock successful response
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, downloadUrl: '/uploads/PressKit.zip' }),
        })

        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const emailInput = screen.getByPlaceholderText('your@email.com')
        const submitButton = screen.getByRole('button', { name: 'Download' })

        await user.type(emailInput, 'test@example.com')
        await user.click(submitButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/presskit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com' }),
            })
        })

        await waitFor(() => {
            expect(screen.getByText('Thanks! Your download should start automatically.')).toBeInTheDocument()
        })
    })

    it('shows error message when API returns error', async () => {
        const user = userEvent.setup()
        
        // Mock error response from API (valid email but API rejects)
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Email already registered' }),
        })

        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const emailInput = screen.getByPlaceholderText('your@email.com')
        const submitButton = screen.getByRole('button', { name: 'Download' })

        await user.type(emailInput, 'test@example.com')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Email already registered')).toBeInTheDocument()
        })
    })

    it('shows loading state during submission', async () => {
        // Mock a slow response that never resolves during the test
        let resolvePromise: (value: unknown) => void
        ;(global.fetch as jest.Mock).mockImplementation(
            () => new Promise((resolve) => {
                resolvePromise = resolve
            })
        )

        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const emailInput = screen.getByPlaceholderText('your@email.com')
        const submitButton = screen.getByRole('button', { name: 'Download' })

        // Type email
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        
        // Submit form
        await act(async () => {
            fireEvent.submit(submitButton.closest('form')!)
        })

        // Check loading state
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument()
        expect(emailInput).toBeDisabled()

        // Cleanup - resolve the promise
        await act(async () => {
            resolvePromise!({
                ok: true,
                json: async () => ({ success: true }),
            })
        })
    })

    it('handles network errors gracefully', async () => {
        const user = userEvent.setup()
        
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const emailInput = screen.getByPlaceholderText('your@email.com')
        const submitButton = screen.getByRole('button', { name: 'Download' })

        await user.type(emailInput, 'test@example.com')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument()
        })
    })

    it('updates email input value', async () => {
        const user = userEvent.setup()
        
        render(<PressKitModal isOpen={true} onClose={mockOnClose} />)
        
        const emailInput = screen.getByPlaceholderText('your@email.com')
        
        await user.type(emailInput, 'hello@world.com')
        
        expect(emailInput).toHaveValue('hello@world.com')
    })
})
