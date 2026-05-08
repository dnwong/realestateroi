import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthForm from './AuthForm';

// Mock AuthContext
const mockLogin = vi.fn();
const mockRegister = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, register: mockRegister }),
}));

// Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderForm(mode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AuthForm mode={mode} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AuthForm', () => {
  beforeEach(() => { mockLogin.mockReset(); mockRegister.mockReset(); mockNavigate.mockReset(); });

  it('renders login form', () => {
    renderForm('login');
    expect(screen.getByTestId('auth-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('auth-submit-button')).toHaveTextContent('Sign In');
  });

  it('renders register form', () => {
    renderForm('register');
    expect(screen.getByTestId('auth-submit-button')).toHaveTextContent('Create Account');
  });

  it('shows validation error for invalid email', async () => {
    renderForm('login');
    fireEvent.change(screen.getByTestId('auth-email-input'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByTestId('auth-password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('auth-submit-button'));
    expect(await screen.findByRole('alert')).toHaveTextContent('valid email');
  });

  it('shows validation error for short password', async () => {
    renderForm('login');
    fireEvent.change(screen.getByTestId('auth-email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('auth-password-input'), { target: { value: 'short' } });
    fireEvent.click(screen.getByTestId('auth-submit-button'));
    expect(await screen.findByRole('alert')).toHaveTextContent('8 characters');
  });

  it('calls login and navigates on success', async () => {
    mockLogin.mockResolvedValue({ id: '1', email: 'test@example.com' });
    renderForm('login');
    fireEvent.change(screen.getByTestId('auth-email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('auth-password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('auth-submit-button'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('shows error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    renderForm('login');
    fireEvent.change(screen.getByTestId('auth-email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('auth-password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('auth-submit-button'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
