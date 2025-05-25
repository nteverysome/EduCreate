import { render, screen, fireEvent } from '@testing-library/react';
import UserMenu from '@/components/UserMenu';
import { useSession } from 'next-auth/react';

// Mock the useSession hook
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn()
}));

describe('UserMenu Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders login button when user is not authenticated', () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(<UserMenu />);
    
    // Check if login button is rendered
    expect(screen.getByText(/登入/i)).toBeInTheDocument();
  });

  test('renders user menu when user is authenticated', () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: '測試用戶',
          email: 'test@example.com'
        },
        expires: '2023-01-01'
      },
      status: 'authenticated'
    });

    render(<UserMenu />);
    
    // Check if user name is rendered
    expect(screen.getByText(/測試用戶/i)).toBeInTheDocument();
  });
});