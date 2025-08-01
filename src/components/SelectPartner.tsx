import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, UserPlus, Check, X, Clock } from 'lucide-react';

interface PartnerRequest {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  requested_by: string;
  requested_at: string;
  profiles: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
}

const SelectPartner = ({ onSelect }: { onSelect: (partnerId: string) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PartnerRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PartnerRequest[]>([]);

  const fetchRequests = async () => {
    if (!user) return;

    // Fetch incoming requests
    const { data: incoming, error: incomingError } = await supabase
      .from('couples')
      .select('id, user1_id, user2_id, status, requested_by, requested_at')
      .eq('user2_id', user.id)
      .eq('status', 'pending')
      .neq('requested_by', user.id);

    if (!incomingError && incoming && incoming.length > 0) {
      // Fetch profiles for incoming requests
      const userIds = incoming.map(r => r.user1_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', userIds);

      const requestsWithProfiles = incoming.map(request => ({
        ...request,
        profiles: profiles?.find(p => p.user_id === request.user1_id) || {
          display_name: 'Unknown',
          email: 'Unknown',
          avatar_url: null
        }
      }));
      setPendingRequests(requestsWithProfiles as PartnerRequest[]);
    }

    // Fetch sent requests
    const { data: sent, error: sentError } = await supabase
      .from('couples')
      .select('id, user1_id, user2_id, status, requested_by, requested_at')
      .eq('user1_id', user.id)
      .eq('status', 'pending')
      .eq('requested_by', user.id);

    if (!sentError && sent && sent.length > 0) {
      // Fetch profiles for sent requests
      const userIds = sent.map(r => r.user2_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', userIds);

      const requestsWithProfiles = sent.map(request => ({
        ...request,
        profiles: profiles?.find(p => p.user_id === request.user2_id) || {
          display_name: 'Unknown',
          email: 'Unknown',
          avatar_url: null
        }
      }));
      setSentRequests(requestsWithProfiles as PartnerRequest[]);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const sendPartnerRequest = async () => {
    if (!user || !email.trim()) return;

    setLoading(true);
    try {
      // First, find the user by email
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('email', email.trim())
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!targetProfile) {
        toast({
          title: "User not found",
          description: "No user found with that email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (targetProfile.user_id === user.id) {
        toast({
          title: "Invalid request",
          description: "You cannot send a partner request to yourself.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if already partners or has pending request
      const { data: existingCouple, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetProfile.user_id}),and(user1_id.eq.${targetProfile.user_id},user2_id.eq.${user.id})`);

      if (coupleError) throw coupleError;

      if (existingCouple && existingCouple.length > 0) {
        const existing = existingCouple[0];
        if (existing.status === 'accepted') {
          toast({
            title: "Already partners",
            description: "You are already partners with this user.",
            variant: "destructive",
          });
        } else if (existing.status === 'pending') {
          toast({
            title: "Request pending",
            description: "There is already a pending request between you and this user.",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      // Create partner request
      const { error: insertError } = await supabase
        .from('couples')
        .insert({
          user1_id: user.id,
          user2_id: targetProfile.user_id,
          status: 'pending',
          requested_by: user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: "Partner request sent!",
        description: `Request sent to ${targetProfile.display_name || email}`,
      });

      setEmail('');
      fetchRequests();
    } catch (error) {
      console.error('Error sending partner request:', error);
      toast({
        title: "Error",
        description: "Failed to send partner request. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('couples')
        .update({
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: accept ? "Request accepted!" : "Request declined",
        description: accept 
          ? "You are now partners! You can chat and share memories together."
          : "The partner request has been declined.",
      });

      fetchRequests();
      if (accept) {
        // Get the partner ID and notify parent
        const request = pendingRequests.find(r => r.id === requestId);
        if (request) {
          onSelect(request.user1_id);
        }
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Send Partner Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your partner's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendPartnerRequest()}
            />
            <Button onClick={sendPartnerRequest} disabled={loading || !email.trim()}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Incoming Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {request.profiles.avatar_url && (
                    <img
                      src={request.profiles.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{request.profiles.display_name}</p>
                    <p className="text-sm text-muted-foreground">{request.profiles.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => respondToRequest(request.id, true)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondToRequest(request.id, false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Sent Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {request.profiles.avatar_url && (
                    <img
                      src={request.profiles.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{request.profiles.display_name}</p>
                    <p className="text-sm text-muted-foreground">{request.profiles.email}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SelectPartner;