import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home', () => {
    it('renders the locotek heading', () => {
        render(<Home />)

        const heading = screen.getByRole('heading', { level: 1 })

        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('LOCOTEK')
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
})
