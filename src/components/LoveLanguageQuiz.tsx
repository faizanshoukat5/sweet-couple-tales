
// Place this after all main imports to avoid redeclaration
const CustomQuizResultsForMyQuizzes: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true);
      if (!user) return;
      // Fetch all custom quizzes created by the user
      const { data: quizRows, error } = await supabase
        .from('custom_quizzes')
        .select('id, quiz, partner_id, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
      if (error || !quizRows) {
        setQuizzes([]);
        setLoading(false);
        return;
      }
      // For each quiz, fetch attempts
      const quizzesWithAttempts = await Promise.all(
        quizRows.map(async (q: any) => {
          const { data: attempts } = await supabase
            .from('custom_quiz_attempts')
            .select('id, taker_id, answers, attempted_at')
            .eq('quiz_id', q.id)
            .order('attempted_at', { ascending: false });
          return { ...q, attempts: attempts || [] };
        })
      );
      setQuizzes(quizzesWithAttempts);
      setLoading(false);
    }
    fetchQuizzes();
  }, [user]);

  if (loading) return <div className="text-center text-xs text-muted-foreground">Loading your custom quizzes...</div>;
  if (!quizzes.length) return <div className="text-center text-xs text-muted-foreground">You haven't created any custom quizzes yet.</div>;

  return (
    <div className="mt-8">
      <h4 className="font-serif text-lg font-bold text-rose-600 mb-2 text-center">Your Custom Quizzes & Partner's Attempts</h4>
      {quizzes.map(q => (
        <div key={q.id} className="mb-6 p-4 bg-white/80 rounded-lg shadow">
          <div className="font-semibold text-rose-700 mb-1">Quiz created on {new Date(q.created_at).toLocaleString()}</div>
          <div className="mb-2 text-xs text-muted-foreground">Quiz ID: {q.id}</div>
          <div className="mb-2">
            {Array.isArray(q.quiz) && q.quiz.length > 0 && (
              <ul className="list-disc pl-5 text-sm">
                {q.quiz.map((qq: any, idx: number) => (
                  <li key={idx}><span className="font-medium">Q{idx + 1}:</span> {qq.question}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-2">
            <div className="font-semibold text-rose-600 mb-1">Partner's Attempts:</div>
            {q.attempts.length === 0 ? (
              <div className="text-xs text-muted-foreground">No attempts yet.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {q.attempts.map((a: any) => (
                  <div key={a.id} className="bg-rose-50 rounded px-3 py-2 text-rose-700">
                    <div className="text-xs text-rose-400 mb-1">Attempted on {new Date(a.attempted_at).toLocaleString()}</div>
                    {Array.isArray(a.answers) && q.quiz.length === a.answers.length && (
                      <ul className="list-decimal pl-4 text-xs">
                        {q.quiz.map((qq: any, idx: number) => (
                          <li key={idx}><span className="font-medium">Q{idx + 1}:</span> {qq.question} <br />
                            <span className="text-green-700">A: {qq.options.find((o: any) => o.value === a.answers[idx])?.text || a.answers[idx]}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import CustomQuizBuilder from './CustomQuizBuilder';
import { CustomQuizAttempt } from './CustomQuizAttempt';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerId } from '@/hooks/usePartnerId';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

// Default question pool for Love Language Quiz
const QUESTIONS = [
  {
    question: 'You feel most loved when your partner:',
    options: [
      { text: 'Says “I love you” or gives compliments', lang: 'words' },
      { text: 'Does chores or helps you out', lang: 'acts' },
      { text: 'Gives you thoughtful gifts', lang: 'gifts' },
      { text: 'Spends quality time with you', lang: 'time' },
      { text: 'Hugs, kisses, or holds your hand', lang: 'touch' },
    ],
  },
  {
    question: 'On a tough day, you appreciate your partner most if they:',
    options: [
      { text: 'Say encouraging words', lang: 'words' },
      { text: 'Do something nice for you', lang: 'acts' },
      { text: 'Surprise you with a treat', lang: 'gifts' },
      { text: 'Spend time listening to you', lang: 'time' },
      { text: 'Give you a big hug', lang: 'touch' },
    ],
  },
  {
    question: 'Which would you enjoy more?',
    options: [
      { text: 'A poem written for you', lang: 'words' },
      { text: 'Your partner making your favorite meal', lang: 'acts' },
      { text: 'A meaningful trinket', lang: 'gifts' },
      { text: 'A day with no distractions', lang: 'time' },
      { text: 'A slow dance together', lang: 'touch' },
    ],
  },
  {
    question: 'You feel most connected when your partner:',
    options: [
      { text: 'Says “I’m grateful for you”', lang: 'words' },
      { text: 'Does something to help you', lang: 'acts' },
      { text: 'Gives you a surprise card', lang: 'gifts' },
      { text: 'Spends time doing your favorite activity', lang: 'time' },
      { text: 'Holds you close in public', lang: 'touch' },
    ],
  },
  {
    question: 'Which would you rather have?',
    options: [
      { text: 'A loving voicemail', lang: 'words' },
      { text: 'Your partner taking care of a task', lang: 'acts' },
      { text: 'A surprise delivery', lang: 'gifts' },
      { text: 'A weekend just for you two', lang: 'time' },
      { text: 'A kiss on the cheek', lang: 'touch' },
    ],
  },
  {
    question: 'You feel most loved when your partner:',
    options: [
      { text: 'Says “I love you” in creative ways', lang: 'words' },
      { text: 'Does something to make your life easier', lang: 'acts' },
      { text: 'Gives you a sentimental gift', lang: 'gifts' },
      { text: 'Spends quality time with you', lang: 'time' },
      { text: 'Holds your hand while walking', lang: 'touch' },
    ],
  },
  // Additional questions for a larger pool
  {
    question: 'How do you prefer to celebrate special occasions?',
    options: [
      { text: 'Hearing heartfelt words', lang: 'words' },
      { text: 'Having someone do something nice for you', lang: 'acts' },
      { text: 'Receiving a thoughtful present', lang: 'gifts' },
      { text: 'Spending uninterrupted time together', lang: 'time' },
      { text: 'A warm embrace or kiss', lang: 'touch' },
    ],
  },
  {
    question: 'What makes you feel appreciated?',
    options: [
      { text: 'Being told “thank you”', lang: 'words' },
      { text: 'Someone helping you with a task', lang: 'acts' },
      { text: 'Getting a surprise gift', lang: 'gifts' },
      { text: 'Having a meaningful conversation', lang: 'time' },
      { text: 'A gentle touch on the arm', lang: 'touch' },
    ],
  },
  {
    question: 'When you miss your partner, what do you crave most?',
    options: [
      { text: 'A sweet message or call', lang: 'words' },
      { text: 'Them doing something thoughtful for you', lang: 'acts' },
      { text: 'A small memento from them', lang: 'gifts' },
      { text: 'Quality time together', lang: 'time' },
      { text: 'A long hug', lang: 'touch' },
    ],
  },
  {
    question: 'How do you like to show love to others?',
    options: [
      { text: 'Giving compliments', lang: 'words' },
      { text: 'Doing favors or chores', lang: 'acts' },
      { text: 'Giving gifts', lang: 'gifts' },
      { text: 'Spending time with them', lang: 'time' },
      { text: 'Physical affection', lang: 'touch' },
    ],
  },
  {
    question: 'What do you remember most from a great date?',
    options: [
      { text: 'What was said', lang: 'words' },
      { text: 'What was done for you', lang: 'acts' },
      { text: 'A keepsake or photo', lang: 'gifts' },
      { text: 'The time spent together', lang: 'time' },
      { text: 'A kiss or holding hands', lang: 'touch' },
    ],
  },
];

// Template for custom quizzes
export const CUSTOM_QUIZ_TEMPLATE = [
  {
    question: 'Enter your custom question here...', // Example: 'What is your favorite way to relax?'
    options: [
      { text: 'Option 1', value: 'option1' },
      { text: 'Option 2', value: 'option2' },
      { text: 'Option 3', value: 'option3' },
      { text: 'Option 4', value: 'option4' },
    ],
  },
];

const LANGUAGES = {
  words: 'Words of Affirmation',
  acts: 'Acts of Service',
  gifts: 'Receiving Gifts',
  time: 'Quality Time',
  touch: 'Physical Touch',
};

const DESCRIPTIONS = {
  words: 'You value verbal expressions of love, encouragement, and appreciation.',
  acts: 'You feel loved when your partner helps you or does things for you.',
  gifts: 'You appreciate thoughtful gifts as symbols of love.',
  time: 'You cherish undivided attention and shared activities.',
  touch: 'You feel most connected through physical affection.',
};

interface LoveLanguageQuizProps {}

// Type for custom quiz
type CustomQuiz = {
  question: string;
  options: { text: string; value: string }[];
}[];

export const LoveLanguageQuiz: React.FC<LoveLanguageQuizProps> = () => {

  // State hooks must be declared first
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const partnerId = usePartnerId();
  const [showCustomQuizBuilder, setShowCustomQuizBuilder] = useState(false);
  const [customQuiz, setCustomQuiz] = useState<CustomQuiz | null>(null);
  const [customQuizShareLoading, setCustomQuizShareLoading] = useState(false);

  // State for showing partner's custom quiz attempt
  const [showPartnerCustomQuiz, setShowPartnerCustomQuiz] = useState(false);

  // Share with Partner handler (saves to database for partner to see)
  const handleShareWithPartner = async () => {
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to share your quiz results.', variant: 'destructive' });
      return;
    }
    
    if (!partnerId) {
      toast({ 
        title: 'No Partner Connected', 
        description: 'Please set up your partner in Profile Settings to share quiz results.', 
        variant: 'destructive' 
      });
      return;
    }

    if (!primary) {
      toast({ title: 'No results to share', description: 'Please complete the quiz first.', variant: 'destructive' });
      return;
    }
    
    setSaving(true);
    
    // Save/update the user's results with partner sharing enabled
    const result = {
      user_id: user.id,
      scores: scores as any,
      taken_at: new Date().toISOString(),
      shared_with_partner: true,
      partner_id: partnerId
    };

    const { error } = await supabase
      .from('love_language_quiz_results')
      .upsert(result, { onConflict: 'user_id' });

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to share with partner.', variant: 'destructive' });
    } else {
      toast({ 
        title: 'Shared Successfully!', 
        description: 'Your quiz results are now visible on your partner\'s dashboard!' 
      });
    }
  };

  const handleSaveResults = async () => {
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to save your quiz results.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const result = {
      user_id: user.id,
      scores: scores as any, // JSON column
      taken_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('love_language_quiz_results')
      .upsert(result, { onConflict: 'user_id' });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to save quiz results.', variant: 'destructive' });
    } else {
      toast({ title: 'Results Saved', description: 'Your Love Language Quiz results have been saved!' });
    }
  };

  // Share directly with partner via messaging/social media
  const handleShareWithPartnerDirectly = () => {
    if (!primary) {
      toast({ title: 'No results to share', description: 'Please complete the quiz first.', variant: 'destructive' });
      return;
    }

    const primaryLanguage = LANGUAGES[primary as keyof typeof LANGUAGES];
    const secondaryLanguage = secondary ? LANGUAGES[secondary as keyof typeof LANGUAGES] : '';
    
    const partnerShareText = `Hey love! 💕 I just took the Love Language Quiz and wanted to share my results with you:\n\n` +
      `🌹 My primary love language is: ${primaryLanguage}\n` +
      (secondaryLanguage ? `🌸 My secondary love language is: ${secondaryLanguage}\n` : '') +
      `\n${DESCRIPTIONS[primary as keyof typeof DESCRIPTIONS]}\n\n` +
      `This helps me understand how I feel most loved. Maybe you could take the quiz too so we can better understand each other? 💖\n\n` +
      `Take the quiz at: ${window.location.origin}`;

    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Love Language Results for You 💕',
        text: partnerShareText,
        url: window.location.origin
      }).then(() => {
        toast({ title: 'Shared with Partner!', description: 'Your results are ready to send to your partner.' });
      }).catch(() => {
        // Fallback to clipboard
        copyToClipboardForPartner(partnerShareText);
      });
    } else {
      // Fallback to clipboard
      copyToClipboardForPartner(partnerShareText);
    }
  };

  // Copy partner-specific results to clipboard
  const copyToClipboardForPartner = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ 
        title: 'Copied for Partner!', 
        description: 'Your personalized message for your partner has been copied. You can now paste it in WhatsApp, text message, or anywhere you want to share it!' 
      });
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ 
        title: 'Copied for Partner!', 
        description: 'Your personalized message for your partner has been copied. You can now paste it in WhatsApp, text message, or anywhere you want to share it!' 
      });
    });
  };

  // General share function for social media, email, etc.
  const handleShareResults = () => {
    if (!primary) {
      toast({ title: 'No results to share', description: 'Please complete the quiz first.', variant: 'destructive' });
      return;
    }

    const primaryLanguage = LANGUAGES[primary as keyof typeof LANGUAGES];
    const secondaryLanguage = secondary ? LANGUAGES[secondary as keyof typeof LANGUAGES] : '';
    
    const shareText = `I just discovered my Love Language! 💕\n\n` +
      `My primary love language is: ${primaryLanguage}\n` +
      (secondaryLanguage ? `My secondary love language is: ${secondaryLanguage}\n` : '') +
      `\nWhat's your love language? Take the quiz at Sweet Couple Tales! 🌹`;

    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Love Language Results',
        text: shareText,
        url: window.location.origin
      }).then(() => {
        toast({ title: 'Shared!', description: 'Your results have been shared successfully.' });
      }).catch(() => {
        // Fallback to clipboard
        copyToClipboard(shareText);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(shareText);
    }
  };

  // Copy results to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied!', description: 'Your results have been copied to clipboard. You can now paste and share them anywhere!' });
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ title: 'Copied!', description: 'Your results have been copied to clipboard. You can now paste and share them anywhere!' });
    });
  };

  const handleAnswer = (lang: string) => {
    setAnswers([...answers, lang]);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const scores = answers.reduce((acc, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0]?.[0];
  const secondary = sorted[1]?.[0];



  // Share custom quiz with partner
  const handleShareCustomQuizWithPartner = async () => {
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to share your custom quiz.', variant: 'destructive' });
      return;
    }
    if (!partnerId) {
      toast({ title: 'No Partner Connected', description: 'Please set up your partner in Profile Settings to share custom quizzes.', variant: 'destructive' });
      return;
    }
    if (!customQuiz || customQuiz.length === 0) {
      toast({ title: 'No Custom Quiz', description: 'Please create and save a custom quiz first.', variant: 'destructive' });
      return;
    }
    setCustomQuizShareLoading(true);
    // Save the custom quiz to a new table: custom_quizzes
    const { data, error } = await supabase
      .from('custom_quizzes')
      .insert([
        {
          creator_id: user.id,
          partner_id: partnerId,
          quiz: customQuiz,
          created_at: new Date().toISOString(),
        },
      ]);
    setCustomQuizShareLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to share custom quiz.', variant: 'destructive' });
    } else {
      toast({ title: 'Custom Quiz Shared!', description: 'Your partner can now attempt your custom quiz.' });
    }
  };

  return (
    <>
      {/* Button to show/hide partner's custom quiz attempt UI */}
      {user && (
        <Button variant="outline" className="self-end mb-2" onClick={() => setShowPartnerCustomQuiz(v => !v)}>
          {showPartnerCustomQuiz ? 'Hide Partner Custom Quiz' : 'Attempt Partner Custom Quiz'}
        </Button>
      )}
      {/* Show partner's custom quiz attempt UI if toggled */}
      {showPartnerCustomQuiz && user && partnerId && (
        <CustomQuizAttempt />
      )}
      <Card className="bg-gradient-to-br from-pink-50 via-white to-rose-100 border-0 shadow-lg rounded-2xl mb-8 max-w-xl mx-auto">
        <CardContent className="flex flex-col items-center gap-4 py-6 px-4 text-center">
          <Button variant="outline" className="self-end mb-2" onClick={() => setShowCustomQuizBuilder(true)}>
            + Create Custom Quiz
          </Button>
          {customQuiz && (
            <Button
              variant="secondary"
              className="self-end mb-2"
              onClick={handleShareCustomQuizWithPartner}
              disabled={customQuizShareLoading || !partnerId}
            >
              {customQuizShareLoading ? 'Sharing...' : 'Share Custom Quiz with Partner'}
            </Button>
          )}
          {/* Show all quizzes I created and my partner's attempts */}
          <CustomQuizResultsForMyQuizzes />
          {!showResult ? (
            <>
              <div className="w-full text-left text-rose-400 text-xs mb-2">Question {step + 1} of {QUESTIONS.length}</div>
              <h3 className="font-serif text-xl font-bold text-rose-600 mb-2">{QUESTIONS[step].question}</h3>
              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                {QUESTIONS[step].options.map(opt => (
                  <Button key={opt.lang} variant="romantic" className="w-full" onClick={() => handleAnswer(opt.lang)}>
                    {opt.text}
                  </Button>
                ))}
              </div>
              <div className="w-full h-2 bg-rose-100 rounded-full mt-4">
                <div className="h-2 bg-rose-400 rounded-full transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
              </div>
            </>
          ) : (
            <>
              <h3 className="font-serif text-2xl font-bold text-rose-600 mb-2">Your Love Language Results</h3>
              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                {Object.entries(answers.reduce((acc, lang) => {
                  acc[lang] = (acc[lang] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).map(([lang, score]) => (
                  <div key={lang} className="flex items-center justify-between bg-white/80 rounded-lg px-4 py-2 text-rose-700 font-semibold">
                    <span>{LANGUAGES[lang as keyof typeof LANGUAGES]}</span>
                    <span>{score}</span>
                  </div>
                ))}
              </div>
              {primary && (
                <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="text-lg font-bold text-rose-500 mb-1">Primary: {LANGUAGES[primary as keyof typeof LANGUAGES]}</div>
                  <div className="text-rose-700 text-base mb-2">{DESCRIPTIONS[primary as keyof typeof DESCRIPTIONS]}</div>
                  {secondary && (
                    <div className="text-xs text-rose-400">Secondary: {LANGUAGES[secondary as keyof typeof LANGUAGES]}</div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="romantic" disabled={saving} onClick={handleSaveResults}>
                  {saving ? 'Saving...' : 'Save Results'}
                </Button>
                {partnerId ? (
                  <Button variant="secondary" disabled={saving} onClick={handleShareWithPartner}>
                    {saving ? 'Sharing...' : 'Share with Partner'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled onClick={() => {}}>
                    No Partner Connected - Setup in Profile
                  </Button>
                )}
                <Button variant="outline" onClick={handleShareWithPartnerDirectly}>
                  Send Message to Partner
                </Button>
                <Button variant="outline" onClick={handleShareResults}>
                  Share Results Publicly
                </Button>
                <Button variant="outline" onClick={() => { setStep(0); setAnswers([]); setShowResult(false); }}>
                  Retake Quiz
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Custom Quiz Builder Modal */}
      {showCustomQuizBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-0 relative">
            <Button variant="outline" className="absolute top-4 right-4" onClick={() => setShowCustomQuizBuilder(false)}>
              Close
            </Button>
            <CustomQuizBuilder
              onSave={quiz => {
                setCustomQuiz(quiz);
                setShowCustomQuizBuilder(false);
                toast({ title: 'Custom quiz saved!', description: 'You can now share it with your partner.' });
              }}
              onShare={async quiz => {
                if (!user) {
                  toast({ title: 'Not signed in', description: 'Please sign in to share your custom quiz.', variant: 'destructive' });
                  return;
                }
                if (!partnerId) {
                  toast({ title: 'No Partner Connected', description: 'Please set up your partner in Profile Settings to share custom quizzes.', variant: 'destructive' });
                  return;
                }
                if (!quiz || quiz.length === 0) {
                  toast({ title: 'No Custom Quiz', description: 'Please create and save a custom quiz first.', variant: 'destructive' });
                  return;
                }
                setCustomQuizShareLoading(true);
                const { error } = await supabase
                  .from('custom_quizzes')
                  .insert([
                    {
                      creator_id: user.id,
                      partner_id: partnerId,
                      quiz: quiz as any,
                      created_at: new Date().toISOString(),
                    },
                  ]);
                setCustomQuizShareLoading(false);
                setShowCustomQuizBuilder(false);
                if (error) {
                  toast({ title: 'Error', description: 'Failed to share custom quiz.', variant: 'destructive' });
                } else {
                  setCustomQuiz(quiz);
                  toast({ title: 'Custom Quiz Shared!', description: 'Your partner can now attempt your custom quiz.' });
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}


