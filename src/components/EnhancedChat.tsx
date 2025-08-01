import * as React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Send, Check, CheckCheck, Circle, Smile, Paperclip, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  is_read?: boolean;
  delivered_at?: string | null;
  read_at?: string | null;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // UUID validation function
  const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!user?.id || !partnerId) return;
    
    const unreadMessages = messages.filter(
      msg => msg.sender_id === partnerId && !msg.is_read
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg.id);
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        } as any)
        .in('id', messageIds);
      
      if (!error) {
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) 
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        ));
        setUnreadCount(0);
      }
    }
  }, [user?.id, partnerId, messages]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (typing: boolean) => {
    if (!user?.id || !isValidUUID(partnerId)) return;
    
    const channel = supabase.channel(`typing-${user.id}-${partnerId}`);
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

  // Handle typing
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

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id || !isValidUUID(partnerId)) return;
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("timestamp", { ascending: true });
      
      if (!error && data) {
        setMessages(data as Message[]);
        
        // Count unread messages
        const unread = data.filter((msg: any) => 
          msg.sender_id === partnerId && !msg.is_read
        ).length;
        setUnreadCount(unread);
        
        // Mark messages as read after a delay
        setTimeout(() => markMessagesAsRead(), 1000);
      }
    };
    
    fetchMessages();
  }, [user?.id, partnerId, markMessagesAsRead]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;

    const messageChannel = supabase
      .channel("messages-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === user.id && msg.receiver_id === partnerId) ||
            (msg.sender_id === partnerId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            
            // If message is from partner, increment unread count
            if (msg.sender_id === partnerId) {
              setUnreadCount(prev => prev + 1);
              // Auto-mark as read after delay
              setTimeout(() => markMessagesAsRead(), 2000);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMsg.id ? updatedMsg : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user?.id, partnerId, markMessagesAsRead]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;

    const typingChannel = supabase
      .channel(`typing-${partnerId}-${user.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id === partnerId) {
          setPartnerTyping(payload.payload.is_typing);
          
          if (payload.payload.is_typing) {
            setTimeout(() => setPartnerTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [user?.id, partnerId]);

  // Subscribe to online presence
  useEffect(() => {
    if (!user?.id || !isValidUUID(partnerId)) return;

    const presenceChannel = supabase
      .channel(`presence-${partnerId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setIsOnline(Object.keys(state).includes(partnerId));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === partnerId) setIsOnline(true);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === partnerId) setIsOnline(false);
      })
      .subscribe();

    // Track own presence
    if (user.id) {
      presenceChannel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
      });
    }

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id, partnerId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: partnerId,
      content: newMessage,
      timestamp,
      is_read: false,
      delivered_at: timestamp,
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: partnerId,
          content: optimisticMsg.content,
          timestamp: optimisticMsg.timestamp,
          delivered_at: timestamp,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...data as Message } : msg
      ));
      
    } catch (error) {
      console.error('Failed to send message:', error);
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
      return <Circle className="w-3 h-3 text-muted-foreground/50" />;
    }
    
    if (msg.read_at) {
      return <CheckCheck className="w-3 h-3 text-primary" />;
    } else if (msg.delivered_at) {
      return <Check className="w-3 h-3 text-muted-foreground" />;
    }
    
    return <Circle className="w-3 h-3 text-muted-foreground/50" />;
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
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-background/50 to-background space-y-3">
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
            
            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <div className="text-center text-xs text-muted-foreground my-4">
                    {formatMessageTime(msg.timestamp)}
                  </div>
                )}
                <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm break-words transition-all duration-200 ${
                      isOwn
                        ? "bg-gradient-romantic text-white rounded-br-md" 
                        : "bg-card text-card-foreground border rounded-bl-md"
                    }`} 
                    style={msg.id.startsWith('temp-') ? { opacity: 0.7, transform: 'scale(0.98)' } : {}}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
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
              <button type="button" className="p-1 hover:bg-muted rounded-full transition-colors">
                <Smile className="w-4 h-4 text-muted-foreground" />
              </button>
              <button type="button" className="p-1 hover:bg-muted rounded-full transition-colors">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
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
    </div>
  );
};

export default EnhancedChat;