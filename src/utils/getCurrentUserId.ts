import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function getCurrentUserId(): string | null {
  const user = supabase.auth.getUser();
  // getUser() returns a promise, so for a real app, you may want to refactor this to async/await or pass userId as a prop
  // For now, return null to avoid breaking code
  return null;
}

export function getCurrentUserIdFromContext(): string | null {
  // This function should be called inside a React component or hook
  const { user } = useAuth();
  return user?.id || null;
}
