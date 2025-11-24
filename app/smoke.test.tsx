import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Smoke Test', () => {
  it('should pass this basic test', () => {
    expect(true).toBe(true)
  })

  it('should be able to render a simple div', () => {
    render(<div data-testid="test-div">Hello World</div>)
    expect(screen.getByTestId('test-div')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
