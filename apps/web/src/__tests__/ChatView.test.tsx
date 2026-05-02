import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatView } from '../features/chat/components/ChatView';

const renderChat = () =>
  render(
    <MemoryRouter>
      <ChatView />
    </MemoryRouter>
  );

describe('ChatView', () => {
  it('renders the channels sidebar', () => {
    renderChat();
    expect(screen.getByText('Channels')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText('engineering')).toBeInTheDocument();
    expect(screen.getByText('design')).toBeInTheDocument();
  });

  it('displays demo messages', () => {
    renderChat();
    expect(screen.getByText(/Welcome to TeamFlow/)).toBeInTheDocument();
    expect(screen.getByText(/new sprint/)).toBeInTheDocument();
  });

  it('allows typing a message', () => {
    renderChat();
    const textarea = screen.getByPlaceholderText(/Message #general/);
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(textarea).toHaveValue('Hello world');
  });

  it('sends a message and clears input', () => {
    renderChat();
    const textarea = screen.getByPlaceholderText(/Message #general/);
    const form = textarea.closest('form')!;

    fireEvent.change(textarea, { target: { value: 'New message' } });
    fireEvent.submit(form);

    expect(screen.getByText('New message')).toBeInTheDocument();
    expect(textarea).toHaveValue('');
  });

  it('does not send empty messages', () => {
    renderChat();
    const textarea = screen.getByPlaceholderText(/Message #general/);
    const form = textarea.closest('form')!;
    const initialMessages = screen.getAllByText(/Alice|Bob|Carol/).length;

    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.submit(form);

    // Should not add a new message author
    expect(screen.getAllByText(/Alice|Bob|Carol/).length).toBe(initialMessages);
  });
});
