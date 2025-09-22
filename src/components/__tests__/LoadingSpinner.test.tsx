import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Custom loading text" />)
    
    expect(screen.getByText('Custom loading text')).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-4 w-4')
    
    rerender(<LoadingSpinner size="md" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-8 w-8')
    
    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-12 w-12')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    
    expect(screen.getByText('Loading...').parentElement).toHaveClass('custom-class')
  })

  it('renders without text when text is empty', () => {
    render(<LoadingSpinner text="" />)
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
})
