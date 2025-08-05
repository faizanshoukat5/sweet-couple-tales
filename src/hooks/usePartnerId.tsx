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
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .maybeSingle();
      if (error || !coupleData) {
        setPartnerId(null);
        return;
      }
      // Determine the partner's user id
      const otherId = coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id;
      setPartnerId(otherId);
    }
    fetchPartnerId();
  }, [user]);

  return partnerId;
}
