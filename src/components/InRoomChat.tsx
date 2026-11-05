import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types.ts';
import { Send, MessageSquare } from 'lucide-react';

interface InRoomChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
}

export const InRoomChat: React.FC<InRoomChatProps> = ({
  messages,
  onSendMessage,
  onSendReaction,
}) => {
  const [input, setInput] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; left: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleEmojiClick = (emoji: string) => {
    onSendReaction(emoji);

    // Spawn floating emoji
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: 15 + Math.random() * 70,
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newEmoji.id));
    }, 2000);
  };

  return (
    <div className="relative bg-[#12080d]/80 backdrop-blur-md rounded-2xl border border-red-950/60 p-3 shadow-xl flex flex-col h-[280px]">
      {/* Floating Emojis Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-12 text-3xl animate-in fade-in slide-out-to-top-32 duration-1000 ease-out transition-all"
            style={{ left: `${item.left}%` }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-red-950/40 mb-2">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-rose-400" />
          <h4 className="font-heading font-bold text-xs text-rose-200 uppercase tracking-wide">
            LIVE ROOM BANTER
          </h4>
        </div>
      </div>

      {/* Message History List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs">
        {messages.map((m) => {
          if (m.isSystem) {
            return (
              <div
                key={m.id}
                className="py-1 px-2.5 rounded-lg bg-red-950/40 border border-red-900/30 text-rose-300/90 text-[11px] font-medium text-center"
              >
                {m.text}
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className="flex items-start gap-1.5 py-0.5 px-1 rounded hover:bg-white/5"
            >
              <span className="text-sm shrink-0">{m.avatar}</span>
              <div className="min-w-0">
                <span className="font-bold text-gray-300 mr-1.5 text-[11px]">
                  {m.playerName}:
                </span>
                {m.emoji ? (
                  <span className="text-base">{m.emoji}</span>
                ) : (
                  <span className="text-gray-200 break-words">{m.text}</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Tray */}
      <div className="pt-2 border-t border-red-950/40 flex items-center justify-between gap-1 mb-2">
        {['🎉', '🔥', '💀', '🍀', '💰', '👑', '😱'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="text-base hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/10 active:scale-95 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send message to room..."
          maxLength={80}
          className="flex-1 bg-black/60 border border-red-950/70 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
