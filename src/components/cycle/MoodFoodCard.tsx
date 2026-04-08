import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOODS, ALL_MOOD_KEYS, type MoodFoodInfo } from '@/lib/symptomFoodSuggestions';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function MoodFoodCard() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const moodInfo: MoodFoodInfo | null = selectedMood ? MOODS[selectedMood] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" />
          <span>How's your mood?</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select your mood to see what foods will help you feel better
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selector */}
        <div className="flex flex-wrap gap-2">
          {ALL_MOOD_KEYS.map((key) => {
            const m = MOODS[key];
            const isActive = selectedMood === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(isActive ? null : key)}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-medium
                  transition-all duration-200 border cursor-pointer
                  ${isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }
                `}
              >
                <span className="text-lg">{m.emoji}</span>
                <span>{m.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Food Suggestions for Selected Mood */}
        <AnimatePresence mode="wait">
          {moodInfo && (
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm text-foreground font-medium flex items-center gap-2">
                  <span className="text-xl">{moodInfo.emoji}</span>
                  {moodInfo.description}
                </p>
              </div>

              <div className="space-y-2">
                {moodInfo.foods.map((food, i) => (
                  <motion.div
                    key={food.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{food.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm">{food.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{food.reason}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {food.nutrients.map((n) => (
                          <span key={n} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
