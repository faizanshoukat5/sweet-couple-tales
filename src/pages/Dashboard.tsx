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
import { Plus, Heart, Calendar, Tag, Search, Grid, List } from 'lucide-react';
import CreateMemoryModal from '@/components/CreateMemoryModal';
import MemoryCard from '@/components/MemoryCard';
import ProfileSetup from '@/components/ProfileSetup';
import GoalsList from '@/components/GoalsList';
import ImportantDates from '@/components/ImportantDates';
import AlbumsList from '@/components/AlbumsList';
import AlbumBrowser from '@/components/AlbumBrowser';
import SharedCalendar from '@/components/SharedCalendar';
import Chat from '@/components/Chat';
import { useLocation } from 'react-router-dom';
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
      const { data, error } = await supabase
        .from('couples')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      console.log('Couple fetch result:', { data, error });
      if (!error && Array.isArray(data) && data.length > 0) {
        // Find the first row where the other user is not the current user
        const row = data.find(
          (row) => row.user1_id === user.id || row.user2_id === user.id
        );
        if (row) {
          const otherId = row.user1_id === user.id ? row.user2_id : row.user1_id;
          setPartnerId(otherId);
          return;
        }
      }
      setPartnerId(null);
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          {/* Avatar Display */}
          <div className="relative">
            <img
              src={profile?.avatar_url || '/placeholder.svg'}
              alt="Your profile avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-primary bg-muted"
              onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
              style={{ transition: 'box-shadow 0.2s' }}
            />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Your Memory Collection
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.display_name || user?.email?.split('@')[0]}! You have {memories.length} beautiful memories saved ✨
            </p>
            {partnerProfile && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Partner:</span>
                {partnerProfile.avatar_url && (
                  <img
                    src={partnerProfile.avatar_url}
                    alt="Partner avatar"
                    className="w-8 h-8 rounded-full object-cover border bg-muted"
                    onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                )}
                <span className="text-base font-medium text-foreground">
                  {partnerProfile.display_name || partnerProfile.email}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search your memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                >
                  All
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
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
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                All Memories ({filteredMemories.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorites ({favoriteMemories.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredMemories.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No memories found</h3>
                    <p className="text-muted-foreground mb-6">
                      {memories.length === 0 
                        ? "Start creating your beautiful love story by adding your first memory!"
                        : "Try adjusting your search or filters to find what you're looking for."
                      }
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Memory
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-4"
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
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No favorite memories yet</h3>
                    <p className="text-muted-foreground">
                      Mark your most special memories as favorites by clicking the heart icon!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-4"
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
        <div className="mt-8" id="goals">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
            Your Shared Goals & Bucket List
          </h2>
          <GoalsList />
        </div>

        {/* Important Dates */}
        <div className="mt-8" id="dates">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
            Important Dates & Anniversaries
          </h2>
          <ImportantDates />
        </div>

        {/* Albums List */}
        <div className="mt-8" id="albums">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
            Your Photo Albums
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <AlbumsList />
            <Button variant="outline" onClick={() => setShowAlbumBrowser(true)}>
              View Albums
            </Button>
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

        {/* Shared Calendar */}
        <div className="mt-8" id="calendar">
          <SharedCalendar />
        </div>

        {/* Floating Action Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-romantic text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-40"
          title="Add new memory"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Add Chat Button/Section */}
        <div className="fixed bottom-24 right-6 z-40">
          <Button onClick={() => setShowChat(true)} variant="romantic">
            Open Chat
          </Button>
        </div>
        {showChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full relative p-6">
              <Button className="absolute top-2 right-2" size="icon" variant="ghost" onClick={() => setShowChat(false)}>
                ✕
              </Button>
              {partnerId === undefined ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Looking for your partner...</p>
                </div>
              ) : !partnerId ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-2 font-semibold text-lg">No partner found</p>
                  <p className="text-muted-foreground text-sm">Please select your partner in Profile Setup to start chatting.</p>
                </div>
              ) : (
                <Chat partnerId={partnerId} />
              )}
            </div>
          </div>
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