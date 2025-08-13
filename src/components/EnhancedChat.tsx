import * as React from "react";
import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { Heart, Send, Check, CheckCheck, Circle, Smile, Paperclip, Mic, Reply, Image, FileText, Download, MoreVertical, Phone, Video, Info, ArrowLeft } from "lucide-react";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useToast } from "@/hooks/use-toast";
import { AttachmentUpload, AttachmentDisplay } from './AttachmentUpload';
import { VoiceRecorder } from './VoiceRecorder';
import { VoicePlayer } from './VoicePlayer';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { uploadVoiceMessage } from '@/utils/uploadVoiceMessage';
import { getSignedChatAttachmentUrl } from '@/utils/getSignedChatAttachmentUrl';
import { chatHaptics, debouncedHaptic } from '@/utils/hapticFeedback';
import { cn } from "@/lib/utils";
import './EnhancedChatAnimations.css';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  is_read?: boolean;
  delivered_at?: string | null;
  read_at?: string | null;
  reply_to?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_filename?: string;
  attachment_size?: number;
  voice_duration?: number;
}

interface TypingIndicator {
  user_id: string;
  partner_id: string;
  is_typing: boolean;
  last_typed: string;
}


const useResolvedAttachmentUrl = (raw?: string) => {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!raw) { setUrl(null); return; }
    if (raw.startsWith('http')) { setUrl(raw); return; }
    getSignedChatAttachmentUrl(raw).then(setUrl).catch(() => setUrl(null));
  }, [raw]);
  return url;
};

const ChatAttachmentView = ({ msg, isOwn }: { msg: Message; isOwn: boolean }) => {
  const resolvedUrl = useResolvedAttachmentUrl(msg.attachment_url);
  const raw = msg.attachment_url;
  if (!raw) return null;
  const isPath = !raw.startsWith('http');
  const urlToUse = isPath ? resolvedUrl ?? '' : raw;

  if (isPath && !resolvedUrl) {
    return <div className="mb-2 text-xs text-muted-foreground">Loading attachment…</div>;
  }

  if (msg.attachment_type === 'image') {
    return (
      <div className="mb-2">
        <Dialog>
          <DialogTrigger asChild>
            <div>
              <AttachmentDisplay
                url={urlToUse}
                filename={msg.attachment_filename || msg.attachment_name || 'attachment'}
                fileType="image"
                fileSize={msg.attachment_size || 0}
                className="max-w-xs cursor-zoom-in"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-3xl flex items-center justify-center">
            <DialogTitle asChild>
              <VisuallyHidden>
                {msg.attachment_filename || msg.attachment_name || 'Image attachment'}
              </VisuallyHidden>
            </DialogTitle>
            <DialogDescription asChild>
              <VisuallyHidden>
                {`Full-size preview of image attachment: ${msg.attachment_filename || msg.attachment_name || 'attachment'}`}
              </VisuallyHidden>
            </DialogDescription>
            <img
              src={urlToUse}
              alt={msg.attachment_filename || msg.attachment_name || 'attachment'}
              className="max-h-[80vh] max-w-full rounded-lg shadow-lg"
              style={{ margin: '0 auto', display: 'block' }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  } else if (msg.attachment_type === 'voice') {
    return (
      <div className="mb-2">
        <VoicePlayer
          audioUrl={urlToUse}
          duration={msg.voice_duration || 0}
          isOwn={isOwn}
          className={isOwn ? 'bg-white/10' : 'bg-muted/50'}
        />
      </div>
    );
  } else {
    return (
      <div className="mb-2">
        <AttachmentDisplay
          url={urlToUse}
          filename={msg.attachment_filename || msg.attachment_name || 'attachment'}
          fileType={msg.attachment_type || 'other'}
          fileSize={msg.attachment_size || 0}
          className="max-w-xs"
        />
      </div>
    );
  }
};

const EnhancedChat = ({ partnerId }: { partnerId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile, isTablet, isTouchDevice, screenWidth, orientation } = useMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const notificationAudioRef = useRef<HTMLAudioElement>(null);
  
  // Enhanced UI state
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  
  // Advanced swipe gesture handling
  const swipeData = useRef<{
    startX: number; 
    startY: number; 
    triggered: boolean; 
    element: HTMLElement | null;
  }>({startX: 0, startY: 0, triggered: false, element: null});

  // Enhanced swipe gesture handlers for mobile
  const handleMessageTouchStart = (e: React.TouchEvent, msg: Message) => {
    if (!isTouchDevice) return;
    
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    swipeData.current = { 
      startX: touch.clientX, 
      startY: touch.clientY, 
      triggered: false, 
      element 
    };
    element.style.transition = 'none';
    
    // Light haptic feedback on touch start
    chatHaptics.swipeStart();
  };

  const handleMessageTouchMove = (e: React.TouchEvent, msg: Message) => {
    if (!swipeData.current.element || !isTouchDevice) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - swipeData.current.startX;
    const dy = touch.clientY - swipeData.current.startY;
    
    // Only trigger horizontal swipe if movement is primarily horizontal
    if (Math.abs(dy) > Math.abs(dx)) return;
    
    const element = swipeData.current.element;
    const isOwn = msg.sender_id === user?.id;
    
    // Constrain swipe direction based on message ownership
    if ((isOwn && dx > 0) || (!isOwn && dx < 0)) return;
    
    const maxSwipe = 100;
    const clampedDx = Math.max(-maxSwipe, Math.min(maxSwipe, Math.abs(dx)));
    
    element.style.transform = `translateX(${isOwn ? -clampedDx : clampedDx}px)`;
    
    // Add visual feedback for reply threshold
    const replyThreshold = 60;
    if (clampedDx > replyThreshold * 0.7) {
      element.classList.add('swipe-feedback');
    } else {
      element.classList.remove('swipe-feedback');
    }
    
    // Trigger reply when swipe threshold is reached
    if (!swipeData.current.triggered && clampedDx > replyThreshold) {
      setReplyToMessage(msg);
      swipeData.current.triggered = true;
      
      // Enhanced haptic feedback for reply action
      chatHaptics.swipeReply();
      
      // Brief visual feedback
      element.classList.add('swipe-success');
      setTimeout(() => element.classList.remove('swipe-success'), 200);
    }
  };

  const handleMessageTouchEnd = () => {
    if (swipeData.current.element) {
      const element = swipeData.current.element;
      element.style.transition = 'transform 0.2s ease-out';
      element.style.transform = 'translateX(0)';
      element.classList.remove('swipe-feedback', 'swipe-success');
      
      // Light haptic if gesture was cancelled
      if (!swipeData.current.triggered) {
        chatHaptics.swipeCancel();
      }
    }
    swipeData.current = {startX: 0, startY: 0, triggered: false, element: null};
  };

  // UUID validation function
  const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!user?.id || !partnerId) return;
    
    // Query for unread messages directly from database instead of using state
    const { data: unreadMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', partnerId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    
    if (fetchError || !unreadMessages || unreadMessages.length === 0) {
      setUnreadCount(0);
      return;
    }
    
    const messageIds = unreadMessages.map(msg => msg.id);
    const { error } = await supabase
      .from('messages')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .in('id', messageIds);
    
    if (!error) {
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) 
          ? { ...msg, is_read: true, read_at: new Date().toISOString() }
          : msg
      ));
      setUnreadCount(0);
    }
  }, [user?.id, partnerId]); // Removed messages dependency

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (typing: boolean) => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    
    const channelName = `typing-${[user.id, partnerId].sort().join('-')}`;
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        partner_id: partnerId,
        is_typing: typing,
        timestamp: new Date().toISOString()
      }
    });
  }, [user?.id, partnerId]);

  // Handle attachment upload via the new AttachmentUpload component
  const handleAttachmentUpload = async (url: string, filename: string, fileType: string, fileSize: number) => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    
    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Create optimistic message with attachment
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: partnerId,
      content: `📎 ${filename}`,
      timestamp,
      is_read: false,
      delivered_at: timestamp,
      attachment_url: url,
      attachment_type: fileType,
      attachment_name: filename,
      attachment_filename: filename,
      attachment_size: fileSize,
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);
    setShowAttachments(false);
    
    try {
      // Send to database with all attachment fields
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: partnerId,
          content: optimisticMsg.content,
          timestamp: optimisticMsg.timestamp,
          delivered_at: timestamp,
          attachment_url: url,
          attachment_type: fileType,
          attachment_name: filename,
          attachment_filename: filename,
          attachment_size: fileSize,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...data as Message } : msg
      ));
      
      toast({ title: "File uploaded", description: `${filename} sent successfully!` });
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast({
        title: "Upload failed", 
        description: "Could not upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle voice message upload
  const handleVoiceMessageSend = async (audioBlob: Blob, duration: number) => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    
    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Create optimistic message for voice
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: partnerId,
      content: `🎤 Voice message (${Math.floor(duration)}s)`,
      timestamp,
      is_read: false,
      delivered_at: timestamp,
      attachment_type: 'voice',
      voice_duration: duration,
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);
    setShowVoiceRecorder(false);
    
    try {
      // Upload voice message
      const voiceUrl = await uploadVoiceMessage(user.id, partnerId, audioBlob);
      
      if (!voiceUrl) {
        throw new Error('Failed to upload voice message');
      }
      
      // Send to database
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: partnerId,
          content: optimisticMsg.content,
          timestamp: optimisticMsg.timestamp,
          delivered_at: timestamp,
          attachment_url: voiceUrl,
          attachment_type: 'voice',
          voice_duration: duration,
        })
        .select()
        .single();

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...data as Message } : msg
      ));
      
      toast({ title: "Voice message sent", description: "Voice message sent successfully!" });
      
      // Play notification sound for successful upload
      if (notificationAudioRef.current) {
        notificationAudioRef.current.currentTime = 0;
        notificationAudioRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error handling voice message upload:', error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast({
        title: "Failed to send voice message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  }, [isTyping, sendTypingIndicator]);

  // Fetch messages (with polling fallback for real-time)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    const fetchMessages = async () => {
      if (!user?.id || !isValidUUID(partnerId)) return;
      
      console.log('Fetching messages between:', user.id, 'and', partnerId);
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("timestamp", { ascending: true });
      
      if (!error && data) {
        console.log('Fetched messages:', data);
        setMessages(data as Message[]);
        
        // Count unread messages
        const unread = data.filter((msg: any) => 
          msg.sender_id === partnerId && !msg.is_read
        ).length;
        setUnreadCount(unread);
        
        // Only mark as read if window is focused and tab is visible
        const markIfVisible = () => {
          if (document.visibilityState === 'visible' && document.hasFocus()) {
            markMessagesAsRead();
          }
        };
        markIfVisible();
        // Listen for visibility/focus changes while this chat is mounted
        const onVisibility = () => markIfVisible();
        window.addEventListener('focus', onVisibility);
        document.addEventListener('visibilitychange', onVisibility);
        // Cleanup listeners on unmount
        return () => {
          window.removeEventListener('focus', onVisibility);
          document.removeEventListener('visibilitychange', onVisibility);
        };
      } else {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
    intervalId = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user?.id, partnerId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;

    // Create consistent channel name for both users
    const channelName = `messages-${[user.id, partnerId].sort().join('-')}`;
    const messageChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages",
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('New message received:', payload);
          console.log('Current user ID:', user.id);
          console.log('Partner ID:', partnerId);
          const msg = payload.new as Message;
          console.log('Message sender:', msg.sender_id, 'Message receiver:', msg.receiver_id);
          
          setMessages((prev) => {
            const existingIndex = prev.findIndex((m) => m.id === msg.id);
            if (existingIndex !== -1) {
              // Replace the message if it exists (for updates)
              const updated = [...prev];
              updated[existingIndex] = msg;
              console.log('Message updated in state');
              return updated;
            }
            // Always return a new array reference
            console.log('Adding new message to state');
            return [...prev, msg];
          });
          
          // If message is from partner, increment unread count
        if (msg.sender_id === partnerId) {
          setUnreadCount(prev => prev + 1);
          // Play notification sound
          if (notificationAudioRef.current) {
            notificationAudioRef.current.currentTime = 0;
            notificationAudioRef.current.play();
          }
          // Only mark as read if window is focused and tab is visible
          if (document.visibilityState === 'visible' && document.hasFocus()) {
            markMessagesAsRead();
          }
        }
        }
      )
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "messages",
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMsg = payload.new as Message;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMsg.id ? updatedMsg : msg
          ));
        }
      )
      .subscribe((status, err) => {
        console.log(`Message subscription status for channel ${channelName}:`, status, err);
      });

    return () => {
      console.log(`Removing message channel: ${channelName}`);
      supabase.removeChannel(messageChannel);
    };
  }, [user?.id, partnerId]); // Removed markMessagesAsRead dependency

  // Subscribe to typing indicators
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;

    const channelName = `typing-${[user.id, partnerId].sort().join('-')}`;
    const typingChannel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id === partnerId) {
          setPartnerTyping(payload.payload.is_typing);
          if (payload.payload.is_typing) {
            setTimeout(() => setPartnerTyping(false), 3000);
          }
        }
      })
      .subscribe((status, err) => {
        console.log('Typing subscription status:', status, err);
      });

    return () => {
      console.log('Removing typing channel');
      supabase.removeChannel(typingChannel);
    };
  }, [user?.id, partnerId]);

  // Subscribe to online presence (robust)
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;

    const presenceChannelName = `presence-${[user.id, partnerId].sort().join('-')}`;
    const presenceChannel = supabase.channel(presenceChannelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('Presence sync:', state);
        // Both users must be present in the state for online to be true
        const userIds = [user.id, partnerId];
        const bothPresent = userIds.every(id => Object.keys(state).includes(id));
        setIsOnline(bothPresent);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key);
        // Re-evaluate online status on join
        const state = presenceChannel.presenceState();
        const userIds = [user.id, partnerId];
        const bothPresent = userIds.every(id => Object.keys(state).includes(id));
        setIsOnline(bothPresent);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key);
        // Re-evaluate online status on leave
        const state = presenceChannel.presenceState();
        const userIds = [user.id, partnerId];
        const bothPresent = userIds.every(id => Object.keys(state).includes(id));
        setIsOnline(bothPresent);
      })
      .subscribe((status, err) => {
        console.log('Presence subscription status:', status, err);
      });

    // Track own presence
    presenceChannel.track({
      user_id: user.id,
      online_at: new Date().toISOString(),
    });

    return () => {
      console.log('Removing presence channel');
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id, partnerId]);

  // Robust scroll to bottom when chat opens or messages first load
  useLayoutEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      // Force scroll to bottom synchronously after DOM updates
      container.scrollTop = container.scrollHeight;
      
      // Additional scroll using requestAnimationFrame for browser paint cycle
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
          
          // Final backup with messagesEndRef
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "instant" });
          }
        }
      });
    }
  }, [partnerId, messages.length]); // Trigger when partner changes or message count changes

  // Smart auto-scroll to bottom: only if user is near the bottom (for new messages)
  useEffect(() => {
    if (!messagesContainerRef.current || !messagesEndRef.current || messages.length === 0) return;
    
    const container = messagesContainerRef.current;
    const threshold = 120; // px from bottom to consider as "near bottom"
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    if (isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message with optimistic UI
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !user?.id) return;
    if (!isValidUUID(partnerId)) {
      toast({
        title: "Invalid partner",
        description: "Please select a valid chat partner.",
        variant: "destructive",
      });
      chatHaptics.error();
      return;
    }
    
    setSending(true);
    setIsTyping(false);
    sendTypingIndicator(false);
    
    // Haptic feedback for message sent
    chatHaptics.messageSent();
    
    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    // Add replyToMessage reference in optimistic message (optional: add reply_to field in Message type)
    const optimisticMsg: Message & { reply_to?: string } = {
      id: tempId,
      sender_id: user.id,
      receiver_id: partnerId,
      content: newMessage,
      timestamp,
      is_read: false,
      delivered_at: timestamp,
      ...(replyToMessage ? { reply_to: replyToMessage.id } : {}),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    setReplyToMessage(null);
    
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: partnerId,
          content: optimisticMsg.content,
          timestamp: optimisticMsg.timestamp,
          delivered_at: timestamp,
          ...(replyToMessage ? { reply_to: replyToMessage.id } : {}),
        })
        .select()
        .single();
      if (error) throw error;
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...data as Message } : msg
      ));
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
      chatHaptics.error();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (msg: Message) => {
    if (msg.sender_id !== user?.id) return null;

    if (msg.id.startsWith('temp-')) {
      return (
        <span title="Sending..." className="inline-flex items-center gap-1">
          <Circle className="w-3 h-3 text-muted-foreground/50" />
          <span className="sr-only">Sending...</span>
        </span>
      );
    }

    if (msg.read_at) {
      return (
        <span title="Read" className="inline-flex items-center gap-1">
          <CheckCheck className="w-3 h-3 text-primary" />
          <span className="text-xs text-primary/80">Read</span>
        </span>
      );
    } else if (msg.delivered_at) {
      return (
        <span title="Delivered" className="inline-flex items-center gap-1">
          <CheckCheck className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground/80">Delivered</span>
        </span>
      );
    }

    return (
      <span title="Sent" className="inline-flex items-center gap-1">
        <Check className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground/80">Sent</span>
      </span>
    );
  };

  if (!isValidUUID(partnerId)) {
    return (
      <div className={cn(
        "flex flex-col bg-background border border-border",
        isMobile ? "h-screen rounded-none" : "h-full max-h-[600px] rounded-xl shadow-lg"
      )}>
        <header className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Private Messages</h2>
              <p className="text-sm text-muted-foreground">Chat with your partner</p>
            </div>
          </div>
          <div className="text-2xl">💕</div>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Your Conversation</h3>
            <p className="text-muted-foreground">
              Select a partner to begin sharing your thoughts and feelings in a private space.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col bg-background border border-border overflow-hidden",
      isMobile ? "h-screen rounded-none" : "h-full max-h-[600px] rounded-xl shadow-lg",
      isFullscreen && "fixed inset-0 z-50 rounded-none"
    )}>
      {/* Enhanced Header */}
      <header className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-1">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={() => setIsFullscreen(false)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Partner Avatar & Status */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
              isOnline ? "bg-green-500" : "bg-gray-400"
            )}>
              {connectionStatus === 'connecting' && (
                <div className="w-full h-full rounded-full bg-yellow-500 animate-pulse" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">Your Partner</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {partnerTyping ? (
                  <span className="text-primary font-medium flex items-center gap-1">
                    <span>typing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </span>
                  </span>
                ) : isOnline ? (
                  "Online"
                ) : lastSeen ? (
                  `Last seen ${formatMessageTime(lastSeen)}`
                ) : (
                  "Offline"
                )}
              </p>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-primary-foreground rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <Button variant="ghost" size="sm" className="p-2 h-auto">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-auto">
                <Video className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 h-auto"
            onClick={() => setShowChatInfo(!showChatInfo)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </header>
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef} 
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          isMobile ? "px-3 py-2" : "px-4 py-4"
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No messages yet</h3>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Start your conversation and share your thoughts, feelings, and beautiful moments together! 💭✨
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.id;
              const prevMsg = messages[index - 1];
              const nextMsg = messages[index + 1];
              
              // Group messages by same sender within 5 minutes
              const showAvatar = !nextMsg || 
                nextMsg.sender_id !== msg.sender_id || 
                new Date(nextMsg.timestamp).getTime() - new Date(msg.timestamp).getTime() > 5 * 60 * 1000;
              
              const showTimestamp = !prevMsg || 
                new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 30 * 60 * 1000;
              
              const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
              const isLastInGroup = showAvatar;
              
              const repliedMsg = msg.reply_to ? messages.find(m => m.id === msg.reply_to) : null;

              return (
                <div key={msg.id} className="w-full">
                  {/* Timestamp Divider */}
                  {showTimestamp && (
                    <div className="flex items-center justify-center my-6">
                      <div className="flex-1 h-px bg-border"></div>
                      <div className="px-4 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground font-medium">
                        {formatMessageTime(msg.timestamp)}
                      </div>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div className={cn(
                    "flex items-end gap-2 group relative",
                    isOwn ? "justify-end" : "justify-start",
                    isMobile ? "mb-1" : "mb-2"
                  )}>
                    {/* Avatar for received messages */}
                    {!isOwn && (
                      <div className={cn(
                        "flex-shrink-0 transition-opacity",
                        showAvatar ? "opacity-100" : "opacity-0"
                      )}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div
                      className={cn(
                        "relative max-w-[85%] transition-all duration-200 ease-out cursor-pointer",
                        isMobile ? "max-w-[75%]" : "max-w-[70%]",
                        msg.id.startsWith('temp-') && "opacity-70 scale-95"
                      )}
                      onTouchStart={(e) => handleMessageTouchStart(e, msg)}
                      onTouchMove={(e) => handleMessageTouchMove(e, msg)}
                      onTouchEnd={handleMessageTouchEnd}
                      onClick={() => {
                        if (!isMobile) setReplyToMessage(msg);
                      }}
                    >
                      {/* Reply Preview */}
                      {repliedMsg && (
                        <div className={cn(
                          "mb-2 p-2 rounded-lg border-l-4 bg-muted/30 text-sm",
                          isOwn 
                            ? "border-white/30 text-white/80" 
                            : "border-primary text-muted-foreground"
                        )}>
                          <div className="flex items-center gap-1 mb-1">
                            <Reply className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {repliedMsg.sender_id === user?.id ? "You" : "Partner"}
                            </span>
                          </div>
                          <p className="truncate text-xs">
                            {repliedMsg.content.length > 50 
                              ? repliedMsg.content.slice(0, 50) + '…' 
                              : repliedMsg.content
                            }
                          </p>
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div className={cn(
                        "px-4 py-3 rounded-2xl shadow-sm break-words relative overflow-hidden",
                        "backdrop-blur-sm transition-all duration-200",
                        isOwn 
                          ? cn(
                              "bg-gradient-to-r from-primary to-primary/90 text-white shadow-primary/20",
                              isLastInGroup ? "rounded-br-md" : "",
                              isFirstInGroup ? "rounded-tr-2xl" : "rounded-tr-md"
                            )
                          : cn(
                              "bg-card border border-border/50 text-card-foreground shadow-black/5",
                              isLastInGroup ? "rounded-bl-md" : "",
                              isFirstInGroup ? "rounded-tl-2xl" : "rounded-tl-md"
                            ),
                        "hover:shadow-lg transition-shadow",
                        msg.id.startsWith('temp-') && "animate-pulse"
                      )}>
                        {/* Loading State for Temp Messages */}
                        {msg.id.startsWith('temp-') && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                        )}
                        
                        {/* Attachment Content */}
                        <ChatAttachmentView msg={msg} isOwn={isOwn} />
                        
                        {/* Text Content */}
                        {msg.content && !msg.content.startsWith('📎') && !msg.content.startsWith('🎤') && (
                          <p className={cn(
                            "text-sm leading-relaxed whitespace-pre-wrap break-words",
                            isOwn ? "text-white" : "text-foreground"
                          )}>
                            {msg.content}
                          </p>
                        )}
                        
                        {/* Message Footer */}
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-2 text-xs",
                          isOwn ? "text-white/70" : "text-muted-foreground"
                        )}>
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {getMessageStatusIcon(msg)}
                        </div>
                      </div>
                      
                      {/* Quick Reply Button (Desktop) */}
                      {!isMobile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
                            "transition-opacity duration-200 p-1 h-auto w-auto rounded-full",
                            "bg-background/80 backdrop-blur-sm border shadow-sm"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplyToMessage(msg);
                          }}
                        >
                          <Reply className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Avatar for sent messages */}
                    {isOwn && (
                      <div className={cn(
                        "flex-shrink-0 transition-opacity",
                        showAvatar ? "opacity-100" : "opacity-0"
                      )}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">Me</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {partnerTyping && (
              <div className="flex items-end gap-2 justify-start mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">typing</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>
      {/* Enhanced Input Section */}
      <footer className={cn(
        "border-t bg-card/80 backdrop-blur-lg",
        isMobile ? "p-3" : "p-4"
      )}>
        {/* Reply Preview */}
        {replyToMessage && (
          <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Replying to {replyToMessage.sender_id === user?.id ? 'yourself' : 'partner'}
                </p>
                <p className="text-sm text-foreground truncate">
                  {replyToMessage.content.length > 60 
                    ? replyToMessage.content.slice(0, 60) + '…' 
                    : replyToMessage.content
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto flex-shrink-0"
              onClick={() => setReplyToMessage(null)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        )}
        
        {/* Attachment Upload Area */}
        {showAttachments && (
          <div className="mb-3 p-3 rounded-lg border border-border/50 bg-muted/30">
            <AttachmentUpload
              userId={user?.id || ''}
              partnerId={partnerId}
              onAttachmentUpload={handleAttachmentUpload}
            />
          </div>
        )}
        
        {/* Voice Recorder Area */}
        {showVoiceRecorder && (
          <div className="mb-3 p-3 rounded-lg border border-border/50 bg-muted/30">
            <VoiceRecorder
              onVoiceMessageSend={handleVoiceMessageSend}
              onCancel={() => setShowVoiceRecorder(false)}
              isRecording={isRecordingVoice}
              setIsRecording={setIsRecordingVoice}
            />
          </div>
        )}
        
        {/* Input Form */}
        <form
          className="flex items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          {/* Main Input Container */}
          <div className="flex-1 relative">
            <div className={cn(
              "flex items-center bg-background border border-border rounded-full shadow-sm",
              "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
              "transition-all duration-200",
              newMessage.length > 400 && "border-warning ring-2 ring-warning/20"
            )}>
              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                className={cn(
                  "flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                  isMobile ? "py-3" : "py-3"
                )}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type your message..."
                disabled={sending}
                maxLength={500}
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
              />
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 pr-2">
                {/* Emoji Picker */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-2 h-auto rounded-full hover:bg-muted transition-colors",
                      showEmoji && "bg-muted"
                    )}
                    onClick={() => setShowEmoji(!showEmoji)}
                    disabled={sending}
                  >
                    <Smile className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  {showEmoji && (
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <EmojiPicker
                        onSelect={(emoji) => {
                          setNewMessage((prev) => prev + emoji);
                          setShowEmoji(false);
                          inputRef.current?.focus();
                        }}
                        onClose={() => setShowEmoji(false)}
                      />
                    </div>
                  )}
                </div>
                
                {/* Attachment Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-2 h-auto rounded-full hover:bg-muted transition-colors",
                    showAttachments && "bg-muted"
                  )}
                  onClick={() => {
                    setShowAttachments(!showAttachments);
                    setShowVoiceRecorder(false);
                  }}
                  disabled={sending}
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                </Button>
                
                {/* Voice Message Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-2 h-auto rounded-full hover:bg-muted transition-colors",
                    (showVoiceRecorder || isRecordingVoice) && "bg-muted"
                  )}
                  onClick={() => {
                    setShowVoiceRecorder(!showVoiceRecorder);
                    setShowAttachments(false);
                  }}
                  disabled={sending}
                >
                  <Mic className={cn(
                    "w-4 h-4",
                    isRecordingVoice ? "text-red-500 animate-pulse" : "text-muted-foreground"
                  )} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Send Button */}
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={cn(
              "rounded-full p-3 shadow-md transition-all duration-200",
              "bg-gradient-to-r from-primary to-primary/90",
              "hover:shadow-lg hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </Button>
        </form>
        
        {/* Footer Info */}
        <div className="flex items-center justify-between mt-2 px-1">
          {/* Character Count */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {newMessage.length > 400 && (
              <span className={cn(
                "font-medium transition-colors",
                newMessage.length > 450 ? "text-destructive" : "text-warning"
              )}>
                {500 - newMessage.length} characters left
              </span>
            )}
            {isTyping && (
              <span className="text-primary font-medium">Typing...</span>
            )}
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors",
              connectionStatus === 'connected' ? "bg-green-500" :
              connectionStatus === 'connecting' ? "bg-yellow-500 animate-pulse" :
              "bg-red-500"
            )} />
            <span className="capitalize">{connectionStatus}</span>
          </div>
        </div>
      </footer>
      
      {/* Notification Audio */}
      <audio 
        ref={notificationAudioRef} 
        src="/notification.mp3" 
        preload="auto" 
        className="hidden" 
      />
    </div>
  );
};

export default EnhancedChat;