export interface FoodSuggestion {
  name: string;
  emoji: string;
  reason: string;
  nutrients: string[];
}

export interface SymptomInfo {
  label: string;
  emoji: string;
  foods: FoodSuggestion[];
}

export const SYMPTOMS: Record<string, SymptomInfo> = {
  cramps: {
    label: 'Cramps',
    emoji: '😣',
    foods: [
      { name: 'Dark Chocolate (70%+)', emoji: '🍫', reason: 'Magnesium relaxes uterine muscles and reduces prostaglandins', nutrients: ['Magnesium', 'Iron', 'Antioxidants'] },
      { name: 'Bananas', emoji: '🍌', reason: 'Potassium reduces muscle cramping and water retention', nutrients: ['Potassium', 'Vitamin B6', 'Fiber'] },
      { name: 'Salmon', emoji: '🐟', reason: 'Omega-3 fatty acids are natural anti-inflammatories', nutrients: ['Omega-3', 'Vitamin D', 'Protein'] },
      { name: 'Ginger Tea', emoji: '🫚', reason: 'Gingerol compounds reduce pain as effectively as ibuprofen in studies', nutrients: ['Gingerol', 'Antioxidants'] },
      { name: 'Spinach', emoji: '🥬', reason: 'Iron replenishes blood loss; magnesium eases muscle tension', nutrients: ['Iron', 'Magnesium', 'Folate'] },
    ],
  },
  bloating: {
    label: 'Bloating',
    emoji: '🫧',
    foods: [
      { name: 'Cucumber', emoji: '🥒', reason: 'High water content acts as a natural diuretic', nutrients: ['Water', 'Potassium', 'Fiber'] },
      { name: 'Peppermint Tea', emoji: '🍵', reason: 'Relaxes digestive tract muscles, reduces gas', nutrients: ['Menthol', 'Rosmarinic acid'] },
      { name: 'Pineapple', emoji: '🍍', reason: 'Bromelain enzyme aids protein digestion and reduces inflammation', nutrients: ['Bromelain', 'Vitamin C', 'Manganese'] },
      { name: 'Yogurt', emoji: '🥛', reason: 'Probiotics restore gut balance and reduce gas production', nutrients: ['Probiotics', 'Calcium', 'Protein'] },
      { name: 'Fennel Seeds', emoji: '🌿', reason: 'Anethole relaxes GI smooth muscle, relieving gas', nutrients: ['Anethole', 'Fiber', 'Potassium'] },
    ],
  },
  headache: {
    label: 'Headache',
    emoji: '🤕',
    foods: [
      { name: 'Watermelon', emoji: '🍉', reason: 'Dehydration is a top headache trigger — watermelon is 92% water', nutrients: ['Water', 'Magnesium', 'Vitamin A'] },
      { name: 'Almonds', emoji: '🥜', reason: 'Magnesium deficiency is linked to menstrual migraines', nutrients: ['Magnesium', 'Riboflavin', 'Vitamin E'] },
      { name: 'Sweet Potatoes', emoji: '🍠', reason: 'Complex carbs stabilize blood sugar to prevent headaches', nutrients: ['Vitamin A', 'Potassium', 'Fiber'] },
      { name: 'Avocado', emoji: '🥑', reason: 'Healthy fats and magnesium support vascular function', nutrients: ['Magnesium', 'Healthy Fats', 'Potassium'] },
      { name: 'Chamomile Tea', emoji: '🌼', reason: 'Anti-inflammatory and calming, reduces tension headaches', nutrients: ['Apigenin', 'Bisabolol'] },
    ],
  },
  fatigue: {
    label: 'Fatigue',
    emoji: '😴',
    foods: [
      { name: 'Oatmeal', emoji: '🥣', reason: 'Slow-release carbs provide sustained energy without crashes', nutrients: ['Iron', 'B Vitamins', 'Fiber'] },
      { name: 'Eggs', emoji: '🥚', reason: 'Complete protein with B12 for energy metabolism', nutrients: ['B12', 'Iron', 'Protein'] },
      { name: 'Lentils', emoji: '🫘', reason: 'Iron-rich plant protein combats anemia-related fatigue', nutrients: ['Iron', 'Folate', 'Protein'] },
      { name: 'Oranges', emoji: '🍊', reason: 'Vitamin C boosts iron absorption and fights oxidative fatigue', nutrients: ['Vitamin C', 'Folate', 'Potassium'] },
      { name: 'Quinoa', emoji: '🌾', reason: 'All 9 essential amino acids plus iron and magnesium', nutrients: ['Iron', 'Magnesium', 'Complete Protein'] },
    ],
  },
  mood_swings: {
    label: 'Mood Swings',
    emoji: '🎭',
    foods: [
      { name: 'Walnuts', emoji: '🌰', reason: 'Omega-3 ALA supports serotonin production', nutrients: ['Omega-3', 'Magnesium', 'Melatonin'] },
      { name: 'Turkey', emoji: '🍗', reason: 'Tryptophan is a precursor to mood-regulating serotonin', nutrients: ['Tryptophan', 'B6', 'Protein'] },
      { name: 'Berries', emoji: '🫐', reason: 'Anthocyanins reduce cortisol and boost dopamine pathways', nutrients: ['Anthocyanins', 'Vitamin C', 'Fiber'] },
      { name: 'Fermented Foods', emoji: '🥬', reason: 'Gut-brain axis: probiotics influence serotonin (90% made in gut)', nutrients: ['Probiotics', 'B Vitamins', 'Vitamin K'] },
      { name: 'Seeds (Flax/Chia)', emoji: '🌱', reason: 'Omega-3 and zinc support neurotransmitter function', nutrients: ['Omega-3', 'Zinc', 'Fiber'] },
    ],
  },
  acne: {
    label: 'Acne',
    emoji: '😖',
    foods: [
      { name: 'Carrots', emoji: '🥕', reason: 'Beta-carotene converts to vitamin A, regulating skin cell turnover', nutrients: ['Vitamin A', 'Fiber', 'Antioxidants'] },
      { name: 'Green Tea', emoji: '🍵', reason: 'EGCG reduces sebum production and fights inflammation', nutrients: ['EGCG', 'Catechins', 'L-theanine'] },
      { name: 'Tomatoes', emoji: '🍅', reason: 'Lycopene protects skin from oxidative damage', nutrients: ['Lycopene', 'Vitamin C', 'Vitamin K'] },
      { name: 'Broccoli', emoji: '🥦', reason: 'Sulforaphane detoxifies hormones that trigger breakouts', nutrients: ['Sulforaphane', 'Vitamin C', 'Zinc'] },
      { name: 'Wild-caught Fish', emoji: '🐠', reason: 'EPA reduces inflammatory markers linked to acne', nutrients: ['EPA/DHA', 'Zinc', 'Selenium'] },
    ],
  },
  cravings: {
    label: 'Cravings',
    emoji: '🤤',
    foods: [
      { name: 'Dates with Nut Butter', emoji: '🫘', reason: 'Natural sweetness + protein/fat prevents blood sugar spikes', nutrients: ['Fiber', 'Healthy Fats', 'Magnesium'] },
      { name: 'Trail Mix', emoji: '🥜', reason: 'Balanced combo of healthy fats, protein, and natural sugars', nutrients: ['Healthy Fats', 'Protein', 'Iron'] },
      { name: 'Greek Yogurt + Honey', emoji: '🍯', reason: 'Satisfies sweet cravings with protein to keep you full', nutrients: ['Protein', 'Calcium', 'Probiotics'] },
      { name: 'Frozen Grapes', emoji: '🍇', reason: 'Ice cream-like texture with natural sugars and antioxidants', nutrients: ['Resveratrol', 'Vitamin K', 'Vitamin C'] },
      { name: 'Roasted Chickpeas', emoji: '🫛', reason: 'Crunchy, salty satisfaction with fiber and protein', nutrients: ['Protein', 'Fiber', 'Folate'] },
    ],
  },
  insomnia: {
    label: 'Insomnia',
    emoji: '🌙',
    foods: [
      { name: 'Tart Cherry Juice', emoji: '🍒', reason: 'Natural melatonin source — studies show 84 min more sleep', nutrients: ['Melatonin', 'Tryptophan', 'Anthocyanins'] },
      { name: 'Warm Milk', emoji: '🥛', reason: 'Tryptophan + calcium supports melatonin synthesis', nutrients: ['Tryptophan', 'Calcium', 'Magnesium'] },
      { name: 'Kiwi', emoji: '🥝', reason: 'Serotonin and folate improve sleep onset by 42% in studies', nutrients: ['Serotonin', 'Vitamin C', 'Folate'] },
      { name: 'Passionflower Tea', emoji: '🌺', reason: 'GABA-boosting compounds promote deep, restful sleep', nutrients: ['GABA', 'Flavonoids', 'Harmine'] },
      { name: 'Pumpkin Seeds', emoji: '🎃', reason: 'Zinc + magnesium + tryptophan — triple sleep support', nutrients: ['Zinc', 'Magnesium', 'Tryptophan'] },
    ],
  },
  back_pain: {
    label: 'Back Pain',
    emoji: '💆',
    foods: [
      { name: 'Turmeric Golden Milk', emoji: '🥛', reason: 'Curcumin is a potent anti-inflammatory, rivaling NSAIDs', nutrients: ['Curcumin', 'Piperine', 'Calcium'] },
      { name: 'Cherries', emoji: '🍒', reason: 'Anthocyanins block COX-1 and COX-2 pain enzymes', nutrients: ['Anthocyanins', 'Vitamin C', 'Melatonin'] },
      { name: 'Bone Broth', emoji: '🍲', reason: 'Collagen and glycine support connective tissue and reduce inflammation', nutrients: ['Collagen', 'Glycine', 'Minerals'] },
      { name: 'Sardines', emoji: '🐟', reason: 'Omega-3 plus calcium and vitamin D for bone & muscle health', nutrients: ['Omega-3', 'Calcium', 'Vitamin D'] },
      { name: 'Edamame', emoji: '🫛', reason: 'Plant estrogens may modulate pain sensitivity during menstruation', nutrients: ['Isoflavones', 'Protein', 'Magnesium'] },
    ],
  },
  nausea: {
    label: 'Nausea',
    emoji: '🤢',
    foods: [
      { name: 'Fresh Ginger', emoji: '🫚', reason: 'Gingerols and shogaols block serotonin receptors in the gut', nutrients: ['Gingerol', 'Shogaol', 'Zinc'] },
      { name: 'Crackers (Whole Grain)', emoji: '🍘', reason: 'Bland, starchy foods absorb stomach acid', nutrients: ['Complex Carbs', 'Fiber', 'B Vitamins'] },
      { name: 'Rice', emoji: '🍚', reason: 'Easy to digest, gentle on an upset stomach', nutrients: ['Carbohydrates', 'Manganese', 'B Vitamins'] },
      { name: 'Lemon Water', emoji: '🍋', reason: 'Citric acid stimulates digestive enzymes; scent reduces nausea', nutrients: ['Vitamin C', 'Citric Acid', 'Potassium'] },
      { name: 'Applesauce', emoji: '🍎', reason: 'Pectin soothes the digestive tract; gentle natural sugars', nutrients: ['Pectin', 'Vitamin C', 'Fiber'] },
    ],
  },
};

export const ALL_SYMPTOM_KEYS = Object.keys(SYMPTOMS);

export function getFoodSuggestionsForSymptoms(symptoms: string[]): { symptom: SymptomInfo; key: string }[] {
  return symptoms
    .filter((s) => SYMPTOMS[s])
    .map((s) => ({ key: s, symptom: SYMPTOMS[s] }));
}
