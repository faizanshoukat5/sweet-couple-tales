import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
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

export function useRealtimeChat(partnerId: string | null) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sortedKey = user?.id && partnerId ? [user.id, partnerId].sort().join('-') : null;

  // Real-time unread count updates
  useEffect(() => {
    if (!user?.id || !partnerId || !sortedKey) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    // Initial fetch
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (!cancelled) setUnreadCount(count ?? 0);
    };

    fetchUnread();

    // Real-time updates for unread count
    const channel = supabase.channel(`unread-${sortedKey}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}))`
      }, (payload) => {
        if (cancelled) return;
        
        const row: any = payload.new ?? payload.old;
        if (!row) return;

        // Only update unread count for messages TO the current user
        if (row.receiver_id === user.id && row.sender_id === partnerId) {
          if (payload.eventType === 'INSERT' && !row.is_read) {
            setUnreadCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE' && row.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id, partnerId, sortedKey]);

  // Real-time typing indicator
  useEffect(() => {
    if (!user?.id || !partnerId || !sortedKey) {
      setPartnerTyping(false);
      return;
    }

    const channel = supabase
      .channel(`typing-${sortedKey}`)
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        if (payload?.payload?.user_id === partnerId) {
          setPartnerTyping(!!payload.payload.is_typing);
          
          // Clear typing indicator after 3 seconds
          if (payload.payload.is_typing) {
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setPartnerTyping(false);
            }, 3000);
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
          setConnectionStatus('disconnected');
        } else {
          setConnectionStatus('connecting');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user?.id, partnerId, sortedKey]);

  // Real-time presence tracking
  useEffect(() => {
    if (!user?.id || !partnerId || !sortedKey) {
      setIsOnline(false);
      return;
    }

    const presenceChannel = supabase.channel(`presence-${sortedKey}`, {
      config: { presence: { key: user.id } }
    });

    const updatePresence = () => {
      const state = presenceChannel.presenceState();
      const partnerPresent = !!state[partnerId]?.length;
      setIsOnline(partnerPresent);
    };

    presenceChannel
      .on('presence', { event: 'sync' }, updatePresence)
      .on('presence', { event: 'join' }, updatePresence)  
      .on('presence', { event: 'leave' }, updatePresence)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ 
            online_at: new Date().toISOString(),
            user_id: user.id
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id, partnerId, sortedKey]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!user?.id || !partnerId || !sortedKey) return;

    const channel = supabase.channel(`typing-${sortedKey}`);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        partner_id: partnerId,
        is_typing: isTyping,
        timestamp: new Date().toISOString(),
      },
    });
  }, [user?.id, partnerId, sortedKey]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!user?.id || !partnerId) return;

    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', partnerId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    if (!unreadMessages || unreadMessages.length === 0) {
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
      setUnreadCount(0);
    }
  }, [user?.id, partnerId]);

  return {
    unreadCount,
    partnerTyping,
    isOnline,
    connectionStatus,
    sendTypingIndicator,
    markAsRead
  };
}