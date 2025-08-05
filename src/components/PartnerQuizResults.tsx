import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, User } from 'lucide-react';

const LANGUAGES = {
  words: 'Words of Affirmation',
  acts: 'Acts of Service',
  gifts: 'Receiving Gifts',
  time: 'Quality Time',
  touch: 'Physical Touch',
};

const DESCRIPTIONS = {
  words: 'Values verbal expressions of love, encouragement, and appreciation.',
  acts: 'Feels loved when their partner helps them or does things for them.',
  gifts: 'Appreciates thoughtful gifts as symbols of love.',
  time: 'Cherishes undivided attention and shared activities.',
  touch: 'Feels most connected through physical affection.',
};

interface PartnerQuizResult {
  user_id: string;
  scores: any; // Json type from Supabase
  taken_at: string;
  shared_with_partner: boolean;
  partner_id: string;
  profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const PartnerQuizResults: React.FC = () => {
  const { user } = useAuth();
  const [partnerResults, setPartnerResults] = useState<PartnerQuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnerResults = async () => {
      if (!user) return;

      try {
        // First get the quiz results
        const { data: resultsData, error: resultsError } = await supabase
          .from('love_language_quiz_results')
          .select('user_id, scores, taken_at, shared_with_partner, partner_id')
          .eq('partner_id', user.id)
          .eq('shared_with_partner', true)
          .order('taken_at', { ascending: false });

        if (resultsError) throw resultsError;

        // Then get profile information for each user
        if (resultsData && resultsData.length > 0) {
          const userIds = resultsData.map(result => result.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, display_name, email, avatar_url')
            .in('user_id', userIds);

          if (!profilesError && profilesData) {
            // Combine results with profile data
            const enrichedResults = resultsData.map(result => ({
              ...result,
              profiles: profilesData.find(profile => profile.user_id === result.user_id)
            }));
            setPartnerResults(enrichedResults);
          } else {
            setPartnerResults(resultsData);
          }
        }
      } catch (error) {
        console.error('Error fetching partner quiz results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerResults();
  }, [user]);

  const getTopTwoLanguages = (scores: any) => {
    const scoresObj = scores as Record<string, number>;
    const sorted = Object.entries(scoresObj).sort((a, b) => (b[1] as number) - (a[1] as number));
    return {
      primary: sorted[0]?.[0],
      secondary: sorted[1]?.[0]
    };
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 via-white to-rose-100 border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-rose-500">Loading partner results...</div>
        </CardContent>
      </Card>
    );
  }

  if (partnerResults.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 via-white to-rose-100 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-600">
            <Heart className="w-5 h-5" />
            Partner's Love Language Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <User className="w-12 h-12 text-rose-300 mx-auto mb-3" />
            <p className="text-rose-600 font-medium mb-2">No shared results yet</p>
            <p className="text-rose-500 text-sm">
              When your partner takes the Love Language Quiz and shares it with you, 
              their results will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-rose-600 flex items-center gap-2">
        <Heart className="w-5 h-5" />
        Partner's Love Language Results
      </h3>
      
      {partnerResults.map((result) => {
        const { primary, secondary } = getTopTwoLanguages(result.scores);
        const partnerName = result.profiles?.display_name || result.profiles?.email || 'Your Partner';
        
        return (
          <Card key={result.user_id} className="bg-gradient-to-br from-pink-50 via-white to-rose-100 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-rose-600">
                <div className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {partnerName.charAt(0).toUpperCase()}
                </div>
                {partnerName}'s Love Language
              </CardTitle>
              <p className="text-xs text-rose-400">
                Shared on {new Date(result.taken_at).toLocaleDateString()}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Primary Love Language */}
              {primary && (
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-rose-500 text-white">
                      Primary
                    </Badge>
                    <span className="font-bold text-rose-600">
                      {LANGUAGES[primary as keyof typeof LANGUAGES]}
                    </span>
                  </div>
                  <p className="text-rose-700 text-sm">
                    {DESCRIPTIONS[primary as keyof typeof DESCRIPTIONS]}
                  </p>
                </div>
              )}

              {/* Secondary Love Language */}
              {secondary && (
                <div className="p-3 bg-white/80 rounded-lg border border-rose-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="border-rose-300 text-rose-600">
                      Secondary
                    </Badge>
                    <span className="font-semibold text-rose-600">
                      {LANGUAGES[secondary as keyof typeof LANGUAGES]}
                    </span>
                  </div>
                </div>
              )}

              {/* All Scores */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-rose-600">Full Results:</p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(result.scores as Record<string, number>)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([lang, score]) => (
                      <div key={lang} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                        <span className="text-rose-700 text-sm font-medium">
                          {LANGUAGES[lang as keyof typeof LANGUAGES]}
                        </span>
                        <span className="text-rose-600 font-bold">{score as number}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
