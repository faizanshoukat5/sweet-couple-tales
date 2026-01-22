import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Play, Pause, Square } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onVoiceMessageSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onVoiceMessageSend,
  onCancel,
  isRecording,
  setIsRecording
}) => {
  const { toast } = useToast();
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request microphone permission and start recording
  const startRecording = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Not Supported",
          description: "Voice recording is not supported in this browser.",
          variant: "destructive"
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setHasRecording(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error: unknown) {
      console.error('Error accessing microphone:', error);
      
      const err = error as Error;
      let message = "Could not access microphone. Please check permissions.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = "Microphone access denied. Please allow microphone permission in your browser settings, then try again.";
      } else if (err.name === 'NotFoundError') {
        message = "No microphone found. Please connect a microphone and try again.";
      } else if (err.name === 'NotReadableError') {
        message = "Microphone is already in use by another application.";
      }
      
      toast({
        title: "Microphone Error",
        description: message,
        variant: "destructive"
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  // Play/pause recorded audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Send voice message
  const sendVoiceMessage = () => {
    if (audioBlob) {
      onVoiceMessageSend(audioBlob, recordingTime);
      cleanup();
    }
  };

  // Cancel and cleanup
  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    cleanup();
    onCancel();
  };

  // Cleanup function
  const cleanup = () => {
    setHasRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    setAudioBlob(null);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Setup audio element event listeners
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleEnded = () => setIsPlaying(false);
      const handlePause = () => setIsPlaying(false);
      
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('pause', handlePause);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
      {/* Audio element for playback */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}
      
      {/* Recording/Playback Controls */}
      {!hasRecording ? (
        <>
          {/* Record Button */}
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            className="rounded-full"
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          {/* Recording Timer */}
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}
          
          {/* Recording Instructions */}
          {!isRecording && (
            <span className="text-sm text-muted-foreground">
              Tap to record voice message
            </span>
          )}
        </>
      ) : (
        <>
          {/* Play/Pause Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
            className="rounded-full"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          {/* Duration Display */}
          <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          
          {/* Waveform Placeholder */}
          <div className="flex items-center gap-1 flex-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-primary/60 rounded-full transition-all ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${Math.random() * 16 + 8}px`
                }}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {hasRecording && (
          <Button
            variant="romantic"
            size="sm"
            onClick={sendVoiceMessage}
            className="rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={cancelRecording}
          className="rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
