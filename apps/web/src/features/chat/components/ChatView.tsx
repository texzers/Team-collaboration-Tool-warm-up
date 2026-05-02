import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Send, Plus, Video } from 'lucide-react';
import { format } from 'date-fns';

const DEMO_CHANNELS = [
  { id: 'ch1', name: 'general', isPrivate: false },
  { id: 'ch2', name: 'engineering', isPrivate: false },
  { id: 'ch3', name: 'design', isPrivate: false },
  { id: 'ch4', name: 'random', isPrivate: false },
];

const DEMO_MESSAGES = [
  { id: 'm1', content: 'Hey team! Welcome to TeamFlow 🎉', authorId: 'a1', author: { displayName: 'Alice', avatarUrl: '' }, createdAt: '2026-05-02T08:00:00Z', channelId: 'ch1' },
  { id: 'm2', content: 'Excited to get started on the new sprint!', authorId: 'a2', author: { displayName: 'Bob', avatarUrl: '' }, createdAt: '2026-05-02T08:05:00Z', channelId: 'ch1' },
  { id: 'm3', content: 'The new Kanban board looks amazing. Great work everyone!', authorId: 'a3', author: { displayName: 'Carol', avatarUrl: '' }, createdAt: '2026-05-02T09:00:00Z', channelId: 'ch1' },
  { id: 'm4', content: 'I pushed the latest design updates. Check them out in the Projects tab.', authorId: 'a1', author: { displayName: 'Alice', avatarUrl: '' }, createdAt: '2026-05-02T09:30:00Z', channelId: 'ch1' },
  { id: 'm5', content: 'Nice! I\'ll review it this afternoon.', authorId: 'a2', author: { displayName: 'Bob', avatarUrl: '' }, createdAt: '2026-05-02T09:35:00Z', channelId: 'ch1' },
];

export const ChatView = () => {
  const [activeChannelId, setActiveChannelId] = useState('ch1');
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: `m${Date.now()}`,
      content: input.trim(),
      authorId: 'guest',
      author: { displayName: 'Guest User', avatarUrl: '' },
      createdAt: new Date().toISOString(),
      channelId: activeChannelId,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      {/* Channels Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex">
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Channels</h2>
          <button className="text-slate-500 hover:text-slate-700"><Plus size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {DEMO_CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                channel.id === activeChannelId
                  ? 'bg-primary text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Hash size={14} />
              <span className="truncate font-medium">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-slate-400" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              {DEMO_CHANNELS.find(c => c.id === activeChannelId)?.name || 'general'}
            </h2>
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Video size={16} /> Start a Meet</Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {channelMessages.map(msg => {
            const isMe = msg.authorId === 'guest';
            return (
              <div key={msg.id} className={`flex gap-4 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <img
                  src={msg.author.avatarUrl || `https://ui-avatars.com/api/?name=${msg.author.displayName}&background=random`}
                  alt={msg.author.displayName}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-200 text-sm">{msg.author.displayName}</span>
                    <span className="text-xs text-slate-400">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
              }}
              placeholder={`Message #${DEMO_CHANNELS.find(c => c.id === activeChannelId)?.name}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              rows={1}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 mb-0.5 rounded-lg" disabled={!input.trim()}>
              <Send size={18} className={input.trim() ? 'text-white' : 'text-white/50'} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
