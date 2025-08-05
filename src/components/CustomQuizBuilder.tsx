import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { CUSTOM_QUIZ_TEMPLATE } from './LoveLanguageQuiz';

interface CustomQuizQuestion {
  question: string;
  options: { text: string; value: string }[];
}

export const CustomQuizBuilder: React.FC<{
  onSave: (quiz: CustomQuizQuestion[]) => void;
  onShare?: (quiz: CustomQuizQuestion[]) => void;
}> = ({ onSave, onShare }) => {
  const [questions, setQuestions] = useState<CustomQuizQuestion[]>([...CUSTOM_QUIZ_TEMPLATE]);

  const handleQuestionChange = (idx: number, value: string) => {
    setQuestions(qs => {
      const copy = [...qs];
      copy[idx].question = value;
      return copy;
    });
  };

  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(qs => {
      const copy = [...qs];
      copy[qIdx].options[oIdx].text = value;
      copy[qIdx].options[oIdx].value = value.toLowerCase().replace(/\s+/g, '-');
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions(qs => [
      ...qs,
      { question: '', options: [
        { text: '', value: '' },
        { text: '', value: '' },
        { text: '', value: '' },
        { text: '', value: '' },
      ] }
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs);
  };

  const addOption = (qIdx: number) => {
    setQuestions(qs => {
      const copy = [...qs];
      copy[qIdx].options.push({ text: '', value: '' });
      return copy;
    });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions(qs => {
      const copy = [...qs];
      if (copy[qIdx].options.length > 2) copy[qIdx].options.splice(oIdx, 1);
      return copy;
    });
  };

  return (
    <Card className="max-w-2xl mx-auto my-8 bg-gradient-to-br from-pink-50 via-white to-rose-100 border-0 shadow-lg rounded-2xl">
      <CardContent className="py-8 px-4 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-rose-600 mb-2">Create Your Custom Quiz</h2>
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white/80 rounded-xl p-4 mb-2 shadow">
            <div className="flex items-center gap-2 mb-2">
              <Input
                className="flex-1"
                placeholder={`Question ${qIdx + 1}`}
                value={q.question}
                onChange={e => handleQuestionChange(qIdx, e.target.value)}
              />
              <Button variant="outline" onClick={() => removeQuestion(qIdx)} disabled={questions.length === 1}>
                Remove
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt.text}
                    onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                  />
                  <Button variant="outline" onClick={() => removeOption(qIdx, oIdx)} disabled={q.options.length <= 2}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="secondary" className="mt-2 w-fit" onClick={() => addOption(qIdx)}>
                Add Option
              </Button>
            </div>
          </div>
        ))}
        <Button variant="romantic" onClick={addQuestion} className="w-fit self-center mt-2">Add Question</Button>
        <div className="flex flex-col gap-2 mt-4">
          <Button variant="romantic" className="w-full" onClick={() => onSave(questions)}>
            Save Custom Quiz
          </Button>
          {onShare && (
            <Button variant="secondary" className="w-full" onClick={() => onShare(questions)}>
              Share with Partner
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomQuizBuilder;
