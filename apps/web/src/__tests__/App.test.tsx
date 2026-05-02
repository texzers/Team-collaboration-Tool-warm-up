import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

const renderApp = () =>
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

describe('App', () => {
  it('renders the dashboard home page by default', () => {
    renderApp();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('displays all stat cards on dashboard', () => {
    renderApp();
    expect(screen.getByText('My Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed This Week')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
    expect(screen.getByText('Unread Messages')).toBeInTheDocument();
  });

  it('renders the sidebar with navigation links', () => {
    renderApp();
    expect(screen.getByText('TeamFlow')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('shows guest user info in sidebar', () => {
    renderApp();
    expect(screen.getByText('Guest User')).toBeInTheDocument();
  });
});
