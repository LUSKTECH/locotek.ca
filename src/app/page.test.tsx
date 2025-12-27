import { render, screen } from '@testing-library/react'
import Home from './page'

// Mock the components that use WebGL/Three.js
jest.mock('@/components/VantaFog', () => {
    return function MockVantaFog() {
        return <div data-testid="vanta-fog">Vanta Fog Mock</div>
    }
})

jest.mock('@/components/PressKitButton', () => {
    return function MockPressKitButton() {
        return <button data-testid="presskit-button">Press Kit</button>
    }
})

describe('Home', () => {
    it('renders the locotek heading', () => {
        render(<Home />)

        const heading = screen.getByRole('heading', { level: 1 })

        expect(heading).toBeInTheDocument()
        // The heading contains an image with alt text "LOCOTEK"
        const logo = screen.getByAltText('LOCOTEK')
        expect(logo).toBeInTheDocument()
    })

    it('renders social links', () => {
        render(<Home />)

        expect(screen.getByText('Facebook')).toBeInTheDocument()
        expect(screen.getByText('SoundCloud')).toBeInTheDocument()
        expect(screen.getByText('X')).toBeInTheDocument()
    })

    it('renders the footer', () => {
        render(<Home />)
        const year = new Date().getFullYear();
        expect(screen.getByText((content) => content.includes(year.toString()))).toBeInTheDocument()
    })

    it('renders the tagline', () => {
        render(<Home />)
        expect(screen.getByText('Toronto-based DJ & Producer')).toBeInTheDocument()
    })

    it('renders the press kit button', () => {
        render(<Home />)
        expect(screen.getByTestId('presskit-button')).toBeInTheDocument()
    })

    it('renders the background image', () => {
        render(<Home />)
        const bgImage = screen.getByAltText('Background')
        expect(bgImage).toBeInTheDocument()
    })
})
