import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

describe('App routing', () => {
  it('redirects to login when no token', () => {
    localStorage.removeItem('token');
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0);
  });

  it('shows login page at /login', () => {
    localStorage.removeItem('token');
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0);
  });

  it('shows register page at /register', () => {
    localStorage.removeItem('token');
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/sign up/i).length).toBeGreaterThan(0);
  });
});
