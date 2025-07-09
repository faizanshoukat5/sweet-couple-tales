import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMemories } from '@/hooks/useMemories';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Heart, Calendar, Tag, Search, Grid, List, Download, Bell, BellOff } from 'lucide-react';
import CreateMemoryModal from '@/components/CreateMemoryModal';
import MemoryCard from '@/components/MemoryCard';
import ProfileSetup from '@/components/ProfileSetup';

const Dashboard = () => {
  const { user } = useAuth();
  const { memories, loading, exportMemories } = useMemories();
  const { permission, requestPermission, sendInstantNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = !searchTerm || 
      memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || memory.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const favoriteMemories = filteredMemories.filter(memory => memory.is_favorite);
  const allTags = [...new Set(memories.flatMap(memory => memory.tags))];

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
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Sweet Couple Tales
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email?.split('@')[0]}! ✨
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={exportMemories}
                disabled={memories.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handleNotificationToggle}
                className={permission === 'granted' ? 'text-primary' : ''}
              >
                {permission === 'granted' ? (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications On
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowProfileSetup(true)}
              >
                Profile Setup
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-romantic text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Memory
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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