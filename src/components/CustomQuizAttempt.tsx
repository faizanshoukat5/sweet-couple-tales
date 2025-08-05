// List all attempts for the current quiz, visible to both partners
const CustomQuizAttemptsList: React.FC<{ quizId: string }> = ({ quizId }) => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttempts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_quiz_attempts')
        .select('id, taker_id, answers, attempted_at')
        .eq('quiz_id', quizId)
        .order('attempted_at', { ascending: false });
      setLoading(false);
      if (!error && data) setAttempts(data);
    }
    if (quizId) fetchAttempts();
  }, [quizId]);

  if (loading) return <div className="text-center text-xs text-muted-foreground">Loading attempts...</div>;
  if (!attempts.length) return <div className="text-center text-xs text-muted-foreground">No attempts yet.</div>;

  return (
    <div className="mt-6 w-full">
      <h5 className="font-serif text-base font-bold text-rose-600 mb-2 text-center">All Attempts</h5>
      <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
        {attempts.map(a => (
          <div key={a.id} className="bg-white/80 rounded-lg px-4 py-2 text-rose-700 font-semibold flex flex-col items-start">
            <span className="text-xs text-rose-400 mb-1">{a.taker_id === user?.id ? 'You' : 'Partner'} ({new Date(a.attempted_at).toLocaleString()})</span>
            {Array.isArray(a.answers) ? a.answers.map((ans, idx) => (
              <span key={idx} className="text-xs">Answer {idx + 1}: {ans}</span>
            )) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
// You may want to create a migration for this table:
// custom_quiz_attempts: id, quiz_id, taker_id, creator_id, answers (json), attempted_at
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerId } from '@/hooks/usePartnerId';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

// No props needed, partnerId is fetched from hook

// Type for a custom quiz question
interface CustomQuizQuestion {
  question: string;
  options: { text: string; value: string }[];
}

type CustomQuiz = CustomQuizQuestion[];

export const CustomQuizAttempt: React.FC = () => {
  const partnerId = usePartnerId();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<CustomQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      // Fetch the latest custom quiz shared with this user by their partner
      if (!user || !partnerId) {
        setQuiz(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('custom_quizzes')
        .select('quiz')
        .eq('creator_id', partnerId)
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setLoading(false);
      if (error || !data) {
        setQuiz(null);
      } else {
        setQuiz(data.quiz as CustomQuiz);
      }
    };
    fetchQuiz();
  }, [user, partnerId]);

  // Find the quiz id (custom_quizzes row) for saving attempts
  const [quizId, setQuizId] = useState<string | null>(null);

  const handleAnswer = (value: string) => {
    setAnswers([...answers, value]);
    if (step < (quiz?.length || 0) - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
      // Save attempt when finished
      handleSaveAttempt([...answers, value]);
    }
  };

  // Fetch quiz id as well as quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      if (!user || !partnerId) {
        setQuiz(null);
        setQuizId(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('custom_quizzes')
        .select('id, quiz, creator_id')
        .eq('creator_id', partnerId)
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setLoading(false);
      if (error || !data) {
        setQuiz(null);
        setQuizId(null);
      } else {
        setQuiz(data.quiz as CustomQuiz);
        setQuizId(data.id);
      }
    };
    fetchQuiz();
  }, [user, partnerId]);

  // Save the attempt to custom_quiz_attempts table
  const handleSaveAttempt = async (finalAnswers: string[]) => {
    if (!user || !quizId || !partnerId) return;
    setSaving(true);
    const { error } = await supabase
      .from('custom_quiz_attempts')
      .insert([
        {
          quiz_id: quizId,
          taker_id: user.id,
          creator_id: partnerId,
          answers: finalAnswers,
          attempted_at: new Date().toISOString(),
        },
      ]);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to share your attempt with your partner.', variant: 'destructive' });
    } else {
      toast({ title: 'Attempt Shared!', description: 'Your answers have been shared with your partner.' });
    }
  };

  if (loading) return <div className="text-center py-8">Loading custom quiz...</div>;
  if (!quiz) return <div className="text-center py-8 text-rose-400">No custom quiz shared with you yet.</div>;

  return (
    <Card className="bg-gradient-to-br from-pink-50 via-white to-rose-100 border-0 shadow-lg rounded-2xl mb-8 max-w-xl mx-auto">
      <CardContent className="flex flex-col items-center gap-4 py-6 px-4 text-center">
        <h3 className="font-serif text-xl font-bold text-rose-600 mb-2">Custom Quiz from Your Partner</h3>
        {!showResult ? (
          <>
            <div className="w-full text-left text-rose-400 text-xs mb-2">Question {step + 1} of {quiz.length}</div>
            <h4 className="font-serif text-lg font-semibold text-rose-700 mb-2">{quiz[step].question}</h4>
            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
              {quiz[step].options.map(opt => (
                <Button key={opt.value} variant="romantic" className="w-full" onClick={() => handleAnswer(opt.value)} disabled={saving}>
                  {opt.text}
                </Button>
              ))}
            </div>
            <div className="w-full h-2 bg-rose-100 rounded-full mt-4">
              <div className="h-2 bg-rose-400 rounded-full transition-all" style={{ width: `${((step + 1) / quiz.length) * 100}%` }} />
            </div>
          </>
        ) : (
          <>
            <h4 className="font-serif text-lg font-semibold text-rose-700 mb-2">Your Answers</h4>
            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
              {quiz.map((q, i) => (
                <div key={i} className="flex flex-col items-start bg-white/80 rounded-lg px-4 py-2 text-rose-700 font-semibold">
                  <span>{q.question}</span>
                  <span className="text-xs text-rose-400">{q.options.find(o => o.value === answers[i])?.text || '-'}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => { setStep(0); setAnswers([]); setShowResult(false); }}>
              Retake Quiz
            </Button>
            <div className="mt-4 text-green-700 font-semibold">
              Your attempt has been automatically shared with your partner!
            </div>
          </>
        )}
        {/* Show all attempts for this quiz to both partners */}
        {quizId && <CustomQuizAttemptsList quizId={quizId} />}
      </CardContent>
    </Card>
  );
};
