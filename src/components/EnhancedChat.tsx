import * as React from "react";
import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Send, Check, CheckCheck, Circle, Smile, Paperclip, Mic, Reply, Image, FileText, Download } from "lucide-react";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useToast } from "@/hooks/use-toast";
import { AttachmentUpload, AttachmentDisplay } from './AttachmentUpload';
import { VoiceRecorder } from './VoiceRecorder';
import { VoicePlayer } from './VoicePlayer';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { uploadVoiceMessage } from '@/utils/uploadVoiceMessage';

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

const EnhancedChat = ({ partnerId }: { partnerId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  // Emoji picker and attachment
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Voice recording
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  // Notification sound
  const notificationAudioRef = useRef<HTMLAudioElement>(null);
  // Swipe/slide-to-reply gesture handlers
  const swipeData = useRef<{startX: number, triggered: boolean}>({startX: 0, triggered: false});
  const handleMessageTouchStart = (e: React.TouchEvent, msg: Message) => {
    swipeData.current = { startX: e.touches[0].clientX, triggered: false };
  };
  const handleMessageTouchMove = (e: React.TouchEvent, msg: Message) => {
    const dx = e.touches[0].clientX - swipeData.current.startX;
    if (!swipeData.current.triggered && dx > 60) {
      setReplyToMessage(msg);
      swipeData.current.triggered = true;
    }
  };
  const handleMessageMouseDown = (e: React.MouseEvent, msg: Message) => {
    swipeData.current = { startX: e.clientX, triggered: false };
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - swipeData.current.startX;
      if (!swipeData.current.triggered && dx > 60) {
        setReplyToMessage(msg);
        swipeData.current.triggered = true;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
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
      return;
    }
    setSending(true);
    setIsTyping(false);
    sendTypingIndicator(false);
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
      <div className="flex flex-col h-full max-h-[600px]">
        <header className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm rounded-t-lg">
          <h2 className="font-serif text-xl font-bold text-primary">Private Messages</h2>
          <span className="text-muted-foreground text-sm">Chat with your partner 💕</span>
        </header>
        
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
          <div className="text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p>Please select a valid chat partner to start messaging.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-background rounded-lg shadow-sm border">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm rounded-t-lg">
        <div>
          <h2 className="font-serif text-xl font-bold text-primary">Private Messages</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
        <span className="text-muted-foreground text-sm">💕</span>
      </header>
      
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-background/50 to-background space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Start your conversation and share your thoughts! 💭</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.sender_id === user?.id;
            const showTimestamp = index === 0 || 
              new Date(msg.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000;
            // Find replied message if any
            const repliedMsg = msg.reply_to ? messages.find(m => m.id === msg.reply_to) : null;
            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <div className="text-center text-xs text-muted-foreground my-4">
                    {formatMessageTime(msg.timestamp)}
                  </div>
                )}
                <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm break-words transition-all duration-300 ease-out
                      ${isOwn ? "bg-gradient-romantic text-white rounded-br-md" : "bg-card text-card-foreground border rounded-bl-md"}
                      animate-fade-slide-in
                      ${msg.id.startsWith('temp-') ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}
                    `}
                    style={msg.id.startsWith('temp-') ? { filter: 'blur(0.5px)' } : {}}
                    onTouchStart={e => handleMessageTouchStart(e, msg)}
                    onTouchMove={e => handleMessageTouchMove(e, msg)}
                    onMouseDown={e => handleMessageMouseDown(e, msg)}
                  >
                    {/* Reply preview above message */}
                    {repliedMsg && (
                      <div className={`mb-1 px-2 py-1 rounded bg-muted text-xs ${isOwn ? 'text-white/80' : 'text-muted-foreground/80'}`}
                        style={{ borderLeft: `3px solid ${isOwn ? '#fff' : '#e11d48'}` }}>
                        <Reply className="inline w-3 h-3 mr-1 align-text-bottom" />
                        {repliedMsg.content.length > 40 ? repliedMsg.content.slice(0, 40) + '…' : repliedMsg.content}
                      </div>
                    )}
                    
                    {/* Attachment rendering using the new AttachmentDisplay */}

                    {/* Attachment rendering with lightbox for images */}
                    {msg.attachment_url && msg.attachment_type === 'image' ? (
                      <div className="mb-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div>
                              <AttachmentDisplay
                                url={msg.attachment_url}
                                filename={msg.attachment_filename || msg.attachment_name || 'attachment'}
                                fileType={msg.attachment_type || 'other'}
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
                              src={msg.attachment_url}
                              alt={msg.attachment_filename || msg.attachment_name || 'attachment'}
                              className="max-h-[80vh] max-w-full rounded-lg shadow-lg"
                              style={{ margin: '0 auto', display: 'block' }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : msg.attachment_url && msg.attachment_type === 'voice' ? (
                      <div className="mb-2">
                        <VoicePlayer
                          audioUrl={msg.attachment_url}
                          duration={msg.voice_duration || 0}
                          isOwn={isOwn}
                          className={isOwn ? 'bg-white/10' : 'bg-muted/50'}
                        />
                      </div>
                    ) : msg.attachment_url ? (
                      <div className="mb-2">
                        <AttachmentDisplay
                          url={msg.attachment_url}
                          filename={msg.attachment_filename || msg.attachment_name || 'attachment'}
                          fileType={msg.attachment_type || 'other'}
                          fileSize={msg.attachment_size || 0}
                          className="max-w-xs"
                        />
                      </div>
                    ) : null}
                    
                    {/* Message text */}
                    {msg.content && !msg.content.startsWith('📎') && !msg.content.startsWith('🎤') && !msg.attachment_url && (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                    <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                      isOwn ? "text-white/70" : "text-muted-foreground"
                    }`}>
                      {formatMessageTime(msg.timestamp)}
                      {getMessageStatusIcon(msg)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator */}
        {partnerTyping && (
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground border rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <footer className="p-4 border-t bg-card/50 backdrop-blur-sm rounded-b-lg">
        {/* Reply preview above input */}
        {replyToMessage && (
          <div className="flex items-center mb-3 px-3 py-2 rounded bg-muted/80 text-xs text-muted-foreground justify-between">
            <div className="flex items-center gap-2">
              <Reply className="w-4 h-4 text-primary" />
              <span className="max-w-[180px] truncate">{replyToMessage.content.length > 60 ? replyToMessage.content.slice(0, 60) + '…' : replyToMessage.content}</span>
            </div>
            <button type="button" className="ml-2 text-xs text-muted-foreground hover:text-destructive" onClick={() => setReplyToMessage(null)}>
              Cancel
            </button>
          </div>
        )}
        
        {/* Attachment upload area */}
        {showAttachments && (
          <div className="mb-3">
            <AttachmentUpload
              userId={user?.id || ''}
              partnerId={partnerId}
              onAttachmentUpload={handleAttachmentUpload}
            />
          </div>
        )}
        
        {/* Voice recorder area */}
        {showVoiceRecorder && (
          <div className="mb-3">
            <VoiceRecorder
              onVoiceMessageSend={handleVoiceMessageSend}
              onCancel={() => setShowVoiceRecorder(false)}
              isRecording={isRecordingVoice}
              setIsRecording={setIsRecordingVoice}
            />
          </div>
        )}
        <form
          className="flex gap-3"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full border border-border rounded-full px-4 py-3 pr-20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message..."
              disabled={sending}
              maxLength={500}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Emoji picker button */}
              <div className="relative">
                <button
                  type="button"
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                  onClick={() => setShowEmoji((v) => !v)}
                  aria-label="Pick emoji"
                >
                  <Smile className="w-4 h-4 text-muted-foreground" />
                </button>
                {showEmoji && (
                  <EmojiPicker
                    onSelect={(emoji) => {
                      setNewMessage((msg) => msg + emoji);
                      setShowEmoji(false);
                      inputRef.current?.focus();
                    }}
                    onClose={() => setShowEmoji(false)}
                  />
                )}
              </div>
              {/* Attachment button */}
              <button
                type="button"
                className={`p-1 hover:bg-muted rounded-full transition-colors ${showAttachments ? 'bg-muted' : ''}`}
                onClick={() => setShowAttachments(!showAttachments)}
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </button>
              {/* Voice record button */}
              <button
                type="button"
                className={`p-1 hover:bg-muted rounded-full transition-colors ${showVoiceRecorder || isRecordingVoice ? 'bg-muted' : ''}`}
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                aria-label="Record voice message"
              >
                <Mic className={`w-4 h-4 ${isRecordingVoice ? 'text-red-500' : 'text-muted-foreground'}`} />
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="romantic" 
            disabled={sending || !newMessage.trim()}
            className="rounded-full px-6 hover:scale-105 transition-transform flex items-center gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        {/* Character count */}
        {newMessage.length > 400 && (
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {500 - newMessage.length} characters remaining
          </p>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <p className="text-xs text-muted-foreground mt-2">
            Typing...
          </p>
        )}
      </footer>
      <audio ref={notificationAudioRef} src="/notification.mp3" preload="auto" />
    </div>
  );
};

export default EnhancedChat;