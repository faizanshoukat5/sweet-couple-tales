
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

type WaveformStyle = 'classic' | 'organic' | 'animated';

interface VoicePlayerProps {
  audioUrl: string;
  duration?: number;
  className?: string;
  isOwn?: boolean;
  waveformStyle?: WaveformStyle;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  duration = 0,
  className = "",
  isOwn = false,
  waveformStyle = 'classic',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [isSeeking, setIsSeeking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();
  // For organic/animated waveform
  const organicHeights = useMemo(() => Array.from({ length: 16 }, () => 10 + Math.random() * 18), [audioUrl]);
  // For animated waveform
  const [animFrame, setAnimFrame] = useState(0);


  // Format time display
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  // Toggle play/pause
  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // Seek to a position
  const seekTo = (time: number) => {
    if (audioRef.current && audioDuration) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };


  // Setup audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (audio.currentTime && isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Animated waveform effect
  useEffect(() => {
    if (waveformStyle !== 'animated' || !isPlaying) return;
    const id = setInterval(() => setAnimFrame(f => (f + 1) % 32), 80);
    return () => clearInterval(id);
  }, [waveformStyle, isPlaying]);


  // Calculate progress percentage
  const progressPercentage = audioDuration > 0 && isFinite(audioDuration) && isFinite(currentTime) 
    ? (currentTime / audioDuration) * 100 
    : 0;

  // Render waveform bars
  const renderWaveform = () => {
    let bars = [];
    const count = isMobile ? 8 : 16;
    for (let i = 0; i < count; i++) {
      let height = 16;
      if (waveformStyle === 'classic') {
        height = Math.sin((i / count) * Math.PI * 2) * 8 + 16;
      } else if (waveformStyle === 'organic') {
        height = organicHeights[i];
      } else if (waveformStyle === 'animated') {
        // Animate with a moving sine wave
        height = Math.sin(((i + animFrame) / count) * Math.PI * 2) * 8 + 16;
      }
      const filled = (i / count) * 100 <= progressPercentage;
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-200 ${
            filled
              ? isOwn ? 'bg-white' : 'bg-primary'
              : isOwn ? 'bg-white/30' : 'bg-muted-foreground/30'
          }`}
          style={{ height: `${height}px` }}
        />
      );
    }
    return (
      <div className={`flex items-end gap-0.5 ${isMobile ? 'h-8' : 'h-10'}`}>{bars}</div>
    );
  };

  // Layout: stack vertically on mobile, horizontal on desktop
  return (
    <div className={`flex ${isMobile ? 'flex-col items-stretch gap-2 p-2' : 'items-center gap-3 p-3'} rounded-lg max-w-xs ${className}`}>
      {/* Audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Controls Row */}
      <div className={`flex ${isMobile ? 'justify-center gap-4 mb-1' : 'items-center gap-2'}`}>
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size={isMobile ? 'lg' : 'sm'}
          onClick={togglePlayback}
          className={`rounded-full ${isMobile ? 'p-4 text-xl' : 'p-2'} ${
            isOwn 
              ? 'hover:bg-white/20 text-white' 
              : 'hover:bg-muted text-foreground'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className={isMobile ? 'w-7 h-7' : 'w-4 h-4'} />
          ) : (
            <Play className={isMobile ? 'w-7 h-7 ml-0.5' : 'w-4 h-4 ml-0.5'} />
          )}
        </Button>
        {/* Seek Backward */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => seekTo(Math.max(0, currentTime - 5))} aria-label="Back 5 seconds">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        {/* Seek Forward */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => seekTo(Math.min(audioDuration, currentTime + 5))} aria-label="Forward 5 seconds">
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
        {/* Voice Icon */}
        <Volume2 className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'} ${isOwn ? 'text-white/80' : 'text-muted-foreground'}`} />
      </div>

      {/* Waveform/Progress Bar */}
      <div className="flex flex-col flex-1">
        <div className="w-full cursor-pointer" onClick={e => {
          // Seek on waveform click
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = (e as React.MouseEvent).clientX - rect.left;
          const percent = Math.max(0, Math.min(1, x / rect.width));
          seekTo(percent * audioDuration);
        }}>
          {renderWaveform()}
        </div>
        {/* Slider for seeking */}
        <Slider
          min={0}
          max={audioDuration || 1}
          step={0.01}
          value={[currentTime]}
          onValueChange={([val]) => setCurrentTime(val)}
          onValueCommit={([val]) => seekTo(val)}
          className="mt-1"
          aria-label="Seek audio"
        />
      </div>

      {/* Duration */}
      <span className={`text-xs font-mono ${
        isOwn ? 'text-white/80' : 'text-muted-foreground'
      } ${isMobile ? 'mt-1 self-end' : ''}`}>
        {audioDuration > 0 && isFinite(audioDuration) 
          ? `${formatTime(currentTime)} / ${formatTime(audioDuration)}`
          : formatTime(duration || 0)
        }
      </span>
    </div>
  );
};
