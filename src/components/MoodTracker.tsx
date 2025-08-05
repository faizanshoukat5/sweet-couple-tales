import React, { useState, useEffect } from 'react';
import { Smile, Frown, Meh, Laugh, Angry, Heart, Calendar, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMoods } from '@/hooks/useMoods';

const MOODS = [
  { 
    label: 'Happy', 
    icon: <Smile className="w-8 h-8 text-yellow-500" />, 
    value: 'happy',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    activeColor: 'bg-yellow-200 border-yellow-400'
  },
  { 
    label: 'Excited', 
    icon: <Laugh className="w-8 h-8 text-pink-500" />, 
    value: 'excited',
    color: 'bg-pink-100 border-pink-300 text-pink-700',
    activeColor: 'bg-pink-200 border-pink-400'
  },
  { 
    label: 'Neutral', 
    icon: <Meh className="w-8 h-8 text-gray-500" />, 
    value: 'neutral',
    color: 'bg-gray-100 border-gray-300 text-gray-700',
    activeColor: 'bg-gray-200 border-gray-400'
  },
  { 
    label: 'Sad', 
    icon: <Frown className="w-8 h-8 text-blue-500" />, 
    value: 'sad',
    color: 'bg-blue-100 border-blue-300 text-blue-700',
    activeColor: 'bg-blue-200 border-blue-400'
  },
  { 
    label: 'Angry', 
    icon: <Angry className="w-8 h-8 text-red-500" />, 
    value: 'angry',
    color: 'bg-red-100 border-red-300 text-red-700',
    activeColor: 'bg-red-200 border-red-400'
  },
  { 
    label: 'Loved', 
    icon: <Heart className="w-8 h-8 text-rose-500" />, 
    value: 'loved',
    color: 'bg-rose-100 border-rose-300 text-rose-700',
    activeColor: 'bg-rose-200 border-rose-400'
  },
];

interface MoodTrackerProps {
  userId: string;
  partnerId: string;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ 
  userId, 
  partnerId
}) => {
  const { getMood, setMood, getMoodHistory } = useMoods();
  const { toast } = useToast();
  const [myMood, setMyMood] = useState<string | null>(null);
  const [partnerMood, setPartnerMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const today = new Date().toISOString().slice(0, 10);

  // Load today's moods
  useEffect(() => {
    const loadMoods = async () => {
      setIsLoading(true);
      try {
        const [myMoodData, partnerMoodData] = await Promise.all([
          getMood(userId, today),
          getMood(partnerId, today)
        ]);
        setMyMood(myMoodData);
        setPartnerMood(partnerMoodData);
      } catch (error) {
        console.error('Error loading moods:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && partnerId) {
      loadMoods();
    }
  }, [userId, partnerId, getMood, today]);

  // Load mood history if function is available
  useEffect(() => {
    const loadHistory = async () => {
      if (getMoodHistory && userId) {
        try {
          const history = await getMoodHistory(userId, 7);
          setMoodHistory(history);
        } catch (error) {
          console.error('Error loading mood history:', error);
        }
      }
    };
    loadHistory();
  }, [getMoodHistory, userId]);

  const handleMoodSelect = async (mood: string) => {
    try {
      const success = await setMood(userId, today, mood);
      if (success) {
        setMyMood(mood);
      }
    } catch (error) {
      console.error('Error setting mood:', error);
      toast({
        title: "Error",
        description: "Failed to save your mood. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMoodData = (moodValue: string | null) => {
    return MOODS.find(m => m.value === moodValue);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading moods...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
          <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
          Daily Mood Tracker
          <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How are you both feeling today?
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today's Mood</TabsTrigger>
            <TabsTrigger value="history" disabled={!getMoodHistory}>
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {/* Mood Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">Select Your Mood</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {MOODS.map(mood => (
                  <Button
                    key={mood.value}
                    variant="outline"
                    className={`flex flex-col items-center p-4 h-auto space-y-2 transition-all hover:scale-105 ${
                      myMood === mood.value 
                        ? `${mood.activeColor} ring-2 ring-primary shadow-md` 
                        : `${mood.color} hover:${mood.activeColor}`
                    }`}
                    onClick={() => handleMoodSelect(mood.value)}
                    disabled={isLoading}
                  >
                    {mood.icon}
                    <span className="text-xs font-medium">{mood.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Moods Display */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Your Mood */}
              <div className="flex flex-col items-center p-4 bg-white/80 rounded-xl border border-pink-200 shadow-sm">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Mood</h4>
                <div className="flex flex-col items-center space-y-2">
                  {myMood ? (
                    <>
                      {getMoodData(myMood)?.icon}
                      <Badge variant="secondary" className={getMoodData(myMood)?.color}>
                        {getMoodData(myMood)?.label}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Meh className="w-8 h-8 text-gray-300" />
                      <span className="text-sm text-muted-foreground">Not set</span>
                    </>
                  )}
                </div>
              </div>

              {/* Partner's Mood */}
              <div className="flex flex-col items-center p-4 bg-white/80 rounded-xl border border-pink-200 shadow-sm">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Partner's Mood</h4>
                <div className="flex flex-col items-center space-y-2">
                  {partnerMood ? (
                    <>
                      {getMoodData(partnerMood)?.icon}
                      <Badge variant="secondary" className={getMoodData(partnerMood)?.color}>
                        {getMoodData(partnerMood)?.label}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Meh className="w-8 h-8 text-gray-300" />
                      <span className="text-sm text-muted-foreground">Not set</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mood Match Indicator */}
            {myMood && partnerMood && (
              <div className="text-center p-4 bg-white/60 rounded-xl border border-pink-200">
                {myMood === partnerMood ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">You're both feeling {getMoodData(myMood)?.label.toLowerCase()}!</span>
                    <Heart className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <span>Different moods today - that's perfectly normal! 💕</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Your Mood History</h3>
            </div>
            
            {moodHistory.length > 0 ? (
              <div className="space-y-2">
                {moodHistory.map((entry) => (
                  <div key={entry.date} className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-pink-200">
                    <span className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {getMoodData(entry.mood)?.icon}
                      <Badge variant="secondary" className={getMoodData(entry.mood)?.color}>
                        {getMoodData(entry.mood)?.label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No mood history available yet.</p>
                <p className="text-sm">Start tracking your daily moods!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
