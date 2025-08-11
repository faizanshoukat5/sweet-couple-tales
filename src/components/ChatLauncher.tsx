import { MessageCircleHeart, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ChatLauncherProps {
  onOpenChat: () => void;
  highlight?: boolean;
  unreadCount?: number;
  partnerTyping?: boolean;
  isOnline?: boolean;
}

/**
 * Prominent chat launcher for new users.
 * Shows a pulsing highlight until the user opens chat at least once.
 */
export default function ChatLauncher({ onOpenChat, highlight, unreadCount = 0, partnerTyping = false, isOnline = false }: ChatLauncherProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div
      className={cn(
        'fixed bottom-32 right-6 z-50 flex flex-col items-end gap-2 transition-opacity',
        mounted ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="relative group">
        {highlight && (
          <span className="absolute inset-0 -m-2 rounded-full animate-ping bg-rose-400/40 pointer-events-none" />
        )}
        <Button
          onClick={onOpenChat}
          variant="romantic"
          className={cn(
            'rounded-full shadow-xl px-5 h-14 flex items-center gap-2 font-semibold text-base',
            highlight && 'ring-4 ring-rose-300/40'
          )}
          aria-label="Open chat"
        >
          <div className="relative">
            <MessageCircleHeart className="w-6 h-6" />
            {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
          </div>
          <span className="hidden sm:inline">Chat</span>
        </Button>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <div className="absolute right-full pr-3 top-1/2 -translate-y-1/2 text-xs bg-white/90 border border-rose-100 shadow rounded-lg px-3 py-1 font-medium text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Open your couple chat
        </div>
      </div>
      {(highlight || partnerTyping) && (
        <p className="text-[11px] font-medium text-rose-500 bg-white/80 backdrop-blur px-2 py-1 rounded-md shadow border border-rose-100 animate-fade-in">
          {partnerTyping ? 'Typing…' : 'New! Start chatting here'}
        </p>
      )}
    </div>
  );
}
