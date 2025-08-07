import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Heart, User, Smile, Image as ImageIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import SelectPartner from '@/components/SelectPartner';

const EMOJI_AVATARS = [
  '😊','😍','🥰','😘','😎','🤩','🥳','😇','😻','💖','💘','💝','💞','💕','💓','💗','','💚','💛','🧡','💜','🖤','🤍','🤎','💋','🌹','🌸','🌻','🌼','🌺','🌷','🌟','✨','🎉','🎊','🎈','🎀','🎁','👩‍❤️‍👨','👩‍❤️‍👩','👨‍❤️‍👨'
];

interface ProfileSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


interface ProfileData {
  display_name: string;
  partner_name: string;
  relationship_start_date: Date | null;
  avatar_url: string;
  avatar_emoji: string;
  first_goal: string;
}

const ProfileSetup = ({ open, onOpenChange }: ProfileSetupProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string>(''); // Separate state for partnerId
  const [avatarError, setAvatarError] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    partner_name: '',
    relationship_start_date: null,
    avatar_url: '',
    avatar_emoji: '',
    first_goal: '',
  });

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData({
          display_name: data.display_name || '',
          partner_name: data.partner_name || '',
          relationship_start_date: data.relationship_start_date ? new Date(data.relationship_start_date) : null,
          avatar_url: data.avatar_url || '',
          avatar_emoji: data.avatar_emoji || '',
          first_goal: data.first_goal || '',
        });
      }
      // Fetch couple relationship
      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .maybeSingle();
      if (coupleData) {
        const otherId = coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id;
        setPartnerId(otherId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      setInitialLoading(true);
      fetchProfile();
    }
  }, [open, user]);

  const [validationError, setValidationError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!user) return;

    // Validate required fields
    if (!profileData.display_name || (!profileData.avatar_emoji && !profileData.avatar_url) || !partnerId || !profileData.partner_name || !profileData.relationship_start_date) {
      setValidationError('Please fill in all required fields.');
      return;
    }

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
        avatar_emoji: profileData.avatar_emoji,
        first_goal: profileData.first_goal,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Couple relationship logic: upsert into couples table
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

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Welcome Banner */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-2 text-2xl font-bold text-rose-500">
            <Heart className="w-7 h-7 animate-pulse text-rose-400" />
            Welcome to Sweet Couple Tales!
            <Sparkles className="w-5 h-5 text-yellow-400 ml-1 animate-bounce" />
          </span>
          <div className="text-muted-foreground text-center text-base">Let’s set up your romantic profile</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar/Emoji Picker */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Choose Your Avatar</Label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Emoji Picker */}
              <div className="flex flex-wrap gap-1 max-w-xs">
                {EMOJI_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      "text-2xl p-2 rounded-full border transition-all",
                      profileData.avatar_emoji === emoji && "bg-rose-100 border-rose-400 scale-110"
                    )}
                    onClick={() => setProfileData(prev => ({ ...prev, avatar_emoji: emoji, avatar_url: '' }))}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">or upload a photo</span>
                <Input
                  id="avatar_url"
                  type="url"
                  value={profileData.avatar_url}
                  onChange={(e) => {
                    setProfileData(prev => ({ ...prev, avatar_url: e.target.value, avatar_emoji: '' }));
                    setAvatarError(false);
                  }}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-48"
                />
                {profileData.avatar_url && !avatarError ? (
                  <img
                    src={profileData.avatar_url}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={() => setAvatarError(true)}
                  />
                ) : profileData.avatar_url && avatarError ? (
                  <img
                    src="/placeholder.svg"
                    alt="Fallback avatar"
                    className="w-16 h-16 rounded-full object-cover border bg-muted"
                  />
                ) : null}
              </div>
            </div>
            {/* Live Preview */}
            <div className="flex flex-col items-center mt-2">
              <span className="text-xs text-muted-foreground mb-1">Live Preview</span>
              <div className="w-20 h-20 rounded-full border-2 border-rose-300 bg-white flex items-center justify-center text-4xl">
                {profileData.avatar_emoji ? profileData.avatar_emoji : (
                  profileData.avatar_url && !avatarError ? (
                    <img src={profileData.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Smile className="w-10 h-10 text-muted-foreground" />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-base font-medium">
              Your Name
            </Label>
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
            {profileData.display_name && (
              <div className="text-xs text-muted-foreground mt-1">Hi, <span className="font-semibold text-rose-500">{profileData.display_name}</span>!</div>
            )}
          </div>

          {/* Partner Selection */}
          <div className="space-y-2">
            <Label htmlFor="partner_id" className="text-base font-medium">
              Select or Invite Your Partner
            </Label>
            <SelectPartner
              onSelect={(partnerId: string) => setPartnerId(partnerId)}
            />
          </div>

          {/* Partner Name */}
          <div className="space-y-2">
            <Label htmlFor="partner_name" className="text-base font-medium">
              Partner's Name
            </Label>
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
                  onSelect={(date) => setProfileData(prev => ({ 
                    ...prev, 
                    relationship_start_date: date || null 
                  }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* First Goal Input */}
          <div className="space-y-2">
            <Label htmlFor="first_goal" className="text-base font-medium">
              First Relationship Goal (optional)
            </Label>
            <Input
              id="first_goal"
              value={profileData.first_goal}
              onChange={e => setProfileData(prev => ({ ...prev, first_goal: e.target.value }))}
              placeholder="e.g. Travel to Paris together"
            />
          </div>

          {/* Love Language Quiz Prompt */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Want to know your love language?</span>
            <Button type="button" variant="romantic" className="px-4 py-2 rounded-full" onClick={() => window.location.href = '/dashboard#love-language-quiz'}>
              Take Love Language Quiz
            </Button>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="text-sm text-red-500 text-center mb-2">{validationError}</div>
          )}
          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-romantic text-white"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetup;