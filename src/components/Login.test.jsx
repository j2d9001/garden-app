import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Login from './Login';

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

import { supabase } from '../supabaseClient';

test('renders email field, password field, and sign in button', () => {
  render(<Login onLogin={() => {}} />);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
});

test('shows error message when invalid credentials are submitted', async () => {
  supabase.auth.signInWithPassword.mockResolvedValue({
    error: { message: 'Invalid login credentials' },
  });

  render(<Login onLogin={() => {}} />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
  });
});
