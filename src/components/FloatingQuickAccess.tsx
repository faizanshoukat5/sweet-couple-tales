import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Smile,
  ChevronUp,
  Camera
} from 'lucide-react';

const FloatingQuickAccess = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { 
      icon: Heart, 
      label: 'Create Memory', 
      action: () => navigate(user ? '/dashboard?action=create' : '/auth'),
      color: 'bg-red-500 hover:bg-red-600'
    },
    { 
      icon: MessageCircle, 
      label: 'Chat', 
      action: () => navigate(user ? '/dashboard#chat' : '/auth'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      icon: Camera, 
      label: 'Album', 
      action: () => navigate(user ? '/dashboard#albums' : '/auth'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      icon: Smile, 
      label: 'Mood', 
      action: () => navigate(user ? '/dashboard#mood' : '/auth'),
      color: 'bg-yellow-500 hover:bg-yellow-600'
    }
  ];

  if (!user) return null; // Only show for authenticated users

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Quick Action Buttons */}
      <div className={`flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        {quickActions.map((action, index) => (
          <div 
            key={action.label}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Button
              size="sm"
              className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group`}
              onClick={action.action}
              title={action.label}
            >
              <action.icon className="w-4 h-4 group-hover:animate-bounce" />
              <span className="ml-2 hidden sm:inline">{action.label}</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Main Toggle Button */}
      <Button
        size="lg"
        className={`rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${isOpen ? 'rotate-45' : 'hover:scale-110'} group`}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close menu' : 'Quick actions'}
      >
        {isOpen ? (
          <Plus className="w-6 h-6 transition-transform" />
        ) : (
          <ChevronUp className="w-6 h-6 group-hover:animate-bounce" />
        )}
      </Button>
    </div>
  );
};

export default FloatingQuickAccess;