import { render, screen, fireEvent } from '@testing-library/react'
import PressKitButton from './PressKitButton'

// Mock the modal component
jest.mock('./PressKitModal', () => {
    return function MockPressKitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
        if (!isOpen) return null
        return (
            <div data-testid="presskit-modal">
                <button onClick={onClose}>Close</button>
            </div>
        )
    }
})

describe('PressKitButton', () => {
    it('renders the button with correct text', () => {
        render(<PressKitButton />)
        
        expect(screen.getByText('Press Kit')).toBeInTheDocument()
    })

    it('opens modal when clicked', () => {
        render(<PressKitButton />)
        
        const button = screen.getByRole('button', { name: /press kit/i })
        fireEvent.click(button)
        
        expect(screen.getByTestId('presskit-modal')).toBeInTheDocument()
    })

    it('closes modal when onClose is called', () => {
        render(<PressKitButton />)
        
        // Open modal
        const button = screen.getByRole('button', { name: /press kit/i })
        fireEvent.click(button)
        
        expect(screen.getByTestId('presskit-modal')).toBeInTheDocument()
        
        // Close modal
        const closeButton = screen.getByText('Close')
        fireEvent.click(closeButton)
        
        expect(screen.queryByTestId('presskit-modal')).not.toBeInTheDocument()
    })

    it('renders download icon', () => {
        render(<PressKitButton />)
        
        // lucide-react icons render as SVG
        const button = screen.getByRole('button', { name: /press kit/i })
        const svg = button.querySelector('svg')
        
        expect(svg).toBeInTheDocument()
    })
})
