// Smoke test: confirms Vitest + React Testing Library + jsdom are wired up.
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the application title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /qa test case tracker/i }),
    ).toBeInTheDocument()
  })
})
