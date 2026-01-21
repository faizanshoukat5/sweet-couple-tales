import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  RotateCw, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  images?: string[]; // Optional array for gallery navigation
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  open,
  onClose,
  src,
  alt = "Image preview",
  images = [],
  currentIndex = 0,
  onNavigate,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when image changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  // Keyboard controls
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
        case "ArrowLeft":
          if (images.length > 1 && onNavigate) {
            onNavigate((currentIndex - 1 + images.length) % images.length);
          }
          break;
        case "ArrowRight":
          if (images.length > 1 && onNavigate) {
            onNavigate((currentIndex + 1) % images.length);
          }
          break;
        case "0":
          setScale(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, images.length, onClose, onNavigate]);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => {
      const newScale = Math.max(s - 0.5, 0.5);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = alt || `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(src, "_blank");
    }
  }, [src, alt]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || scale <= 1) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    },
    [isDragging, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile pinch-zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    },
    [handleZoomIn, handleZoomOut]
  );

  // Double-click to zoom
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
    }
  }, [scale, handleReset]);

  const hasMultipleImages = images.length > 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        ref={containerRef}
        className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black border-none overflow-hidden rounded-none"
        onPointerDownOutside={onClose}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">
          Use zoom controls or scroll to zoom. Drag to pan when zoomed. Press
          arrow keys to navigate.
        </DialogDescription>

        {/* Top toolbar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2 text-white/90 text-sm">
            {hasMultipleImages && (
              <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-white/80 text-sm min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={handleZoomIn}
              disabled={scale >= 5}
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={handleRotate}
            >
              <RotateCw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/10 h-9 w-9 hidden md:flex"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white/90 hover:text-white hover:bg-white/10 h-12 w-12 rounded-full"
              onClick={() =>
                onNavigate?.((currentIndex - 1 + images.length) % images.length)
              }
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white/90 hover:text-white hover:bg-white/10 h-12 w-12 rounded-full"
              onClick={() =>
                onNavigate?.((currentIndex + 1) % images.length)
              }
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </>
        )}

        {/* Image container */}
        <div
          className={cn(
            "w-full h-full flex items-center justify-center overflow-hidden",
            scale > 1 ? "cursor-grab" : "cursor-zoom-in",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-150"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              pointerEvents: "none",
            }}
            draggable={false}
          />
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          Scroll to zoom • Double-click to fit • Drag to pan
        </div>

        {/* Thumbnail strip for multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm max-w-[90vw] overflow-x-auto">
            {images.map((imgSrc, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate?.(idx)}
                className={cn(
                  "w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all",
                  idx === currentIndex
                    ? "border-white ring-2 ring-white/30"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={imgSrc}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;
