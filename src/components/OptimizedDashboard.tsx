import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMemories } from '@/hooks/useMemories';
import RomanticDecor from '@/components/RomanticDecor';
import SideGutterRain from '@/components/SideGutterRain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Heart, Calendar, Tag, Search, Grid, List, User, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import VirtualizedMemoryList from '@/components/VirtualizedMemoryList';
import { useChatStatus } from '@/hooks/useChatStatus';

// Memoized search filters to prevent re-computation
const MemoryFilters = memo(({ 
  searchTerm, 
  setSearchTerm, 
  selectedTag, 
  setSelectedTag, 
  allTags, 
  viewMode, 
  setViewMode,
  sortMode,
  setSortMode 
}: any) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search and view controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 shrink-0">
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

      {/* Tags and sort */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            All
          </Button>
          {allTags.slice(0, 8).map((tag: string) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
});

// Memoized memory list wrapper
const MemoryListContainer = memo(({ filteredMemories, viewMode }: any) => {
  if (filteredMemories.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No memories found.</p>
      </div>
    );
  }

  return <VirtualizedMemoryList items={filteredMemories} viewMode={viewMode} />;
});

export { MemoryFilters, MemoryListContainer };