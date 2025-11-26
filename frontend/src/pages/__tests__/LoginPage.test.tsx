/**
 * Component tests for LoginPage
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import * as authApi from '../../lib/api/auth';

// Mock the auth API
vi.mock('../../lib/api/auth', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

// Mock useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({}),
    user: null,
    isAuthenticated: false,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByRole('heading', { name: /sign in to brightsteps/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation error for empty form submission', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission
    const emailInput = screen.getByPlaceholderText(/email address/i);
    expect(emailInput).toBeRequired();
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    const { useAuth } = await import('../../contexts/AuthContext');
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
    } as any);
    
    render(<LoginPage />);
    
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});

