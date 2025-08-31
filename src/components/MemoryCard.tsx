import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Memory, useMemories } from '@/hooks/useMemories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Tag, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import EditMemoryModal from './EditMemoryModal';
import { useSignedMemoryPhotoUrls } from '@/hooks/useSignedMemoryPhotoUrls';
import { useResponsiveMemoryImage } from '@/hooks/useResponsiveMemoryImage';

export interface MemoryCardProps {
  memory: Memory;
  viewMode: 'grid' | 'list';
}

const MemoryCard = ({ memory, viewMode }: MemoryCardProps) => {
  const { toggleFavorite, deleteMemory } = useMemories();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Prepare memory photos (ensure cover photo is included) for signed URL resolution
  const photoInputs = useMemo(() => {
    const paths = [...memory.photos];
    if (memory.cover_photo && !paths.includes(memory.cover_photo)) {
      paths.unshift(memory.cover_photo); // prioritize cover for faster signed URL fetch
    }
    return paths.map(p => ({ url: p, memoryId: memory.id, memoryTitle: memory.title }));
  }, [memory]);
  const signed = useSignedMemoryPhotoUrls(photoInputs);

  const coverPath = memory.cover_photo || memory.photos[0];
  // Only fall back to raw path if it's already a full URL; avoid using storage path directly which breaks images
  const resolvedCover = coverPath ? (signed[coverPath] || (coverPath.startsWith('http') ? coverPath : undefined)) : undefined;
  const firstPhoto = resolvedCover;
  const storagePath = coverPath && !coverPath.startsWith('http') ? coverPath : undefined;
  const { srcset, fallback } = useResponsiveMemoryImage(storagePath);

  // Stable callbacks to prevent re-renders from affecting dropdown
  const handleToggleFavorite = useCallback(async () => {
    await toggleFavorite(memory.id, !memory.is_favorite);
  }, [memory.id, memory.is_favorite, toggleFavorite]);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await deleteMemory(memory.id);
      } catch (error) {
        console.error('Failed to delete memory:', error);
        setIsDeleting(false);
      }
    }
  }, [memory.id, deleteMemory]);

  const handleEditClick = useCallback(() => {
    setShowEditModal(true);
    setDropdownOpen(false);
  }, []);

  const handleDeleteClick = useCallback(() => {
    handleDelete();
    setDropdownOpen(false);
  }, [handleDelete]);

  const handleDropdownOpenChange = useCallback((open: boolean) => {
    setDropdownOpen(open);
  }, []);

  // Stable image handlers to prevent re-renders
  const handleImageLoad = useCallback(() => {
    setImageError(false);
    setImgLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Reset image loaded state when the source changes
  useEffect(() => {
    setImgLoaded(false);
  }, [firstPhoto, fallback]);

  if (viewMode === 'list') {
    return (
  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 bg-white/90 backdrop-blur rounded-lg border ring-1 ring-black/5 shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5">
        {/* Image */}
  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0" style={{width:48, height:48}}>
          {firstPhoto && !imageError ? (
            <>
              <img
                src={firstPhoto}
                alt={memory.title}
                className="w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-[1.02]"
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="80px"
                srcSet={srcset}
              />
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-gray-100 to-gray-200" />
              )}
              {fallback && (
                <img
                  src={fallback}
                  alt={memory.title}
                  className="absolute inset-0 w-full h-full object-cover -z-10"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Heart className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
  <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-gray-900 truncate">{memory.title}</h3>
              <p className="text-gray-600 text-xs line-clamp-2 mt-1">{memory.content}</p>
            </div>
            
            {/* Actions */}
            <div
              className={cn(
                "flex items-center gap-2 ml-4 z-10",
                dropdownOpen ? "" : ""
              )}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                className={cn(
                  "inline-flex items-center justify-center rounded-full p-1",
                  memory.is_favorite ? "text-red-500" : "text-gray-400"
                )}
                aria-pressed={memory.is_favorite}
                aria-label={memory.is_favorite ? 'Unfavorite memory' : 'Favorite memory'}
                title={memory.is_favorite ? 'Unfavorite' : 'Favorite'}
              >
                <Heart className={cn("w-4 h-4", memory.is_favorite && "fill-current")} />
              </button>
              
              <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-2 inline-flex items-center justify-center rounded-full p-1 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    onClick={(e) => { e.stopPropagation(); setDropdownOpen(true); }}
                    data-menu-trigger
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                    title="More actions"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={6}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target?.closest('[data-menu-trigger]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata */}
  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
  <Calendar className="w-4 h-4" />
              <span>{format(parseISO(memory.memory_date), 'MMM d, yyyy')}</span>
            </div>
            {memory.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <div className="flex gap-1">
                  {memory.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {memory.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{memory.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showEditModal && (
          <EditMemoryModal
            memory={memory}
            open={showEditModal}
            onOpenChange={setShowEditModal}
          />
        )}
      </div>
    );
  }

  // Grid view (compact)
  return (
  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
  <Card className="group relative overflow-hidden rounded-lg border ring-1 ring-black/5 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-transform duration-200">
      <div className="relative aspect-[3/4] sm:aspect-[3/4]">
        {firstPhoto && !imageError ? (
          <>
            <img
              src={firstPhoto}
              alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-400 ease-out will-change-transform group-hover:scale-[1.02]"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              srcSet={srcset}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-gray-100 to-gray-200" />
            )}
            {fallback && (
              <img
                src={fallback}
                alt={memory.title}
                className="absolute inset-0 w-full h-full object-cover -z-10"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </>
        ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Heart className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
  {/* Overlay (visual only) */}
  <div className="absolute inset-0 bg-black/8 opacity-0 group-hover:opacity-70 transition-opacity duration-200 pointer-events-none" />
        
        {/* Action buttons */}
        <div
          className={cn(
            "absolute top-2 right-2 flex gap-2 transition-opacity duration-200 z-10",
            dropdownOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          )}
        >
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
            className={cn(
              "inline-flex items-center justify-center rounded-full p-1 bg-white/90 backdrop-blur-sm shadow-sm",
              memory.is_favorite ? "text-red-500" : "text-gray-600"
            )}
            aria-label={memory.is_favorite ? "Remove from favorites" : "Add to favorites"}
            title={memory.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn("w-4 h-4", memory.is_favorite && "fill-current")} />
          </motion.button>
          
      <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange} modal={false}>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(true); }}
                data-menu-trigger
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                title="More actions"
              >
                <MoreHorizontal className={"w-4 h-4"} />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              sideOffset={6}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => {
                const target = e.target as HTMLElement;
                if (target?.closest('[data-menu-trigger]')) {
                  e.preventDefault();
                }
              }}
            >
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <CardContent className="p-2 sm:p-2">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{memory.title}</h3>
        <p className="text-gray-600 text-[11px] mb-1.5 line-clamp-2">{memory.content}</p>
        
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(parseISO(memory.memory_date), 'MMM d, yyyy')}</span>
          </div>
          
          {memory.tags.length > 0 && (
            <div className="flex gap-1">
              {memory.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {memory.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{memory.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {showEditModal && (
        <EditMemoryModal
          memory={memory}
          open={showEditModal}
          onOpenChange={setShowEditModal}
        />
      )}
    </Card>
    </motion.div>
  );
};

export default MemoryCard;