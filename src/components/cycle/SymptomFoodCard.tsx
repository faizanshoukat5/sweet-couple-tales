import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SYMPTOMS, ALL_SYMPTOM_KEYS, getFoodSuggestionsForSymptoms } from '@/lib/symptomFoodSuggestions';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  symptoms: string[];
  onToggleSymptom: (key: string) => void;
}

export default function SymptomFoodCard({ symptoms, onToggleSymptom }: Props) {
  const [expandedSymptom, setExpandedSymptom] = useState<string | null>(null);
  const foodSuggestions = getFoodSuggestionsForSymptoms(symptoms);

  return (
    <>
      {/* Symptom Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>🩺</span> How are you feeling?
          </CardTitle>
          <p className="text-sm text-muted-foreground">Select your symptoms to get personalized food suggestions</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_SYMPTOM_KEYS.map((key) => {
              const s = SYMPTOMS[key];
              const isActive = symptoms.includes(key);
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleSymptom(key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                    transition-all duration-200 border cursor-pointer
                    ${isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }
                  `}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Food Suggestions */}
      <AnimatePresence mode="wait">
        {foodSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Apple className="h-5 w-5 text-primary" />
                  <span>What to Eat Right Now</span>
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Science-backed nutrition for your {symptoms.length} selected symptom{symptoms.length > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {foodSuggestions.map(({ key, symptom }) => {
                  const isExpanded = expandedSymptom === key;
                  return (
                    <div key={key} className="rounded-xl border border-border/50 overflow-hidden">
                      <button
                        onClick={() => setExpandedSymptom(isExpanded ? null : key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{symptom.emoji}</span>
                          <span className="font-semibold text-foreground">{symptom.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {symptom.foods.length} foods
                          </Badge>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-2">
                              {symptom.foods.map((food, i) => (
                                <motion.div
                                  key={food.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
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
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
