import { render, screen } from '@testing-library/react';
import Home from '@/pages/index';

// Mock components used in Home page
jest.mock('@/components/Auth/AuthProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('@/components/UserMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="user-menu">User Menu</div>
}));

describe('Home Page', () => {
  it('renders the homepage with main sections', () => {
    render(<Home />);
    
    // Check if main heading exists
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check if call-to-action button exists
    expect(screen.getByRole('link', { name: /開始使用/i })).toBeInTheDocument();
    
    // Check if features section exists
    expect(screen.getByText(/特色功能/i)).toBeInTheDocument();
  });
  
  it('displays the user menu component', () => {
    render(<Home />);
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });
});