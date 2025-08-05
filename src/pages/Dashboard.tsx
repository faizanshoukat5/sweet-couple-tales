import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMemories } from '@/hooks/useMemories';
import { useNotifications } from '@/hooks/useNotifications';
import { useImportantDates } from '@/hooks/useImportantDates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Heart, Calendar, Tag, Search, Grid, List, User } from 'lucide-react';
import CreateMemoryModal from '@/components/CreateMemoryModal';
import MemoryCard from '@/components/MemoryCard';
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
import { LoveLanguageQuiz, PartnerQuizResults } from '@/components';
import { useMoods } from '@/hooks/useMoods';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user } = useAuth();
  const { memories, loading } = useMemories();
  const { permission, sendInstantNotification, requestPermission } = useNotifications();
  const { dates: importantDates } = useImportantDates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAlbumBrowser, setShowAlbumBrowser] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [profile, setProfile] = useState<{ avatar_url?: string, display_name?: string } | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<{ display_name?: string; email?: string; avatar_url?: string } | null>(null);
  const location = useLocation();

  const { getMood, setMood } = useMoods();
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = !searchTerm || 
      memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || memory.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const favoriteMemories = filteredMemories.filter(memory => memory.is_favorite);
  const allTags = [...new Set(memories.flatMap(memory => memory.tags))];


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
      };
      const sectionId = sectionMap[hash];
      if (sectionId) {
        let attempts = 0;
        const scrollToSection = () => {
          const el = document.getElementById(sectionId) || document.querySelector(`.${sectionId}-section`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else if (attempts < 5) {
            attempts++;
            setTimeout(scrollToSection, 200);
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
        .select('user1_id, user2_id, status')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      console.log('Couples query result:', data, error);
      
      if (!error && Array.isArray(data) && data.length > 0) {
        const row = data[0];
        const otherId = row.user1_id === user.id ? row.user2_id : row.user1_id;
        console.log('Setting partner ID to:', otherId);
        setPartnerId(otherId);
      } else {
        console.log('No partner found or error occurred');
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
        {/* Profile & Partner Section */}
        <div className="mb-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white/80 rounded-2xl shadow-lg p-6 md:p-10 border border-primary/10">
          <div className="relative group">
            <img
              src={profile?.avatar_url || '/placeholder.svg'}
              alt="Your profile avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow-md group-hover:scale-105 transition-transform bg-muted"
              onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
              style={{ transition: 'box-shadow 0.2s' }}
            />
            <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white bg-green-400 shadow-md" title="You are online"></span>
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-4xl font-extrabold text-primary mb-2 flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-400 animate-pulse" />
              Your Memory Collection
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Welcome back, <span className="font-semibold text-primary">{profile?.display_name || user?.email?.split('@')[0]}</span>!<br />
              <span className="text-base">You have <span className="font-bold text-rose-500">{memories.length}</span> beautiful memories saved ✨</span>
            </p>
            {partnerProfile && (
              <div className="flex items-center gap-3 mt-3 bg-gradient-to-r from-rose-100 to-pink-50 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-sm text-muted-foreground">Partner:</span>
                {partnerProfile.avatar_url && (
                  <img
                    src={partnerProfile.avatar_url}
                    alt="Partner avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-rose-300 bg-muted shadow"
                    onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                    title={partnerProfile.display_name || partnerProfile.email}
                  />
                )}
                <span className="text-base font-semibold text-rose-600">
                  {partnerProfile.display_name || partnerProfile.email}
                </span>
                {/* Example: show online badge (replace with real status if available) */}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Online</span>
              </div>
            )}
          </div>
        </div>

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

        {/* Search and Filters */}
        <Card className="mb-10 shadow-xl border-0 bg-white/90">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-300 w-5 h-5" />
                <Input
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
              </div>
            </div>
            {allTags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Memory Tabs */}
        <div className="memory-section">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-10 bg-rose-50 rounded-xl shadow-inner">
              <TabsTrigger value="all" className="flex items-center gap-2 text-lg font-semibold text-rose-600 data-[state=active]:border-b-4 data-[state=active]:border-rose-400 transition-all">
                <Calendar className="w-5 h-5" />
                All Memories <span className="ml-1 bg-rose-100 text-rose-600 rounded-full px-2 py-0.5 text-xs font-bold">{filteredMemories.length}</span>
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
                        ? "Start creating your beautiful love story by adding your first memory!"
                        : "Try adjusting your search or filters to find what you're looking for."
                      }
                    </p>
                    <Button onClick={() => setShowCreateModal(true)} variant="romantic" className="px-6 py-3 text-lg rounded-full">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Memory
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-6"
                }>
                  {filteredMemories.map(memory => (
                    <MemoryCard 
                      key={memory.id} 
                      memory={memory} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
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
                <div className={
                  viewMode === 'grid' 
                    ? "grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-6"
                }>
                  {favoriteMemories.map(memory => (
                    <MemoryCard 
                      key={memory.id} 
                      memory={memory} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Goals List */}
        <div className="mt-14" id="goals">
          <Card className="bg-white/90 border-0 shadow-lg rounded-2xl p-6">
            <CardHeader className="flex flex-row items-center gap-3 mb-2">
              <span className="bg-rose-100 text-rose-600 rounded-full p-2"><Plus className="w-5 h-5" /></span>
              <CardTitle className="font-serif text-2xl font-bold text-rose-600">Your Shared Goals & Bucket List</CardTitle>
            </CardHeader>
            <GoalsList />
          </Card>
        </div>

        {/* Important Dates */}
        <div className="mt-14" id="dates">
          <Card className="bg-white/90 border-0 shadow-lg rounded-2xl p-6">
            <CardHeader className="flex flex-row items-center gap-3 mb-2">
              <span className="bg-rose-100 text-rose-600 rounded-full p-2"><Calendar className="w-5 h-5" /></span>
              <CardTitle className="font-serif text-2xl font-bold text-rose-600">Important Dates & Anniversaries</CardTitle>
            </CardHeader>
            <ImportantDates />
          </Card>
        </div>

        {/* Albums List - Enhanced */}
        <div className="mt-14" id="albums">
          <div className="relative bg-gradient-to-br from-rose-50 via-white to-pink-100 rounded-2xl shadow-xl border-0 p-0 overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none opacity-30" style={{background: 'radial-gradient(circle at 80% 20%, #fbb6ce 0%, transparent 70%)'}} />
            <div className="relative z-10 p-8 pb-4">
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-rose-200 text-rose-700 rounded-full p-3 shadow"><Grid className="w-7 h-7" /></span>
                <div>
                  <h2 className="font-serif text-3xl font-extrabold text-rose-600 mb-1">Your Photo Albums</h2>
                  <p className="text-rose-500 text-base font-medium">Relive your favorite moments together</p>
                </div>
              </div>
              {/* Album carousel preview */}
              <div className="overflow-x-auto pb-2 mb-6 -mx-2">
                <div className="flex gap-6 px-2 min-w-[320px]">
                  {/* Replace with real album cards if available */}
                  <AlbumsList cardStyle="carousel" />
                  {/* Example placeholder cards if AlbumsList is empty */}
                  {/*
                  <div className="w-40 h-48 bg-white rounded-xl shadow flex flex-col items-center justify-center border border-rose-100 hover:shadow-lg transition-all cursor-pointer">
                    <img src="/placeholder.svg" alt="Album" className="w-24 h-24 object-cover rounded-lg mb-2" />
                    <span className="font-semibold text-rose-600">Anniversary</span>
                    <span className="text-xs text-muted-foreground mt-1">12 photos</span>
                  </div>
                  */}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="romantic" onClick={() => setShowAlbumBrowser(true)} className="rounded-full px-7 py-3 text-lg font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                  <Grid className="w-5 h-5 mr-1" />
                  View All Albums
                </Button>
              </div>
            </div>
            {showAlbumBrowser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full relative p-6">
                  <Button className="absolute top-2 right-2" size="icon" variant="ghost" onClick={() => setShowAlbumBrowser(false)}>
                    ✕
                  </Button>
                  <AlbumBrowser />
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Shared Calendar */}
        <div className="mt-14" id="calendar">
          <Card className="bg-white/90 border-0 shadow-lg rounded-2xl p-6">
            <CardHeader className="flex flex-row items-center gap-3 mb-2">
              <span className="bg-rose-100 text-rose-600 rounded-full p-2"><Calendar className="w-5 h-5" /></span>
              <CardTitle className="font-serif text-2xl font-bold text-rose-600">Shared Calendar</CardTitle>
            </CardHeader>
            <SharedCalendar />
          </Card>
        </div>

        {/* Love Notes Widget (moved here) */}
        <LoveNotesWidget />

        {/* Date Ideas Generator */}
        <DateIdeasWidget />

        {/* Love Language Quiz */}
        <div className="mt-14" id="love-language-quiz">
          <LoveLanguageQuiz partnerId={partnerId} />
        </div>

        {/* Partner's Quiz Results */}
        <div className="mt-8" id="partner-quiz-results">
          <PartnerQuizResults />
        </div>

        {/* Quick Actions Section */}
        <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4 items-end">
          {/* Add Memory Button */}
          <div className="group relative">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-white shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
              title="Add new memory"
            >
              <Plus className="w-7 h-7" />
            </Button>
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-rose-500 px-4 py-2 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-semibold">Add Memory</span>
          </div>
          {/* Chat Button */}
          <div className="group relative">
            <Button 
              onClick={() => setShowChat(true)} 
              variant="romantic" 
              className="rounded-full px-6 py-3 shadow-lg hover:scale-105 transition-all text-lg font-semibold flex items-center gap-2"
              title="Chat with your partner"
            >
              💬 Chat
            </Button>
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-rose-500 px-4 py-2 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-semibold">Open Chat</span>
          </div>
          {/* Profile Setup Button - shown when no partner or incomplete profile */}
          {(!partnerId || !profile?.display_name) && (
            <div className="group relative">
              <Button 
                onClick={() => setShowProfileSetup(true)} 
                variant="outline" 
                className="rounded-full px-6 py-3 shadow-lg hover:scale-105 transition-all bg-background border-primary text-rose-600 font-semibold flex items-center gap-2"
                title="Complete your profile and select partner"
              >
                <User className="w-5 h-5 mr-2" />
                Setup Profile
              </Button>
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-rose-500 px-4 py-2 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-semibold">Setup Profile</span>
            </div>
          )}
        </div>

        {/* Chat Modal - always mounted, toggled with CSS */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${showChat ? '' : 'hidden'}`}>
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full h-[600px] mx-4 relative flex flex-col">
            <Button 
              className="absolute top-4 right-4 z-10" 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowChat(false)}
            >
              ✕
            </Button>
            {partnerId === undefined ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Looking for your partner...</p>
              </div>
            ) : !partnerId ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Heart className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Partner Connected</h3>
                <p className="text-muted-foreground mb-6">
                  Complete your profile setup and select your partner to start chatting together!
                </p>
                <Button 
                  onClick={() => {
                    setShowChat(false);
                    setShowProfileSetup(true);
                  }}
                  variant="romantic"
                >
                  <User className="w-4 h-4 mr-2" />
                  Setup Profile & Partner
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <EnhancedChat partnerId={partnerId} />
              </div>
            )}
          </div>
        </div>
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