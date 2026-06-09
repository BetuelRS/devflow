import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../src/pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';

// Mock the api module
vi.mock('../src/lib/api', () => ({
  api: {
    boards: { list: () => Promise.resolve([]) },
  },
}));

describe('Dashboard page', () => {
  it('renders empty board list', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('My Boards')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New board title...')).toBeInTheDocument();
  });
});
