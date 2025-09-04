import * as React from "react";
import { useEffect, useState, useRef, useCallback, useLayoutEffect, useMemo } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { Heart, Send, Check, CheckCheck, Circle, Smile, Paperclip, Mic, Reply, Image, FileText, Download, MoreVertical, ArrowLeft, Info, Bell, BellOff, Trash2, ChevronDown } from "lucide-react";
import "./EnhancedChatAnimations.css";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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

const EnhancedChat: React.FC<{ partnerId: string | null }> = ({ partnerId }) => {


const ChatAttachmentView = ({ msg, isOwn }: { msg: Message; isOwn: boolean }) => {
  const resolvedUrl = useResolvedAttachmentUrl(msg.attachment_url);
  const raw = msg.attachment_url;
  if (!raw) return null;
  const isPath = !raw.startsWith('http');
  const urlToUse = isPath ? (resolvedUrl ?? '') : raw;

  if (isPath && !resolvedUrl) {
    return <div className="mb-2 text-xs text-muted-foreground">Loading attachment…</div>;
  }

  if (msg.attachment_type === 'image') {
    return (
      <div className="mb-2">
        <Dialog>
          <DialogTrigger asChild>
            <div>
              <AttachmentDisplay url={urlToUse} filename={msg.attachment_filename || msg.attachment_name || 'image'} fileType={msg.attachment_type || 'image'} fileSize={msg.attachment_size || 0} />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="sr-only">Image preview</DialogTitle>
            <DialogDescription className="sr-only">Preview of attached image</DialogDescription>
            <img src={urlToUse} alt={msg.attachment_filename || 'image'} className="w-full h-auto" />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (msg.attachment_type === 'voice') {
    return (
      <div className="mb-2">
        <VoicePlayer audioUrl={urlToUse} duration={msg.voice_duration || 0} isOwn={isOwn} />
      </div>
    );
  }

  // Generic file link
  return (
    <div className="mb-2">
      <a
        href={urlToUse}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm underline hover:opacity-80"
      >
        <Paperclip className="w-4 h-4" />
        <span>{msg.attachment_filename || msg.attachment_name || 'Attachment'}</span>
      </a>
    </div>
  );
};
  
  // Enhanced UI state
  // Core chat state & refs
  const { user } = useAuth();
  const isMobile = useMobile();
  const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator && (navigator as any).maxTouchPoints > 0));
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [lastNewMessageId, setLastNewMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollToBottom = (smooth = true) => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
    } catch (e) {
      // ignore
    }
  };
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Emoji border density preference
  type ThemePack = 'off' | 'subtle' | 'extra' | 'valentine' | 'minimal' | 'spring' | 'winter' | 'autumn';
  const [themePack, setThemePack] = useState<ThemePack>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`chatTheme-${partnerId}`) : null;
      if (saved === 'off' || saved === 'subtle' || saved === 'extra' || saved === 'valentine' || saved === 'minimal' || saved === 'spring' || saved === 'winter' || saved === 'autumn') return saved;
    } catch (_e) { void 0; }
    return 'subtle';
  });
  useEffect(() => {
    try { localStorage.setItem(`chatTheme-${partnerId}`, themePack); } catch (_e) { void 0; }
  }, [themePack, partnerId]);

  // Derived shared items for Chat Info panel
  const sharedImages = useMemo(() => messages.filter(m => m.attachment_type === 'image' && m.attachment_url), [messages]);
  const sharedVoice = useMemo(() => messages.filter(m => m.attachment_type === 'voice' && m.attachment_url), [messages]);
  const sharedFiles = useMemo(() => messages.filter(m => m.attachment_url && m.attachment_type && !['image','voice'].includes(m.attachment_type)), [messages]);
  
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
    const channel = typingChannelRef.current;
    if (!channel) return; // wait until subscribed to avoid duplicate channels
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        partner_id: partnerId,
        is_typing: typing,
        timestamp: new Date().toISOString(),
      },
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
      if (!isMuted && notificationAudioRef.current) {
        notificationAudioRef.current.currentTime = 0;
        notificationAudioRef.current.play().catch(() => {});
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

  // Send message with optimistic UI
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !user?.id) return;
    if (!isValidUUID(partnerId)) {
      toast({ title: "Invalid partner", description: "Please select a valid chat partner.", variant: "destructive" });
      chatHaptics.error();
      return;
    }

    setSending(true);
    setIsTyping(false);
    sendTypingIndicator(false);
    chatHaptics.messageSent();

    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
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
      setMessages(prev => prev.map(msg => (msg.id === tempId ? { ...(data as Message) } : msg)));
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast({ title: "Failed to send message", description: "Please try again.", variant: "destructive" });
      chatHaptics.error();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Fetch messages (with polling fallback for real-time)
  useEffect(() => {
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
  const unread = (data as Message[]).filter((msg: Message) => 
          msg.sender_id === partnerId && !msg.is_read
        ).length;
        setUnreadCount(unread);
      } else {
        console.error('Error fetching messages:', error);
      }
    };
    // initial fetch
    fetchMessages();
    // reduce polling frequency when realtime is connected
    const pollMs = connectionStatus === 'connected' ? 10000 : 2000;
    const id = setInterval(fetchMessages, pollMs);
    return () => {
      clearInterval(id);
    };
  }, [user?.id, partnerId, connectionStatus]);

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
          const msg = payload.new as Message;
          setMessages((prev) => {
            const existingIndex = prev.findIndex((m) => m.id === msg.id);
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = msg;
              return updated;
            }
            return [...prev, msg];
          });
          // Flag the newest partner message for highlight and show FAB if scrolled up
          if (msg.sender_id === partnerId) {
            setLastNewMessageId(msg.id);
          }
          if (msg.sender_id === partnerId) {
            setUnreadCount(prev => prev + 1);
            if (!isMuted && notificationAudioRef.current) {
              notificationAudioRef.current.currentTime = 0;
              notificationAudioRef.current.play().catch(() => {});
            }
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
          const updatedMsg = payload.new as Message;
          setMessages(prev => prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg));
        }
      )
      .subscribe((status, err) => {
        console.log(`Message subscription status for channel ${channelName}:`, status, err);
        if (status === 'SUBSCRIBED') setConnectionStatus('connected');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setConnectionStatus('disconnected');
        else setConnectionStatus('connecting');
      });

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user?.id, partnerId, isMuted, markMessagesAsRead]);

  // Auto-scroll behavior: keep view at bottom when near it; show FAB when scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const nearBottom = () => {
      const threshold = 120; // px
      const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
      return distance < threshold;
    };

    // On new messages, scroll if user is near bottom
    if (nearBottom()) {
      // Use setTimeout to ensure DOM is fully rendered before scrolling
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          setShowScrollToBottom(false);
        }
      }, 100);
    } else {
      setShowScrollToBottom(true);
    }
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollToBottom(distance > 160);
    };

    const onWheel = (e: WheelEvent) => {
      // Prevent wheel events from bubbling up to parent elements
      e.stopPropagation();
    };

    const onTouchMove = (e: TouchEvent) => {
      // Allow natural touch scrolling but prevent parent scroll
      e.stopPropagation();
    };

    container.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });

    onScroll();
    return () => {
      container.removeEventListener('scroll', onScroll as EventListener);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Subscribe to typing indicators (single channel reused for send/receive)
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;

    const channelName = `typing-${[user.id, partnerId].sort().join('-')}`;
    const typingChannel = supabase.channel(channelName);
    typingChannelRef.current = typingChannel;
    let hideTimeout: NodeJS.Timeout | undefined;

    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id === partnerId) {
          setPartnerTyping(payload.payload.is_typing);
          if (payload.payload.is_typing) {
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => setPartnerTyping(false), 3000);
          }
        }
      })
      .subscribe((status, err) => {
        console.log('Typing subscription status:', status, err);
      });

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      typingChannelRef.current = null;
      supabase.removeChannel(typingChannel);
    };
  }, [user?.id, partnerId]);

  // Centralized visibility/focus listeners with cleanup
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    const markIfVisible = () => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        markMessagesAsRead();
      }
    };
    markIfVisible();
    const onFocus = () => markIfVisible();
    const onVisibilityChange = () => markIfVisible();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user?.id, partnerId, markMessagesAsRead]);

  // Prevent page scroll when chat is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isFullscreen]);

  // Prevent scroll restoration on chat open
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Prevent scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    };

    const handleLoad = () => {
      // Restore scroll restoration after load
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);
  // Enhanced Header
  const Header = () => {
    return (
  <header className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm border-bling">
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
        
        {/* Header Actions (clean, minimal) */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 rounded-full hover:bg-primary/10"
                title="Chat options"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem onClick={() => setShowChatInfo((v) => !v)}>
                <Info className="mr-2 h-4 w-4" />
                <span>Chat info</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setIsMuted((m) => !m);
                toast({ title: !isMuted ? 'Notifications muted' : 'Notifications unmuted' });
              }}>
                {isMuted ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                <span>{isMuted ? 'Unmute notifications' : 'Mute notifications'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowClearConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Clear chat…</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  };

  // Clear Chat Confirm Dialog
  const ClearChatDialog = () => {
    return (
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogTitle>Clear conversation?</DialogTitle>
          <DialogDescription>
            This will permanently remove all messages in this conversation from your view. This action cannot be undone.
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)} disabled={clearing}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              setClearing(true);
              try {
                if (!user?.id || !partnerId) throw new Error('Missing user or partner');
                // Delete the entire conversation for both directions
                const del1 = supabase
                  .from('messages')
                  .delete()
                  .match({ sender_id: user.id, receiver_id: partnerId });
                const del2 = supabase
                  .from('messages')
                  .delete()
                  .match({ sender_id: partnerId, receiver_id: user.id });
                const [{ error: e1 }, { error: e2 }] = await Promise.all([del1, del2]);
                if (e1 || e2) throw e1 || e2;
                setMessages([]);
                toast({ title: 'Chat cleared' });
              } catch (err) {
                console.error(err);
                toast({ title: 'Failed to clear chat', description: 'Please ensure database policies allow deleting messages.', variant: 'destructive' });
              } finally {
                setClearing(false);
                setShowClearConfirm(false);
              }
            }} disabled={clearing}>
              {clearing ? 'Clearing…' : 'Clear chat'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
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
          <CheckCheck className="w-3 h-3 text-primary drop-shadow-sm" />
          <span className="text-xs text-primary font-semibold">Read</span>
        </span>
      );
    } else if (msg.delivered_at) {
      return (
        <span title="Delivered" className="inline-flex items-center gap-1">
          <CheckCheck className="w-3 h-3 text-muted-foreground drop-shadow-sm" />
          <span className="text-xs text-muted-foreground font-semibold">Delivered</span>
        </span>
      );
    }

    return (
      <span title="Sent" className="inline-flex items-center gap-1">
        <Check className="w-3 h-3 text-muted-foreground drop-shadow-sm" />
        <span className="text-xs text-muted-foreground font-semibold">Sent</span>
      </span>
    );
  };

  if (!isValidUUID(partnerId)) {
    return (
      <div
        className={cn(
          "flex flex-col bg-background border border-border",
          isMobile
            ? "h-full min-h-0 rounded-none overflow-hidden"
            : "h-full max-h-[600px] rounded-xl shadow-lg"
        )}
      >
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
    <div
      className={cn(
        "relative flex flex-col bg-background border border-border overflow-hidden gradient-border gradient-border--subtle",
        isMobile ? "h-full min-h-0 rounded-none w-full" : "h-full max-h-[600px] rounded-xl shadow-lg",
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
      style={isFullscreen ? { height: '100svh', minHeight: '100svh', maxHeight: '100svh' } : undefined}
    >
      {/* Cute animated emoji border overlay (non-interactive) */}
      {themePack !== 'off' && (
        <div aria-hidden className={cn("emoji-border", themePack === 'subtle' ? "emoji-border--subtle" : "emoji-border--extra")}>          
          {(() => {
            const getEmojisForTheme = (theme: ThemePack) => {
              switch (theme) {
                case 'valentine':
                  return {
                    topBase: ['💖','❤️','💕','💗','💓','💞'],
                    topExtra: ['💘','💝','💟','�','🌸','�'],
                    bottomBase: ['💕','💘','❤️','💝','💓','💟'],
                    bottomExtra: ['�💗','💞','�','�','🌺','💮'],
                    leftBase: ['💖','💕','❤️','💗','💓'],
                    leftExtra: ['💘','💝','🌹','💐'],
                    rightBase: ['�💞','💟','💝','💗','💓'],
                    rightExtra: ['💖','❤️','🌸','💐']
                  };
                case 'minimal':
                  return {
                    topBase: ['●','○','■','□','▲','△'],
                    topExtra: ['◆','◇','★','☆','◆','◇'],
                    bottomBase: ['○','●','□','■','△','▲'],
                    bottomExtra: ['◇','◆','☆','★','◇','◆'],
                    leftBase: ['●','○','■','□','▲'],
                    leftExtra: ['◆','◇','★','☆'],
                    rightBase: ['△','▲','□','■','○'],
                    rightExtra: ['☆','★','◇','◆']
                  };
                case 'spring':
                  return {
                    topBase: ['🌸','🌺','🌷','🌹','🌼','🌻'],
                    topExtra: ['🌿','🍃','🌱','🌳','🌸','🌺'],
                    bottomBase: ['🌷','🌹','🌼','🌻','🌸','🌺'],
                    bottomExtra: ['🌿','🍃','🌱','🌳','🌷','🌹'],
                    leftBase: ['🌸','🌺','🌷','🌹','🌼'],
                    leftExtra: ['🌿','🍃','🌱','🌳'],
                    rightBase: ['🌻','🌼','🌹','🌷','🌺'],
                    rightExtra: ['🌱','🌳','🍃','🌿']
                  };
                case 'winter':
                  return {
                    topBase: ['❄️','🌨️','⛄','🧊','❄️','🌨️'],
                    topExtra: ['☃️','🧣','🎄','❄️','🌨️','⛄'],
                    bottomBase: ['🧊','❄️','🌨️','⛄','🧊','❄️'],
                    bottomExtra: ['☃️','🧣','🎄','❄️','🌨️','⛄'],
                    leftBase: ['❄️','🌨️','⛄','🧊','❄️'],
                    leftExtra: ['☃️','🧣','🎄'],
                    rightBase: ['🌨️','⛄','🧊','❄️','🌨️'],
                    rightExtra: ['🎄','🧣','☃️']
                  };
                case 'autumn':
                  return {
                    topBase: ['🍂','🍁','🌰','🍄','🍂','🍁'],
                    topExtra: ['🎃','🌾','🍯','🍂','🍁','🌰'],
                    bottomBase: ['🌰','🍂','🍁','🍄','🌰','🍂'],
                    bottomExtra: ['🎃','🌾','🍯','🍂','🍁','🌰'],
                    leftBase: ['🍂','🍁','🌰','🍄','🍂'],
                    leftExtra: ['🎃','🌾','🍯'],
                    rightBase: ['🍁','🌰','🍄','🍂','🍁'],
                    rightExtra: ['🍯','🌾','🎃']
                  };
                case 'extra':
                  return {
                    topBase: ['💖','🎀','🌸','💗','🎀','💞'],
                    topExtra: ['🌺','💐','💓','💟','🌷','🌸','💘'],
                    bottomBase: ['🌸','💘','🎀','💝','🌸','💓'],
                    bottomExtra: ['💮','💖','🎀','💗','🌺','💞'],
                    leftBase: ['💖','🌸','🎀','💗','🌸'],
                    leftExtra: ['💐','💝','🌷'],
                    rightBase: ['💘','🎀','💝','🌸','💞'],
                    rightExtra: ['💮','💗','🌸']
                  };
                default: // subtle
                  return {
                    topBase: ['💖','🎀','🌸','💗','🎀','💞'],
                    topExtra: [],
                    bottomBase: ['🌸','💘','🎀','💝','🌸','💓'],
                    bottomExtra: [],
                    leftBase: ['💖','🌸','🎀','💗','🌸'],
                    leftExtra: [],
                    rightBase: ['�','🎀','💝','🌸','💞'],
                    rightExtra: []
                  };
              }
            };

            const emojis = getEmojisForTheme(themePack);
            const animCycle = ['bob-y','bob-x','spin','bob-y','bob-x',''];
            const cls = (i: number) => `emoji ${animCycle[i % animCycle.length]}`.trim();

            const top = [...emojis.topBase, ...emojis.topExtra];
            const bottom = [...emojis.bottomBase, ...emojis.bottomExtra];
            const left = [...emojis.leftBase, ...emojis.leftExtra];
            const right = [...emojis.rightBase, ...emojis.rightExtra];

            return (
              <>
                <div className="emoji-row top">
                  {top.map((e, i) => (
                    <span key={`t-${i}`} className={cls(i)}>{e}</span>
                  ))}
                </div>
                <div className="emoji-row bottom">
                  {bottom.map((e, i) => (
                    <span key={`b-${i}`} className={cls(i)}>{e}</span>
                  ))}
                </div>
                <div className="emoji-col left">
                  {left.map((e, i) => (
                    <span key={`l-${i}`} className={cls(i)}>{e}</span>
                  ))}
                </div>
                <div className="emoji-col right">
                  {right.map((e, i) => (
                    <span key={`r-${i}`} className={cls(i)}>{e}</span>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
      <Header />

      {/* Clear Chat Confirm Dialog */}
      <ClearChatDialog />
      {/* Chat Info Slide-in Panel */}
      <div className={cn("fixed inset-0 z-[60]", showChatInfo ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!showChatInfo}
      >
        {/* Overlay */}
        <div
          className={cn("absolute inset-0 bg-black/30 transition-opacity", showChatInfo ? "opacity-100" : "opacity-0")}
          onClick={() => setShowChatInfo(false)}
        />
        {/* Panel */}
    <aside
          className={cn(
      "absolute right-0 top-0 h-full w-[88%] sm:w-[380px] bg-background border-l shadow-xl panel-gradient-border",
            "transition-transform duration-300",
            showChatInfo ? "translate-x-0" : "translate-x-full"
          )}
          role="dialog"
          aria-label="Chat info"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold">Chat info</h3>
              <p className="text-xs text-muted-foreground">Overview and shared content</p>
            </div>
            <Button variant="ghost" size="sm" className="p-2 h-8 w-8" onClick={() => setShowChatInfo(false)} aria-label="Close chat info">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Button>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-56px)]">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-xl font-bold">{messages.length}</div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-xl font-bold">{sharedImages.length}</div>
                <div className="text-xs text-muted-foreground">Photos</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-xl font-bold">{unreadCount}</div>
                <div className="text-xs text-muted-foreground">Unread</div>
              </div>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-xs text-muted-foreground">{isMuted ? 'Muted' : 'Active'}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsMuted(m => !m)}>
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </div>

            {/* Emoji border theme */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">Emoji border theme</div>
                  <div className="text-xs text-muted-foreground">Choose a decorative theme for the chat border</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'off' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('off')}
                >
                  Off
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'subtle' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('subtle')}
                >
                  Subtle
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'extra' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('extra')}
                >
                  Extra
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'valentine' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('valentine')}
                >
                  Valentine 💖
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'minimal' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('minimal')}
                >
                  Minimal ●
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'spring' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('spring')}
                >
                  Spring 🌸
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'winter' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('winter')}
                >
                  Winter ❄️
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-2 text-xs rounded-md border transition-colors',
                    themePack === 'autumn' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                  )}
                  onClick={() => setThemePack('autumn')}
                >
                  Autumn 🍂
                </button>
              </div>
            </div>

            {/* Shared Photos */}
            {sharedImages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold flex items-center gap-2"><Image className="w-4 h-4"/> Photos</div>
                  <span className="text-xs text-muted-foreground">{sharedImages.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {sharedImages.slice().reverse().slice(0, 9).map(img => (
                    <a key={img.id} href={img.attachment_url || '#'} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-md border">
                      <img src={img.attachment_url || ''} alt={img.attachment_filename || 'image'} className="w-full h-full object-cover"/>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Notes */}
            {sharedVoice.length > 0 && (
              <div>
                <div className="font-semibold flex items-center gap-2 mb-2"><Mic className="w-4 h-4"/> Voice notes</div>
                <div className="space-y-2">
                  {sharedVoice.slice().reverse().slice(0, 5).map(v => (
                    <div key={v.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="text-sm truncate">{v.content || 'Voice message'}</div>
                      <a className="text-xs inline-flex items-center gap-1 hover:underline" href={v.attachment_url || '#'} target="_blank" rel="noreferrer">
                        <Download className="w-3 h-3"/> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {sharedFiles.length > 0 && (
              <div>
                <div className="font-semibold flex items-center gap-2 mb-2"><FileText className="w-4 h-4"/> Files</div>
                <div className="space-y-2">
                  {sharedFiles.slice().reverse().slice(0, 7).map(f => (
                    <div key={f.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="text-sm truncate flex-1 mr-2">{f.attachment_filename || f.attachment_name || 'File'}</div>
                      <a className="text-xs inline-flex items-center gap-1 hover:underline" href={f.attachment_url || '#'} target="_blank" rel="noreferrer">
                        <Download className="w-3 h-3"/> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export chat */}
            <div className="pt-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  try {
                    const lines = messages.map(m => {
                      const who = m.sender_id === user?.id ? 'You' : 'Partner';
                      return `[${new Date(m.timestamp).toLocaleString()}] ${who}: ${m.content}`;
                    });
                    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chat-${new Date().toISOString().slice(0,10)}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    toast({ title: 'Export failed', description: 'Could not export chat', variant: 'destructive' });
                  }
                }}
              >
                Export chat (.txt)
              </Button>
            </div>
          </div>
        </aside>
      </div>
      {/* Messages Container */}
    <div 
        ref={messagesContainerRef} 
        className={cn(
      "flex-1 overflow-y-auto overflow-x-hidden border-bling-top",
          isMobile ? "px-2 py-3" : "px-4 py-4",
          "min-h-0" // Ensure flex child can shrink
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent',
          // Ensure proper scrolling isolation
          position: 'relative',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
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
          <div className="space-y-1 relative">
            {(() => {
              const firstUnreadIndex = messages.findIndex(m => m.sender_id === partnerId && !m.is_read);
              return messages.map((msg, index) => {
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
                      <div className="flex-1 divider-gradient"></div>
                      <div className="px-4 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground font-medium">
                        {formatMessageTime(msg.timestamp)}
                      </div>
                      <div className="flex-1 divider-gradient"></div>
                    </div>
                  )}

                  {/* Unread Divider */}
                  {unreadCount > 0 && index === firstUnreadIndex && (
                    <div className="flex items-center justify-center my-4">
                      <div className="flex-1 divider-gradient" />
                      <div className="mx-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        Unread messages
                      </div>
                      <div className="flex-1 divider-gradient" />
                    </div>
                  )}
                  
                  {/* Message */}
                  <div className={cn(
                    "flex items-end gap-2 group relative",
                    isOwn ? "justify-end" : "justify-start",
                    isMobile ? "mb-3" : "mb-2"
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
                        "relative max-w-[85%] transition-all duration-200 ease-out cursor-pointer animate-message-in",
                        isMobile ? "max-w-[75%]" : "max-w-[70%]",
                        msg.id.startsWith('temp-') && "scale-95"
                      )}
                      onTouchStart={(e) => handleMessageTouchStart(e, msg)}
                      onTouchMove={(e) => handleMessageTouchMove(e, msg)}
                      onTouchEnd={handleMessageTouchEnd}
                      onClick={() => {
                        if (!isMobile) setReplyToMessage(msg);
                      }}
                      data-new={(msg.id === lastNewMessageId && msg.sender_id === partnerId) ? 'true' : 'false'}
                    >
                      {/* Reply Preview */}
                      {repliedMsg && (
                        <div
                          className={cn(
                            "reply-preview mb-2 p-2 rounded-lg border-l-4 text-sm",
                            // Ensure high contrast regardless of theme
                            isOwn
                              ? "bg-primary/15 border-primary/60 text-foreground"
                              : "bg-muted/70 border-primary/60 text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Reply className="w-3 h-3" />
                            <span className="text-xs font-semibold">
                              {repliedMsg.sender_id === user?.id ? "You" : "Partner"}
                            </span>
                          </div>
                          <p className="truncate text-xs font-semibold opacity-100">
                            {repliedMsg.content.length > 50
                              ? repliedMsg.content.slice(0, 50) + "…"
                              : repliedMsg.content}
                          </p>
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div 
                        className={cn(
                          "message-bubble px-4 py-3 rounded-2xl shadow-sm break-words relative overflow-hidden",
                          "backdrop-blur-sm transition-all duration-200",
                          isOwn 
                            ? cn(
                                "bg-gradient-to-r from-primary to-primary/95 text-white shadow-primary/25",
                                isLastInGroup ? "rounded-br-md" : "",
                                isFirstInGroup ? "rounded-tr-2xl" : "rounded-tr-md"
                              )
                            : cn(
                                "bg-card border border-border/60 text-foreground shadow-black/10",
                                isLastInGroup ? "rounded-bl-md" : "",
                                isFirstInGroup ? "rounded-tl-2xl" : "rounded-tl-md"
                              ),
                          "hover:shadow-lg transition-shadow",
                          msg.id.startsWith('temp-') && "animate-pulse",
                          (msg.id === lastNewMessageId && msg.sender_id === partnerId) && "flash-recent"
                        )}
                        data-own={isOwn.toString()}
                        title={new Date(msg.timestamp).toLocaleString()}
                      >
                        {/* Loading State for Temp Messages */}
                        {msg.id.startsWith('temp-') && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        )}
                        
                        {/* Attachment Content */}
                        <ChatAttachmentView msg={msg} isOwn={isOwn} />
                        
                        {/* Text Content */}
                        {msg.content && !msg.content.startsWith('📎') && !msg.content.startsWith('🎤') && (
                          <p className={cn(
                            "text-sm leading-relaxed whitespace-pre-wrap break-words font-semibold",
                            isOwn ? "text-white drop-shadow-md" : "text-foreground"
                          )}>
                            {msg.content}
                          </p>
                        )}
                        
                        {/* Message Footer */}
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-2 text-xs font-semibold",
                          isOwn ? "text-white drop-shadow-md" : "text-muted-foreground"
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
            });
            })()}
            
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
            {/* Scroll to bottom FAB */}
            {showScrollToBottom && (
              <div className="sticky bottom-4 flex justify-end pointer-events-none">
                <Button
                  type="button"
                  variant="secondary"
                  className="pointer-events-auto shadow-md rounded-full px-3 py-2 bg-background/90 border backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:scale-105 transition-transform"
                  onClick={() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    if (document.visibilityState === 'visible' && document.hasFocus()) {
                      markMessagesAsRead();
                    }
                  }}
                  title="Jump to latest"
                >
                  <div className="relative flex items-center gap-2">
                    <ChevronDown className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>
      {/* Enhanced Input Section */}
      <footer className={cn(
        "border-t bg-card/80 backdrop-blur-lg flex-shrink-0 relative z-10",
        isMobile ? "p-2 pb-[max(10px,env(safe-area-inset-bottom))]" : "p-4"
      )}>
        {/* Reply Preview */}
        {replyToMessage && (
          <div className={cn(
            "flex items-center justify-between mb-3 p-3 rounded-lg bg-muted/50 border border-border/50",
            isMobile && "mb-2 p-2"
          )}>
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
          className={cn("flex items-end w-full overflow-hidden", isMobile ? "gap-2" : "gap-3")}
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        >
          {/* Main Input Container */}
          <div className="flex-1 relative">
            <div
              className={cn(
                "flex items-center bg-background border border-border rounded-full shadow-sm",
                "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
                "transition-all duration-200",
                newMessage.length > 400 && "border-warning ring-2 ring-warning/20"
              )}
            >
              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                className={cn(
                  "flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                  isMobile ? "px-3 py-2.5" : "px-4 py-3"
                )}
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                onFocus={() => setTimeout(() => scrollToBottom(false), 60)}
                autoCorrect="on"
                autoCapitalize="sentences"
              />

              {/* Action Buttons */}
              <div className={cn("flex items-center flex-shrink-0", isMobile ? "gap-1 pr-1" : "gap-1 pr-2")}> 
                {/* Emoji (desktop only) */}
                <div className="relative hidden md:block">
                  <Button type="button" variant="ghost" size="sm" className="p-2 h-auto rounded-full hover:bg-muted transition-colors" onClick={() => setShowEmoji(!showEmoji)} disabled={sending}>
                    <Smile className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  {showEmoji && (
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <EmojiPicker onSelect={(emoji) => { setNewMessage((prev) => prev + emoji); setShowEmoji(false); inputRef.current?.focus(); }} onClose={() => setShowEmoji(false)} />
                    </div>
                  )}
                </div>

                {/* Attachment (desktop only) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex p-2 h-auto rounded-full hover:bg-muted transition-colors"
                  onClick={() => { setShowAttachments(!showAttachments); setShowVoiceRecorder(false); }}
                  disabled={sending}
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                </Button>

                {/* Voice (desktop only) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("hidden md:inline-flex p-2 h-auto rounded-full hover:bg-muted transition-colors", (showVoiceRecorder || isRecordingVoice) && "bg-muted")}
                  onClick={() => { setShowVoiceRecorder(!showVoiceRecorder); setShowAttachments(false); }}
                  disabled={sending}
                >
                  <Mic className={cn("w-4 h-4", isRecordingVoice ? "text-red-500 animate-pulse" : "text-muted-foreground")} />
                </Button>

                {/* Send inside input (mobile only) */}
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={cn("md:hidden rounded-full ml-1 px-3 h-9 shadow-md text-white", sending ? "bg-primary/70" : "bg-primary hover:bg-primary/90")}
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Send Button (desktop/tablet only) */}
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={cn(
              "rounded-full p-3 shadow-md transition-all duration-200 hidden md:inline-flex",
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
        <div className={cn(
          "flex items-center justify-between px-1",
          isMobile ? "mt-1" : "mt-2"
        )}>
          {/* Character Count */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {newMessage.length > 400 && (
              <span className={cn(
                "font-medium transition-colors",
                newMessage.length > 450 ? "text-destructive" : "text-warning"
              )}>
                {500 - newMessage.length} left
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
