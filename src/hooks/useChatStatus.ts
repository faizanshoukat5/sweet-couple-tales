import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useChatStatus(partnerId: string | null) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const sortedKey = useMemo(() => {
    if (!user?.id || !partnerId) return null;
    return [user.id, partnerId].sort().join('-');
  }, [user?.id, partnerId]);

  // Fetch unread count initially and on changes
  useEffect(() => {
    if (!user?.id || !partnerId) { setUnreadCount(0); return; }
    let cancelled = false;
    async function fetchUnread() {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      if (!cancelled) setUnreadCount(count ?? 0);
    }
    fetchUnread();

    // Realtime subscription to message inserts/updates
    const channel = supabase.channel(`chat-unread-${sortedKey ?? 'anon'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        // Only refresh when relevant user/partner pair involved
        const row: any = payload.new ?? payload.old;
        if (!row) return;
        const involvesPair = (row.sender_id === partnerId && row.receiver_id === user.id) ||
                             (row.sender_id === user.id && row.receiver_id === partnerId);
        if (involvesPair) fetchUnread();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id, partnerId, sortedKey]);

  // Typing indicator via broadcast
  useEffect(() => {
    if (!user?.id || !partnerId || !sortedKey) { setPartnerTyping(false); return; }
    const channel = supabase
      .channel(`typing-${sortedKey}`)
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        if (payload?.payload?.user_id === partnerId) {
          setPartnerTyping(!!payload.payload.is_typing);
          if (payload.payload.is_typing) {
            setTimeout(() => setPartnerTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, partnerId, sortedKey]);

  // Presence: is partner online
  useEffect(() => {
    if (!user?.id || !partnerId || !sortedKey) { setIsOnline(false); return; }
    const presenceChannel = supabase.channel(`presence-${sortedKey}`, {
      config: { presence: { key: user.id } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const partnerPresent = !!state[partnerId]?.length;
        setIsOnline(partnerPresent);
      })
      .on('presence', { event: 'join' }, () => {
        const state = presenceChannel.presenceState();
        const partnerPresent = !!state[partnerId]?.length;
        setIsOnline(partnerPresent);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = presenceChannel.presenceState();
        const partnerPresent = !!state[partnerId]?.length;
        setIsOnline(partnerPresent);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(presenceChannel); };
  }, [user?.id, partnerId, sortedKey]);

  return { unreadCount, partnerTyping, isOnline };
}
