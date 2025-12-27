import { render } from '@testing-library/react'
import { Facebook, X, SoundCloud } from './Icons'

describe('Icons', () => {
    describe('Facebook', () => {
        it('renders with default props', () => {
            const { container } = render(<Facebook />)
            const svg = container.querySelector('svg')
            
            expect(svg).toBeInTheDocument()
            expect(svg).toHaveAttribute('aria-hidden', 'true')
            expect(svg).toHaveAttribute('viewBox', '0 0 256 256')
        })

        it('renders with custom color', () => {
            const { container } = render(<Facebook color="#ff0000" />)
            const svg = container.querySelector('svg')
            
            expect(svg).toHaveAttribute('color', '#ff0000')
        })

        it('renders with custom dimensions', () => {
            const { container } = render(<Facebook width={48} height={48} />)
            const svg = container.querySelector('svg')
            
            expect(svg).toHaveAttribute('width', '48')
            expect(svg).toHaveAttribute('height', '48')
        })
    })

    describe('X', () => {
        it('renders with default props', () => {
            const { container } = render(<X />)
            const svg = container.querySelector('svg')
            
            expect(svg).toBeInTheDocument()
            expect(svg).toHaveAttribute('aria-hidden', 'true')
        })

        it('renders with custom props', () => {
            const { container } = render(<X color="#dd2431" width={32} height={32} />)
            const svg = container.querySelector('svg')
            
            expect(svg).toHaveAttribute('color', '#dd2431')
            expect(svg).toHaveAttribute('width', '32')
            expect(svg).toHaveAttribute('height', '32')
        })
    })

    describe('SoundCloud', () => {
        it('renders with default props', () => {
            const { container } = render(<SoundCloud />)
            const svg = container.querySelector('svg')
            
            expect(svg).toBeInTheDocument()
            expect(svg).toHaveAttribute('aria-hidden', 'true')
        })

        it('renders with custom props', () => {
            const { container } = render(<SoundCloud color="#dd2431" width={24} height={24} />)
            const svg = container.querySelector('svg')
            
            expect(svg).toHaveAttribute('color', '#dd2431')
        })
    })
})
