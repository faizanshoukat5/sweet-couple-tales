import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Download,
  Bell,
  BellOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import heartFlowers from '@/assets/heart-flowers.png';
import { useMemories } from '@/hooks/useMemories';
import { useNotifications } from '@/hooks/useNotifications';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { exportMemories, memories } = useMemories();
  const { permission, requestPermission, sendInstantNotification } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNotificationToggle = async () => {
    if (permission === 'default') {
      const granted = await requestPermission();
      if (granted) {
        sendInstantNotification(
          'Notifications Enabled',
          'You\'ll now receive memory reminders and anniversary notifications!'
        );
      }
    }
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'My Dashboard', icon: Heart, requireAuth: true },
  ];

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src={heartFlowers} 
              alt="Sweet Couple Tales" 
              className="w-8 h-8 animate-heart-float"
            />
            <span className="font-serif text-xl font-bold text-foreground">
              Sweet Couple <span className="text-primary">Tales</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requireAuth && !user) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications - Desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotificationToggle}
                  className={cn(
                    "hidden md:flex items-center gap-2",
                    permission === 'granted' ? 'text-primary' : 'text-muted-foreground'
                  )}
                  title={permission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
                >
                  {permission === 'granted' ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </Button>

                {/* Export - Desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportMemories}
                  disabled={memories.length === 0}
                  className="hidden md:flex items-center gap-2"
                  title="Export memories"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt={user.email || 'User'} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card border-border shadow-lg" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm text-foreground">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => navigate('/dashboard')}
                      className="cursor-pointer"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      My Dashboard
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>

                    {/* Mobile-only actions */}
                    <div className="md:hidden">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleNotificationToggle}
                        className="cursor-pointer"
                      >
                        {permission === 'granted' ? (
                          <>
                            <Bell className="mr-2 h-4 w-4 text-primary" />
                            Notifications On
                          </>
                        ) : (
                          <>
                            <BellOff className="mr-2 h-4 w-4" />
                            Enable Notifications
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={exportMemories}
                        disabled={memories.length === 0}
                        className="cursor-pointer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Memories
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="romantic" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                if (link.requireAuth && !user) return null;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors",
                      isActive(link.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;