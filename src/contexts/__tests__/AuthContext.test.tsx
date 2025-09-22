import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { authService } from '../../../lib/auth'

// Mock the auth service
jest.mock('../../../lib/auth', () => ({
  authService: {
    onAuthStateChanged: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUserProfile: jest.fn(),
  },
}))

// Test component that uses the auth context
function TestComponent() {
  const { user, userProfile, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return (
    <div>
      <div>User: {user.email}</div>
      <div>Profile: {userProfile?.name || 'No profile'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides loading state initially', () => {
    const mockOnAuthStateChanged = authService.onAuthStateChanged as jest.Mock
    mockOnAuthStateChanged.mockImplementation((callback) => {
      // Don't call callback immediately to test loading state
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('provides user when authenticated', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' }
    const mockProfile = { uid: '123', name: 'Test User', role: 'REPORTER' }
    
    const mockOnAuthStateChanged = authService.onAuthStateChanged as jest.Mock
    const mockGetUserProfile = authService.getUserProfile as jest.Mock
    
    mockOnAuthStateChanged.mockImplementation((callback) => {
      // Simulate auth state change
      setTimeout(() => callback(mockUser), 0)
      return jest.fn()
    })
    
    mockGetUserProfile.mockResolvedValue(mockProfile)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Profile: Test User')).toBeInTheDocument()
    })
  })

  it('provides null user when not authenticated', async () => {
    const mockOnAuthStateChanged = authService.onAuthStateChanged as jest.Mock
    
    mockOnAuthStateChanged.mockImplementation((callback) => {
      // Simulate no user
      setTimeout(() => callback(null), 0)
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    })
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })
})
