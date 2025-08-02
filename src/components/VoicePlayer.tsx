import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from './ui/button';

interface VoicePlayerProps {
  audioUrl: string;
  duration?: number;
  className?: string;
  isOwn?: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  duration = 0,
  className = "",
  isOwn = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Calculate progress percentage
  const progressPercentage = audioDuration > 0 && isFinite(audioDuration) && isFinite(currentTime) 
    ? (currentTime / audioDuration) * 100 
    : 0;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg max-w-xs ${className}`}>
      {/* Audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
        className={`rounded-full p-2 ${
          isOwn 
            ? 'hover:bg-white/20 text-white' 
            : 'hover:bg-muted text-foreground'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>
      
      {/* Voice Icon */}
      <Volume2 className={`w-4 h-4 ${isOwn ? 'text-white/80' : 'text-muted-foreground'}`} />
      
      {/* Waveform/Progress Bar */}
      <div className="flex-1 relative">
        {/* Background waveform */}
        <div className="flex items-center gap-0.5 h-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-colors ${
                (i / 12) * 100 <= progressPercentage
                  ? isOwn 
                    ? 'bg-white' 
                    : 'bg-primary'
                  : isOwn 
                    ? 'bg-white/30' 
                    : 'bg-muted-foreground/30'
              }`}
              style={{
                height: `${Math.sin((i / 12) * Math.PI * 2) * 8 + 12}px`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Duration */}
      <span className={`text-xs font-mono ${
        isOwn ? 'text-white/80' : 'text-muted-foreground'
      }`}>
        {audioDuration > 0 && isFinite(audioDuration) 
          ? `${formatTime(currentTime)} / ${formatTime(audioDuration)}`
          : formatTime(duration || 0)
        }
      </span>
    </div>
  );
};
