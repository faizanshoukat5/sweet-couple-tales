import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Fetches the accepted partner's user ID for the current user from the couples table.
 * Returns null if not found or not set.
 */
export function usePartnerId(): string | null {
  const { user } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPartnerId() {
      if (!user) return setPartnerId(null);
      // Fetch the accepted couple relationship for the current user
      const { data: coupleData, error } = await supabase
        .from('couples')
        .select('id, user1_id, user2_id, status')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(1);
      if (error || !coupleData || coupleData.length === 0) {
        console.log('usePartnerId error:', error);
        setPartnerId(null);
        return;
      }
      // Take the first (most recent) couple relationship
      const couple = coupleData[0];
      // Determine the partner's user id
      const otherId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
      setPartnerId(otherId);
    }
    fetchPartnerId();
  }, [user]);

  return partnerId;
}
