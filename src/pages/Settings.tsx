import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Heart, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import SelectPartner from '@/components/SelectPartner';

const Settings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    display_name: '',
    partner_name: '',
    relationship_start_date: null,
    avatar_url: '',
  });
  const [partnerId, setPartnerId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setProfileData({
          display_name: data.display_name || '',
          partner_name: data.partner_name || '',
          relationship_start_date: data.relationship_start_date ? new Date(data.relationship_start_date) : null,
          avatar_url: data.avatar_url || '',
        });
      }
      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .maybeSingle();
      if (coupleData) {
        const otherId = coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id;
        setPartnerId(otherId);
      }
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updateData = {
        user_id: user.id,
        display_name: profileData.display_name,
        partner_name: profileData.partner_name,
        relationship_start_date: profileData.relationship_start_date
          ? format(profileData.relationship_start_date, 'yyyy-MM-dd')
          : null,
        avatar_url: profileData.avatar_url,
      };
      const { error } = await supabase
        .from('profiles')
        .upsert(updateData, {
          onConflict: 'user_id'
        });
      if (error) throw error;
      if (partnerId) {
        const { error: coupleError } = await supabase
          .from('couples')
          .upsert({
            user1_id: user.id,
            user2_id: partnerId,
            requested_by: user.id,
            status: 'accepted'
          }, { onConflict: 'user1_id,user2_id' });
        if (coupleError) throw coupleError;
      }
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || (typeof error === 'string' ? error : JSON.stringify(error)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md h-[90vh] bg-card rounded-xl shadow-romantic overflow-hidden flex flex-col">
        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto p-6">
          <form className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-base font-medium">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="display_name"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Enter your name"
                  className="pl-10"
                />
              </div>
            </div>
            {/* Partner Selection */}
            <div className="space-y-2">
              <Label htmlFor="partner_id" className="text-base font-medium">Select Your Partner</Label>
              <SelectPartner onSelect={setPartnerId} />
            </div>
            {/* Partner Name */}
            <div className="space-y-2">
              <Label htmlFor="partner_name" className="text-base font-medium">Partner's Name</Label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="partner_name"
                  value={profileData.partner_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, partner_name: e.target.value }))}
                  placeholder="Enter your partner's name"
                  className="pl-10"
                />
              </div>
            </div>
            {/* Relationship Start Date */}
            <div className="space-y-2">
              <Label className="text-base font-medium">When did your love story begin?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !profileData.relationship_start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {profileData.relationship_start_date
                      ? format(profileData.relationship_start_date, "PPP")
                      : "Select your anniversary"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={profileData.relationship_start_date || undefined}
                    onSelect={(date) => setProfileData(prev => ({ ...prev, relationship_start_date: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatar_url" className="text-base font-medium">Profile Picture URL (optional)</Label>
              <Input
                id="avatar_url"
                type="url"
                value={profileData.avatar_url}
                onChange={(e) => setProfileData(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://example.com/your-photo.jpg"
              />
              {profileData.avatar_url && (
                <div className="mt-2">
                  <img
                    src={profileData.avatar_url}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </form>
        </div>
        {/* Sticky button row at bottom */}
        <div className="sticky bottom-0 bg-card p-4 border-t border-border z-10">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => window.location.href = '/dashboard'} className="flex-1">Cancel</Button>
            <Button type="button" disabled={loading} className="flex-1 bg-gradient-romantic text-white" onClick={handleSave}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
