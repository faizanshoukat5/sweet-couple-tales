import { useState, useEffect } from 'react';
import { Plus, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickActionsFabProps {
  onAddMemory: () => void;
  onOpenChat: () => void;
  onSetupProfile?: () => void;
  showProfileSetupAction?: boolean;
  unreadCount?: number;
  partnerTyping?: boolean;
}

export const QuickActionsFab = ({ onAddMemory, onOpenChat, onSetupProfile, showProfileSetupAction, unreadCount = 0, partnerTyping = false }: QuickActionsFabProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const ActionButton = ({ icon, label, onClick, className }: { icon: React.ReactNode; label: string; onClick: () => void; className?: string; }) => (
    <button
      type="button"
      onClick={() => { onClick(); setOpen(false); }}
      className={cn('flex items-center gap-2 rounded-full bg-white shadow-lg px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-100 transition', className)}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-3 mb-1 animate-fade-in">
          <div className="relative">
            <ActionButton icon={<MessageCircle className="w-4 h-4" />} label="Chat" onClick={onOpenChat} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {partnerTyping && (
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white" />
            )}
          </div>
          <ActionButton icon={<Plus className="w-4 h-4" />} label="New Memory" onClick={onAddMemory} />
          {showProfileSetupAction && onSetupProfile && (
            <ActionButton icon={<User className="w-4 h-4" />} label="Setup Profile" onClick={onSetupProfile} />
          )}
        </div>
      )}
      <Button
        variant="romantic"
        className={cn('h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all', open ? 'rotate-45' : '')}
        onClick={() => setOpen(o => !o)}
        title="Quick actions"
      >
        <Plus className="w-7 h-7" />
      </Button>
    </div>
  );
};

export default QuickActionsFab;
