import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMemories } from '@/hooks/useMemories';
import { useAlbums } from '@/hooks/useAlbums';
import { useGoals } from '@/hooks/useGoals';
import { useNotifications } from '@/hooks/useNotifications';
import { useImportantDates } from '@/hooks/useImportantDates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Heart, Calendar, Tag, Search, Grid, List, User, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CreateMemoryModal from '@/components/CreateMemoryModal';
import MemoryCard from '@/components/MemoryCard';
import VirtualizedMemoryList from '@/components/VirtualizedMemoryList';
import ProfileSetup from '@/components/ProfileSetup';
import GoalsList from '@/components/GoalsList';
import ImportantDates from '@/components/ImportantDates';
import AlbumsList from '@/components/AlbumsList';
import AlbumBrowser from '@/components/AlbumBrowser';
import SharedCalendar from '@/components/SharedCalendar';
import EnhancedChat from '@/components/EnhancedChat';
import { useLocation } from 'react-router-dom';
import { MoodTracker } from '@/components/MoodTracker';
import { LoveNotesWidget } from '@/components/LoveNotesWidget';
import { DateIdeasWidget } from '@/components/DateIdeasWidget';
import { LoveLanguageQuiz, PartnerQuizResults, CycleTrackerCard } from '@/components';
import { useMoods } from '@/hooks/useMoods';
import { supabase } from '@/integrations/supabase/client';
import SectionCard from '@/components/SectionCard';
import StatsBar, { StatCard } from '@/components/StatsBar';
import QuickActionsFab from '@/components/QuickActionsFab';
import ChatLauncher from '@/components/ChatLauncher';
import { useChatStatus } from '@/hooks/useChatStatus';

// ChatSidePanel: focus trap, ESC close, improved header, smooth slide
function ChatSidePanel({ open, onClose, partnerId, setShowProfileSetup }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const focusable = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length) {
      focusable[0].focus();
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && focusable && focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <aside
      ref={panelRef}
      className={
        'fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-full bg-white rounded-l-2xl shadow-2xl border-l border-rose-100 flex flex-col transition-transform duration-300 ease-in-out ' +
        (open ? 'translate-x-0' : 'translate-x-full')
      }
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-rose-50 to-pink-50 rounded-tl-2xl shadow-sm">
        <h3 className="font-serif text-lg font-bold text-rose-600 flex items-center gap-2"><Heart className="w-5 h-5" /> Chat</h3>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8" aria-label="Close chat">✕</Button>
      </div>
      <div className="flex-1 overflow-hidden">
        {partnerId === undefined ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            Looking for your partner...
          </div>
        ) : !partnerId ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
            <Heart className="w-16 h-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Partner Connected</h3>
              <p className="text-muted-foreground mb-4">Complete your profile setup and select your partner to start chatting together!</p>
              <Button variant="romantic" onClick={() => { onClose(); setShowProfileSetup(true); }}>
                <User className="w-4 h-4 mr-2" /> Setup Profile & Partner
              </Button>
            </div>
          </div>
        ) : (
          <EnhancedChat partnerId={partnerId} />
        )}
      </div>
    </aside>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const { memories, loading } = useMemories();
  const { albums } = useAlbums();
  const { goals } = useGoals();
  const { permission, sendInstantNotification, requestPermission } = useNotifications();
  const { dates: importantDates } = useImportantDates();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'favorites' | 'date-asc'>('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAlbumBrowser, setShowAlbumBrowser] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatOpenedOnce, setChatOpenedOnce] = useState<boolean>(() => {
    try { return localStorage.getItem('chatOpenedOnce') === '1'; } catch { return false; }
  });
  const [profile, setProfile] = useState<{ avatar_url?: string, display_name?: string } | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<{ display_name?: string; email?: string; avatar_url?: string } | null>(null);
  const location = useLocation();
  const { unreadCount, partnerTyping, isOnline } = useChatStatus(partnerId);
  // Derived: upcoming important dates within next 30 days
  const upcomingDates = importantDates.filter(d => {
    const date = new Date(d.date);
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  // Daily memory-adding streak (consecutive days including today)
  const streak = useMemo(() => {
    if (!memories || memories.length === 0) return 0;
    const dates = new Set(
      memories
        .map(m => (m.memory_date || '').split('T')[0])
        .filter(Boolean)
    );
    let days = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    while (dates.has(d.toISOString().split('T')[0])) {
      days++;
      d.setDate(d.getDate() - 1);
    }
    return days;
  }, [memories]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  let filteredMemories = memories.filter(memory => {
    const matchesSearch = !debouncedSearch || 
      memory.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      memory.content?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesTag = !selectedTag || memory.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Apply sort
  filteredMemories = [...filteredMemories].sort((a,b) => {
    if (sortMode === 'favorites') {
      if (a.is_favorite === b.is_favorite) return b.memory_date.localeCompare(a.memory_date);
      return a.is_favorite ? -1 : 1;
    }
    if (sortMode === 'oldest') return a.memory_date.localeCompare(b.memory_date);
    if (sortMode === 'date-asc') return a.memory_date.localeCompare(b.memory_date);
    // newest default
    return b.memory_date.localeCompare(a.memory_date);
  });

  const favoriteMemories = filteredMemories.filter(memory => memory.is_favorite);
  const allTags = [...new Set(memories.flatMap(memory => memory.tags))];

  // Debug: reset filters on mount once (in case stale state hid list)
  useEffect(() => {
    setSelectedTag(null);
    setSearchTerm('');
  }, []);


  useEffect(() => {
    // Check for today's anniversaries and send notifications
    if (permission === 'granted' && memories.length > 0) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      memories.forEach(memory => {
        const memoryDate = new Date(memory.memory_date);
        const memoryDateString = `${today.getFullYear()}-${String(memoryDate.getMonth() + 1).padStart(2, '0')}-${String(memoryDate.getDate()).padStart(2, '0')}`;
        
        if (memoryDateString === todayString && memoryDate.getFullYear() !== today.getFullYear()) {
          sendInstantNotification(
            'Anniversary Today! 🎉',
            `Today marks the anniversary of "${memory.title}"`
          );
        }
      });
    }
  }, [memories, permission, sendInstantNotification]);

  useEffect(() => {
    if (!importantDates.length) return;
    const today = new Date();
    importantDates.forEach(date => {
      const eventDate = new Date(date.date);
      if (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth()
      ) {
        // Show toast notification
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: `Today is ${date.title}! 🎉`,
            description: `Don't forget to celebrate your special day.`,
            variant: 'default',
          });
        });
      }
    });
  }, [importantDates]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowCreateModal(true);
    }
    // Hash navigation for dashboard sections with retry
    const hash = window.location.hash;
    if (hash) {
      const sectionMap = {
        '#albums': 'albums',
        '#calendar': 'calendar',
        '#goals': 'goals',
        '#dates': 'dates',
        '#memories': 'memories',
        '#chat': 'chat',
      };
      const sectionId = sectionMap[hash];
      if (sectionId) {
        let attempts = 0;
        const scrollToSection = () => {
          if (sectionId === 'chat') {
            setShowChat(true);
          } else if (attempts < 5) {
            const el = document.getElementById(sectionId) || document.querySelector(`.${sectionId}-section`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              attempts++;
              setTimeout(scrollToSection, 200);
            }
          }
        };
        setTimeout(scrollToSection, 300);
      }
    }
  }, [location]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!error && data) setProfile(data);
    };
    fetchProfile();
  }, [user, showProfileSetup]); // refetch after profile setup closes

  useEffect(() => {
    const fetchPartnerId = async () => {
      if (!user) return;
      
      console.log('Fetching partner for user:', user.id);
      
      const { data, error } = await supabase
        .from('couples')
        .select('id, user1_id, user2_id, status')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(1);
      
      console.log('Couples query result:', data, error);
      
      if (!error && data && data.length > 0) {
        const couple = data[0];
        const otherId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
        console.log('Setting partner ID to:', otherId);
        setPartnerId(otherId);
      } else {
        console.log('No partner found or error occurred:', error);
        setPartnerId(null);
      }
    };
    fetchPartnerId();
  }, [user]);

  useEffect(() => {
    if (!partnerId) {
      setPartnerProfile(null);
      return;
    }
    const fetchPartnerProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, email, avatar_url')
        .eq('user_id', partnerId)
        .maybeSingle();
      if (!error && data) setPartnerProfile(data);
      else setPartnerProfile(null);
    };
    fetchPartnerProfile();
  }, [partnerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your beautiful memories...</p>

        </div>
        {/* Love Notes Widget */}
        <LoveNotesWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100">
      <div className="container mx-auto px-4 py-10">
        {/* Profile & Partner Hero Section (redesigned + enhanced) */}
        {(() => {
          const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Friend';
          const memoryLabel = memories.length === 1 ? 'memory' : 'memories';
          const hour = new Date().getHours();
          const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
          const milestones = [1, 5, 10, 25, 50, 100];
          const reached = milestones.findLast(m => memories.length >= m);
          return (
            <div className="mb-10 rounded-[28px] p-[1px] bg-gradient-to-r from-rose-200/70 to-pink-200/70">
              <section className="relative overflow-hidden rounded-[26px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-50 shadow-xl transition-shadow hover:shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2">
                {/* decorative glow */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-10">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-rose-300/40 to-pink-300/40 blur" aria-hidden />
                  <img
                    src={profile?.avatar_url || '/placeholder.svg'}
                    alt="Your profile avatar"
                    className="relative w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-white/80 shadow-lg bg-muted"
                    onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
                    title={isOnline ? 'You are online' : 'You are offline'}
                  />
                </div>

                {/* Heading + Copy */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight text-rose-600 flex items-center justify-center md:justify-start gap-2">
                    <span className="text-rose-400">♡</span>
                    Your Memory Collection
                  </h1>
                  <p className="mt-2 text-base md:text-lg text-muted-foreground">
                    {greeting}, <span className="font-semibold text-rose-700">{displayName}</span>!
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 shadow-sm border border-rose-100">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-sm md:text-base">
                      You have <span className="font-bold text-rose-600">{memories.length}</span> beautiful {memoryLabel} saved ✨
                    </span>
                    {reached ? (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-2 hidden sm:inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 border border-rose-200 cursor-default">
                              Milestone {reached}!
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">You've saved {memories.length} memories — keep going!</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </div>

                  {/* mini stats chips */}
                  <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
                    <span className="rounded-full bg-white/70 border border-rose-100 px-2.5 py-1 text-rose-700 shadow-sm">{albums.length} albums</span>
                    <span className="rounded-full bg-white/70 border border-rose-100 px-2.5 py-1 text-rose-700 shadow-sm">{upcomingDates.length} upcoming dates</span>
                    {streak > 0 && (
                      <span className="rounded-full bg-amber-100/80 border border-amber-200 px-2.5 py-1 text-amber-800 shadow-sm">🔥 {streak}-day streak</span>
                    )}
                  </div>

                  {/* Partner strip */}
                  {partnerProfile && (
                    <div className="mt-4 flex items-center justify-center md:justify-start" aria-live="polite">
                      <div className="flex items-center gap-3 w-full md:w-auto max-w-full rounded-2xl px-4 py-2 bg-gradient-to-r from-rose-100/90 to-pink-50/90 border border-rose-100 shadow-sm">
                        <span className="text-sm text-muted-foreground">Partner</span>
                        {partnerProfile.avatar_url ? (
                          <img
                            src={partnerProfile.avatar_url}
                            alt="Partner avatar"
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow bg-muted"
                            onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                            title={partnerProfile.display_name || partnerProfile.email}
                          />
                        ) : null}
                        <span className="truncate text-sm md:text-base font-semibold text-rose-700 max-w-[40vw] md:max-w-none">
                          {partnerProfile.display_name || partnerProfile.email}
                        </span>
                        {partnerTyping ? (
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-100 text-amber-800 border-amber-200 cursor-default`}
                                >
                                  typing…
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="center">
                                {(partnerProfile?.display_name || partnerProfile?.email || 'Partner') + ' is typing…'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span
                            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium border ${isOnline ? 'bg-green-100 text-green-700 border-green-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}
                          >
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <Button variant="romantic" className="rounded-full px-5" onClick={() => setShowCreateModal(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Memory
                    </Button>
                    <Button variant="outline" className="rounded-full px-5" onClick={() => setShowChat(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Open Chat
                    </Button>
                  </div>
                </div>
                </div>
              </section>
            </div>
          );
        })()}

        {/* Mood Tracker Section */}
        {user && partnerId && (
          <div className="mb-10">
            <Card className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-100 to-pink-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-rose-200 text-rose-700 rounded-full p-3 shadow-sm">
                    <Heart className="w-6 h-6" />
                  </span>
                  <div>
                    <CardTitle className="font-serif text-2xl font-bold text-rose-700">Daily Mood Tracker</CardTitle>
                    <p className="text-rose-600 text-sm font-medium mt-1">Share your feelings and connect with your partner</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <MoodTracker userId={user.id} partnerId={partnerId} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cycle Tracker */}
        {user && (
          <div className="mb-10">
            <CycleTrackerCard userId={user.id} />
          </div>
        )}

        {/* Stats Summary (refactored) */}
        <StatsBar className="mb-10">
          <StatCard label="Memories" value={memories.length} meta={<><Heart className="w-3 h-3" /> {memories.filter(m=>m.is_favorite).length} favorites</>} />
          <StatCard label="Albums" value={albums.length} gradient="bg-gradient-to-br from-pink-500 to-rose-400" meta={<span>Organized</span>} />
          <StatCard label="Goals" value={goals.length} gradient="bg-gradient-to-br from-rose-400 to-pink-300" meta={<span>{goals.filter(g=>g.completed).length} completed</span>} />
          <StatCard label="Upcoming Dates" value={upcomingDates.length} gradient="bg-gradient-to-br from-pink-400 to-rose-300" meta={<span>Next 30 days</span>} />
          <StatCard label="Partner" value={partnerProfile?.display_name || partnerProfile?.email || '—'} gradient="bg-gradient-to-br from-rose-300 to-pink-200 text-rose-800" meta={<span>Connection</span>} className="hidden xl:flex" />
        </StatsBar>

        {/* Search, Filters & Sort */}
        <Card className="mb-10 shadow-xl border-0 bg-white/90">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-300 w-5 h-5" />
                 <Input
                   ref={searchRef}
                   placeholder="Search your memories..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-12 py-3 rounded-xl border-rose-200 focus:ring-rose-300 text-lg"
                 />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={viewMode === 'grid' ? 'romantic' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-full"
                  title="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'romantic' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-full"
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </Button>
                <div className="relative">
                  <select
                    value={sortMode}
                    onChange={e => setSortMode(e.target.value as any)}
                    className="appearance-none pl-4 pr-10 py-2 rounded-full border border-rose-200 bg-white text-rose-600 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    title="Sort memories"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="favorites">Favorites First</option>
                    <option value="date-asc">Date Asc</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 text-xs">▼</span>
                </div>
              </div>
            </div>
             {allTags.length > 0 && (
               <div className="mt-6 flex gap-2 overflow-x-auto w-full pb-2 scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch' }}>
                <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                <Button
                  variant={selectedTag === null ? 'romantic' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                  className="rounded-full px-4"
                >
                  All
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'romantic' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className="rounded-full px-4"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Button>
                ))}
                 {(selectedTag !== null || debouncedSearch) && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => { setSelectedTag(null); setSearchTerm(''); searchRef.current?.focus(); }}
                     className="rounded-full px-4 whitespace-nowrap"
                   >
                     Clear filters ✕
                   </Button>
                 )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Memory Debug Info */}
        <div className="mb-4 text-xs text-rose-500/70 font-mono space-y-1">
          <div>memories: {memories.length} | filtered: {filteredMemories.length} | favorites: {favoriteMemories.length}</div>
          {memories.length > 0 && (
            <div className="truncate">titles: {memories.map(m=>m.title).join(' • ')}</div>
          )}
        </div>
        {/* Memory Tabs */}
        <SectionCard
          id="memories"
          title="Memories"
          subtitle="Browse, filter & cherish your story"
          icon={<Calendar className="w-6 h-6" />}
          padded={false}
          className="memory-section"
        >
          <div className="p-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-10 bg-rose-50 rounded-xl shadow-inner">
                <TabsTrigger value="all" className="flex items-center gap-2 text-lg font-semibold text-rose-600 data-[state=active]:border-b-4 data-[state=active]:border-rose-400 transition-all">
                  <Calendar className="w-5 h-5" />
                  All <span className="ml-1 bg-rose-100 text-rose-600 rounded-full px-2 py-0.5 text-xs font-bold">{filteredMemories.length}</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2 text-lg font-semibold text-rose-600 data-[state=active]:border-b-4 data-[state=active]:border-rose-400 transition-all">
                  <Heart className="w-5 h-5" />
                  Favorites <span className="ml-1 bg-rose-100 text-rose-600 rounded-full px-2 py-0.5 text-xs font-bold">{favoriteMemories.length}</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {filteredMemories.length === 0 ? (
                  <Card className="bg-gradient-to-br from-white to-rose-50 border-0 shadow-md">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 text-rose-200 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2 text-rose-600">No memories found</h3>
                      <p className="text-muted-foreground mb-6">
                        {memories.length === 0
                          ? 'Start creating your beautiful love story by adding your first memory!'
                          : 'Try adjusting your search or filters to find what you\'re looking for.'}
                      </p>
                      <Button onClick={() => setShowCreateModal(true)} variant="romantic" className="px-6 py-3 text-lg rounded-full">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Memory
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  viewMode === 'grid' ? (
                    <VirtualizedMemoryList items={filteredMemories} viewMode="grid" />
                  ) : (
                    <div className="space-y-6">
                      {filteredMemories.map(memory => (
                        <MemoryCard key={memory.id} memory={memory} viewMode={viewMode} />
                      ))}
                    </div>
                  )
                )}
              </TabsContent>
              <TabsContent value="favorites">
                {favoriteMemories.length === 0 ? (
                  <Card className="bg-gradient-to-br from-white to-rose-50 border-0 shadow-md">
                    <CardContent className="p-12 text-center">
                      <Heart className="w-16 h-16 text-rose-200 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2 text-rose-600">No favorite memories yet</h3>
                      <p className="text-muted-foreground">
                        Mark your most special memories as favorites by clicking the heart icon!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  viewMode === 'grid' ? (
                    <VirtualizedMemoryList items={favoriteMemories} viewMode="grid" />
                  ) : (
                    <div className="space-y-6">
                      {favoriteMemories.map(memory => (
                        <MemoryCard key={memory.id} memory={memory} viewMode={viewMode} />
                      ))}
                    </div>
                  )
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SectionCard>

        {/* Goals List */}
        <div className="mt-14" id="goals">
          <SectionCard
            title="Your Shared Goals & Bucket List"
            subtitle="Track dreams you build together"
            icon={<Plus className="w-6 h-6" />}
            padded
          >
            <GoalsList />
          </SectionCard>
        </div>

        {/* Important Dates */}
        <div className="mt-14" id="dates">
          <SectionCard
            title="Important Dates & Anniversaries"
            subtitle="Never miss a special moment"
            icon={<Calendar className="w-6 h-6" />}
            padded
          >
            <ImportantDates />
          </SectionCard>
        </div>

        {/* Albums Section */}
        <section id="albums" className="mt-14">
          <SectionCard
            title="Photo Albums"
            subtitle="Organize and revisit your journey together"
            icon={<Grid className="w-6 h-6" />}
            actions={
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setShowAlbumBrowser(true)} className="rounded-full px-6">
                  <Grid className="w-4 h-4 mr-2" /> Manage
                </Button>
                <Button variant="romantic" onClick={() => setShowAlbumBrowser(true)} className="rounded-full px-6">
                  + Add / View All
                </Button>
              </div>
            }
            padded
          >
            <AlbumsList cardStyle="carousel" />
          </SectionCard>
          {showAlbumBrowser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 sm:px-4">
              <div className="bg-white/95 border border-rose-100 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden overflow-x-hidden relative">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-rose-50 to-pink-50">
                  <h3 className="font-semibold text-rose-600 flex items-center gap-2 text-sm sm:text-base"><Grid className="w-4 h-4" /> All Albums</h3>
                  <Button size="icon" variant="ghost" onClick={() => setShowAlbumBrowser(false)} className="hover:rotate-90 transition h-8 w-8">
                    ✕
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6" role="dialog" aria-label="Album browser">
                  <AlbumBrowser />
                </div>
              </div>
            </div>
          )}
        </section>


        {/* Shared Calendar */}
        <div className="mt-14" id="calendar">
          <SectionCard
            title="Shared Calendar"
            subtitle="Plan and view milestones together"
            icon={<Calendar className="w-6 h-6" />}
            padded
          >
            <SharedCalendar />
          </SectionCard>
        </div>

        {/* Love Notes Widget (moved here) */}
        <LoveNotesWidget />

        {/* Date Ideas Generator */}
        <DateIdeasWidget />

        {/* Love Language Quiz */}
        <div className="mt-14" id="love-language-quiz">
          <LoveLanguageQuiz />
        </div>

        {/* Partner's Quiz Results */}
        <div className="mt-8" id="partner-quiz-results">
          <PartnerQuizResults />
        </div>

        {/* Consolidated Quick Actions */}
        <QuickActionsFab
          onAddMemory={() => setShowCreateModal(true)}
          onOpenChat={() => setShowChat(true)}
          onSetupProfile={() => setShowProfileSetup(true)}
          showProfileSetupAction={!partnerId || !profile?.display_name}
          unreadCount={unreadCount}
          partnerTyping={partnerTyping}
        />

        {/* Enhanced Chat Side Panel */}
    {!showChat && (
          <ChatLauncher
            onOpenChat={() => {
              setShowChat(true);
              if (!chatOpenedOnce) {
                setChatOpenedOnce(true);
                try { localStorage.setItem('chatOpenedOnce', '1'); } catch {}
              }
            }}
            highlight={!chatOpenedOnce}
      unreadCount={unreadCount}
      partnerTyping={partnerTyping}
      isOnline={isOnline}
          />
        )}
        {showChat && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity animate-fade-in"
              aria-label="Close chat"
              tabIndex={-1}
              onClick={() => setShowChat(false)}
            />
            {/* Side Panel */}
            <ChatSidePanel
              open={showChat}
              onClose={() => setShowChat(false)}
              partnerId={partnerId}
              setShowProfileSetup={setShowProfileSetup}
            />
          </>
        )}

      </div>

      {/* Modals */}
      <CreateMemoryModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
      <ProfileSetup 
        open={showProfileSetup} 
        onOpenChange={setShowProfileSetup} 
      />
    </div>
  );
};

export default Dashboard;