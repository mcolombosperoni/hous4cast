import { render, screen } from '@testing-library/react'
import App from './App'

describe('App shell', () => {
  it('renders home title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /hous4cast/i })).toBeInTheDocument()
  })
})

