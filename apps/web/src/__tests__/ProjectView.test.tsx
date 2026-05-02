import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProjectView } from '../features/projects/components/ProjectView';

const renderProject = (projectId = 'demo-project-id') =>
  render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectView />} />
      </Routes>
    </MemoryRouter>
  );

describe('ProjectView', () => {
  it('renders the project name', () => {
    renderProject();
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
  });

  it('renders all Kanban columns', () => {
    renderProject();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('displays demo tasks', () => {
    renderProject();
    expect(screen.getByText('Design new landing page wireframes')).toBeInTheDocument();
    expect(screen.getByText('Implement user authentication flow')).toBeInTheDocument();
    expect(screen.getByText('Database schema migration')).toBeInTheDocument();
  });

  it('shows task priorities', () => {
    renderProject();
    const highTags = screen.getAllByText('HIGH');
    expect(highTags.length).toBeGreaterThan(0);
  });

  it('renders the New Task button', () => {
    renderProject();
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('shows team member avatars', () => {
    renderProject();
    const avatars = screen.getAllByAltText(/Alice|Bob|Carol/);
    expect(avatars.length).toBeGreaterThan(0);
  });
});
