import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth';
import { useSocket } from '../hooks/useSocket';
import { useChannels, useMessages, useSendMessage } from '../hooks/useChat';
import { Button } from '@/components/ui/button';
import { Hash, Lock, Send, Plus, Video } from 'lucide-react';
import { format } from 'date-fns';

export const ChatView = () => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  
  // To keep demo simple, we default to the first channel
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const activeChannelId = channels?.[0]?.id; // Defaulting to first channel

  const { data: messages, isLoading: messagesLoading } = useMessages(activeChannelId || '');
  const { mutate: sendMessage, isPending } = useSendMessage(activeChannelId || '');

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket listener
  useEffect(() => {
    if (!socket || !activeChannelId) return;

    socket.emit('join:channel', activeChannelId);

    const handleNewMessage = (message: any) => {
      if (message.channelId === activeChannelId) {
        queryClient.setQueryData(['messages', activeChannelId], (old: any) => {
          if (!old) return [message];
          if (old.some((m: any) => m.id === message.id)) return old;
          return [...old, message];
        });
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.emit('leave:channel', activeChannelId);
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, activeChannelId, queryClient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChannelId) return;

    sendMessage({ content: input.trim() });
    setInput('');
  };

  if (channelsLoading) return <div className="p-8">Loading channels...</div>;

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      
      {/* Channels Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex">
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Channels</h2>
          <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {channels?.map((channel: any) => (
            <button
              key={channel.id}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                channel.id === activeChannelId
                  ? 'bg-primary text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {channel.isPrivate ? <Lock size={14} /> : <Hash size={14} />}
              <span className="truncate font-medium">{channel.name}</span>
            </button>
          ))}
          {(!channels || channels.length === 0) && (
            <div className="text-sm text-slate-500 p-2">No channels yet</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-slate-400" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              {channels?.find((c: any) => c.id === activeChannelId)?.name || 'general'}
            </h2>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Video size={16} /> Start a Meet
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messagesLoading && <div className="text-slate-500">Loading messages...</div>}
          
          {messages?.map((msg: any) => {
            const isMe = msg.authorId === user?.id;
            
            return (
              <div key={msg.id} className={`flex gap-4 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <img 
                  src={msg.author.avatarUrl || `https://ui-avatars.com/api/?name=${msg.author.displayName}&background=random`} 
                  alt={msg.author.displayName}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                      {msg.author.displayName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
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

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Message #general..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-3 text-sm text-slate-900 dark:text-slate-100"
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 shrink-0 mb-0.5 rounded-lg"
              disabled={!input.trim() || isPending}
            >
              <Send size={18} className={input.trim() ? "text-white" : "text-white/50"} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
