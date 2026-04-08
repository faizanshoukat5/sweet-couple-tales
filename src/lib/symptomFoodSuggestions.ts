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

export interface CyclePhaseInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  dayRange: string;
  foods: FoodSuggestion[];
  avoid: string[];
}

export interface MoodFoodInfo {
  label: string;
  emoji: string;
  description: string;
  foods: FoodSuggestion[];
}

// ─── Symptom → Food Database ───────────────────────────────────────

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

// ─── Cycle Phase → Meal Plan Database ──────────────────────────────

export const CYCLE_PHASES: Record<string, CyclePhaseInfo> = {
  menstrual: {
    name: 'Menstrual Phase',
    emoji: '🩸',
    color: 'rose',
    description: 'Your body is shedding the uterine lining. Focus on iron-rich, anti-inflammatory, and comforting foods to replenish lost nutrients and ease discomfort.',
    dayRange: 'Days 1–5',
    foods: [
      { name: 'Red Meat (Lean)', emoji: '🥩', reason: 'Heme iron is 2-3x more absorbable than plant iron — critical during blood loss', nutrients: ['Heme Iron', 'B12', 'Zinc'] },
      { name: 'Dark Leafy Greens', emoji: '🥬', reason: 'Spinach, kale, and chard provide iron, folate, and magnesium to fight fatigue', nutrients: ['Iron', 'Folate', 'Magnesium'] },
      { name: 'Warming Soups & Stews', emoji: '🍲', reason: 'Warm foods improve circulation and soothe cramping; easy to digest when energy is low', nutrients: ['Hydration', 'Minerals', 'Protein'] },
      { name: 'Beets', emoji: '🫒', reason: 'Nitrates improve blood flow; iron and folate support blood cell production', nutrients: ['Iron', 'Folate', 'Nitrates'] },
      { name: 'Dark Chocolate', emoji: '🍫', reason: 'Magnesium eases cramps; endorphin release improves mood', nutrients: ['Magnesium', 'Iron', 'Antioxidants'] },
      { name: 'Chamomile or Ginger Tea', emoji: '🍵', reason: 'Anti-spasmodic and anti-inflammatory; reduces bloating and pain', nutrients: ['Apigenin', 'Gingerol'] },
    ],
    avoid: ['Excess caffeine (constricts blood vessels)', 'Salty processed foods (worsens bloating)', 'Alcohol (increases inflammation & dehydration)', 'Icy cold drinks (may worsen cramping)'],
  },
  follicular: {
    name: 'Follicular Phase',
    emoji: '🌱',
    color: 'emerald',
    description: 'Estrogen is rising, energy is building. Your body is preparing an egg — eat light, fresh foods packed with phytoestrogens and fermented probiotics.',
    dayRange: 'Days 6–13',
    foods: [
      { name: 'Sprouted Grains & Seeds', emoji: '🌾', reason: 'Phytoestrogens in flax and sesame support healthy estrogen metabolism', nutrients: ['Lignans', 'Fiber', 'Omega-3'] },
      { name: 'Avocado', emoji: '🥑', reason: 'Healthy fats support hormone production; vitamin E aids follicle development', nutrients: ['Vitamin E', 'Healthy Fats', 'Potassium'] },
      { name: 'Fermented Foods', emoji: '🥒', reason: 'Kimchi, sauerkraut, and kefir support estrogen detoxification via gut health', nutrients: ['Probiotics', 'Vitamin K2', 'B Vitamins'] },
      { name: 'Citrus Fruits', emoji: '🍊', reason: 'Vitamin C boosts iron absorption and supports collagen for growing follicle', nutrients: ['Vitamin C', 'Folate', 'Flavonoids'] },
      { name: 'Lean Chicken or Tofu', emoji: '🍗', reason: 'Protein supports rising energy demands; B6 aids estrogen metabolism', nutrients: ['Protein', 'B6', 'Selenium'] },
      { name: 'Broccoli Sprouts', emoji: '🥦', reason: 'Sulforaphane supports liver detoxification of excess estrogen', nutrients: ['Sulforaphane', 'Vitamin C', 'Fiber'] },
    ],
    avoid: ['Heavy fried foods (sluggish digestion slows rising energy)', 'Excess sugar (disrupts estrogen balance)', 'Processed soy (may overload estrogen pathways)'],
  },
  ovulation: {
    name: 'Ovulation Phase',
    emoji: '🥚',
    color: 'amber',
    description: 'Peak estrogen + LH surge triggers egg release. Energy and libido are highest. Eat antioxidant-rich, anti-inflammatory foods to support this peak.',
    dayRange: 'Days 14–16',
    foods: [
      { name: 'Wild Salmon', emoji: '🐟', reason: 'Omega-3 DHA supports egg quality and reduces ovulatory inflammation', nutrients: ['Omega-3 DHA', 'Astaxanthin', 'Vitamin D'] },
      { name: 'Berries (Mixed)', emoji: '🫐', reason: 'Antioxidants protect the egg from oxidative stress during release', nutrients: ['Anthocyanins', 'Vitamin C', 'Fiber'] },
      { name: 'Whole Grains', emoji: '🌾', reason: 'B vitamins and fiber support the energy demands of peak hormone activity', nutrients: ['B Vitamins', 'Fiber', 'Manganese'] },
      { name: 'Asparagus', emoji: '🌿', reason: 'Folate and glutathione support cellular health during ovulation', nutrients: ['Folate', 'Glutathione', 'Vitamin K'] },
      { name: 'Raw Nuts', emoji: '🥜', reason: 'Vitamin E and selenium protect reproductive cells from damage', nutrients: ['Vitamin E', 'Selenium', 'Zinc'] },
      { name: 'Coconut Water', emoji: '🥥', reason: 'Natural electrolytes support hydration at metabolic peak', nutrients: ['Electrolytes', 'Potassium', 'Manganese'] },
    ],
    avoid: ['Alcohol (impairs egg quality and liver function)', 'Trans fats (linked to ovulatory infertility in Harvard study)', 'Excess caffeine (may delay ovulation)'],
  },
  luteal: {
    name: 'Luteal Phase',
    emoji: '🌙',
    color: 'violet',
    description: 'Progesterone rises, metabolism increases ~100-300 calories/day. PMS symptoms may appear. Focus on complex carbs, magnesium, and serotonin-boosting foods.',
    dayRange: 'Days 17–28',
    foods: [
      { name: 'Sweet Potatoes', emoji: '🍠', reason: 'Complex carbs boost serotonin; vitamin A supports progesterone production', nutrients: ['Vitamin A', 'Complex Carbs', 'Fiber'] },
      { name: 'Sunflower Seeds', emoji: '🌻', reason: 'Selenium and vitamin E support progesterone levels in the luteal phase', nutrients: ['Selenium', 'Vitamin E', 'Magnesium'] },
      { name: 'Brown Rice', emoji: '🍚', reason: 'Slow-release carbs prevent blood sugar crashes that worsen PMS mood', nutrients: ['B Vitamins', 'Magnesium', 'Fiber'] },
      { name: 'Turkey', emoji: '🦃', reason: 'Tryptophan converts to serotonin then melatonin — fights PMS mood + sleep issues', nutrients: ['Tryptophan', 'Protein', 'B6'] },
      { name: 'Dark Chocolate', emoji: '🍫', reason: 'Magnesium + endorphins address both cramp prevention and cravings', nutrients: ['Magnesium', 'Iron', 'Theobromine'] },
      { name: 'Chickpeas', emoji: '🫘', reason: 'B6 and magnesium reduce PMS severity by 30% in clinical trials', nutrients: ['B6', 'Magnesium', 'Protein'] },
    ],
    avoid: ['Excess salt (worsens water retention)', 'Refined sugar (blood sugar rollercoaster worsens PMS)', 'Caffeine (increases anxiety and breast tenderness)', 'Alcohol (depletes B vitamins and disrupts sleep)'],
  },
};

export type CyclePhaseKey = keyof typeof CYCLE_PHASES;

export function getCurrentCyclePhase(lastPeriodStart: Date | null, cycleLength: number): CyclePhaseKey | null {
  if (!lastPeriodStart || !cycleLength) return null;
  const today = new Date();
  const diffMs = today.getTime() - lastPeriodStart.getTime();
  const rawDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // Wrap around so cycle resets after cycleLength days
  const dayInCycle = ((rawDay % cycleLength) + cycleLength) % cycleLength;

  const periodEnd = Math.min(5, cycleLength - 1);
  const ovulationDay = cycleLength - 14;

  if (dayInCycle <= periodEnd) return 'menstrual';
  if (dayInCycle < ovulationDay - 5) return 'follicular';
  if (dayInCycle <= ovulationDay + 1) return 'ovulation';
  return 'luteal';
}

// ─── Mood → Food Database ──────────────────────────────────────────

export const MOODS: Record<string, MoodFoodInfo> = {
  happy: {
    label: 'Happy',
    emoji: '😊',
    description: 'You\'re feeling great! Maintain those good vibes with brain-nourishing foods.',
    foods: [
      { name: 'Blueberries', emoji: '🫐', reason: 'Flavonoids increase blood flow to the brain, sustaining positive mood', nutrients: ['Anthocyanins', 'Vitamin C', 'Fiber'] },
      { name: 'Dark Chocolate', emoji: '🍫', reason: 'Phenylethylamine triggers endorphin release — the "love chemical"', nutrients: ['PEA', 'Magnesium', 'Flavanols'] },
      { name: 'Green Tea', emoji: '🍵', reason: 'L-theanine promotes calm alertness without the jitters', nutrients: ['L-theanine', 'EGCG', 'Caffeine'] },
    ],
  },
  sad: {
    label: 'Sad',
    emoji: '😢',
    description: 'Low mood can be linked to low serotonin. These foods boost your natural feel-good chemicals.',
    foods: [
      { name: 'Salmon', emoji: '🐟', reason: 'Omega-3 DHA is literally part of brain cell membranes — low levels linked to depression', nutrients: ['Omega-3 DHA', 'B12', 'Vitamin D'] },
      { name: 'Bananas', emoji: '🍌', reason: 'Tryptophan + vitamin B6 = serotonin production fuel', nutrients: ['Tryptophan', 'B6', 'Potassium'] },
      { name: 'Walnuts', emoji: '🌰', reason: 'ALA omega-3 and polyphenols shown to reduce depressive symptoms', nutrients: ['Omega-3 ALA', 'Polyphenols', 'Magnesium'] },
      { name: 'Spinach', emoji: '🥬', reason: 'Folate deficiency is linked to depression — spinach is one of the richest sources', nutrients: ['Folate', 'Iron', 'Magnesium'] },
      { name: 'Turmeric Latte', emoji: '☕', reason: 'Curcumin increases BDNF (brain growth factor), shown to rival antidepressants in studies', nutrients: ['Curcumin', 'Piperine', 'Calcium'] },
    ],
  },
  anxious: {
    label: 'Anxious',
    emoji: '😰',
    description: 'Anxiety often relates to cortisol and GABA imbalances. These foods calm your nervous system.',
    foods: [
      { name: 'Chamomile Tea', emoji: '🌼', reason: 'Apigenin binds to GABA receptors, reducing anxiety as well as some medications in studies', nutrients: ['Apigenin', 'Bisabolol', 'Luteolin'] },
      { name: 'Avocado', emoji: '🥑', reason: 'B vitamins support adrenal health; healthy fats stabilize blood sugar', nutrients: ['B5', 'B6', 'Magnesium'] },
      { name: 'Almonds', emoji: '🥜', reason: 'Magnesium is nature\'s relaxant — most women are deficient', nutrients: ['Magnesium', 'Vitamin E', 'Riboflavin'] },
      { name: 'Oats', emoji: '🥣', reason: 'Complex carbs increase serotonin; beta-glucan stabilizes blood sugar', nutrients: ['Beta-glucan', 'B Vitamins', 'Magnesium'] },
      { name: 'Yogurt', emoji: '🥛', reason: 'Probiotics in the gut produce GABA, the brain\'s calming neurotransmitter', nutrients: ['Probiotics', 'Calcium', 'B12'] },
    ],
  },
  irritable: {
    label: 'Irritable',
    emoji: '😤',
    description: 'Irritability often spikes with blood sugar swings and hormone fluctuations. Stabilize with these.',
    foods: [
      { name: 'Eggs', emoji: '🥚', reason: 'Choline supports mood regulation; protein stabilizes blood sugar', nutrients: ['Choline', 'B12', 'Protein'] },
      { name: 'Sweet Potatoes', emoji: '🍠', reason: 'Slow-burning carbs prevent the blood sugar crashes that trigger irritability', nutrients: ['Complex Carbs', 'Vitamin A', 'Potassium'] },
      { name: 'Pumpkin Seeds', emoji: '🎃', reason: 'Zinc, magnesium, and tryptophan — triple calming effect', nutrients: ['Zinc', 'Magnesium', 'Tryptophan'] },
      { name: 'Oranges', emoji: '🍊', reason: 'Vitamin C lowers cortisol levels, reducing stress-driven irritability', nutrients: ['Vitamin C', 'Folate', 'Flavonoids'] },
    ],
  },
  stressed: {
    label: 'Stressed',
    emoji: '🥵',
    description: 'Chronic stress depletes B vitamins, magnesium, and vitamin C. Replenish with adaptogenic foods.',
    foods: [
      { name: 'Ashwagandha Latte', emoji: '☕', reason: 'Withanolides lower cortisol by 30% in clinical studies', nutrients: ['Withanolides', 'Iron', 'Antioxidants'] },
      { name: 'Pistachios', emoji: '🥜', reason: 'Rhythmic shelling slows eating; nutrients lower vascular stress response', nutrients: ['B6', 'Potassium', 'Antioxidants'] },
      { name: 'Bell Peppers', emoji: '🫑', reason: 'More vitamin C than oranges — cortisol depletes vitamin C rapidly', nutrients: ['Vitamin C', 'Vitamin A', 'B6'] },
      { name: 'Lentil Soup', emoji: '🍲', reason: 'Folate + iron + protein in a warm, comforting format', nutrients: ['Folate', 'Iron', 'Protein'] },
      { name: 'Mango', emoji: '🥭', reason: 'Linalool compound has documented anti-anxiety effects', nutrients: ['Vitamin C', 'Linalool', 'Vitamin A'] },
    ],
  },
  tired: {
    label: 'Tired',
    emoji: '🥱',
    description: 'Fatigue during your cycle is real. These foods provide sustained energy without crashes.',
    foods: [
      { name: 'Matcha', emoji: '🍵', reason: 'L-theanine + caffeine = 4-6 hours of calm energy (no crash)', nutrients: ['L-theanine', 'Caffeine', 'EGCG'] },
      { name: 'Eggs + Avocado Toast', emoji: '🥚', reason: 'Perfect macro combo: protein + healthy fats + complex carbs', nutrients: ['Protein', 'Healthy Fats', 'B Vitamins'] },
      { name: 'Quinoa Bowl', emoji: '🌾', reason: 'Complete protein with iron and magnesium for energy metabolism', nutrients: ['Complete Protein', 'Iron', 'Magnesium'] },
      { name: 'Beet Juice', emoji: '🧃', reason: 'Nitrates improve oxygen delivery to muscles by 16% in studies', nutrients: ['Nitrates', 'Iron', 'Folate'] },
    ],
  },
  emotional: {
    label: 'Emotional',
    emoji: '🥺',
    description: 'Feeling extra sensitive? These foods support emotional balance through neurotransmitter support.',
    foods: [
      { name: 'Warm Oatmeal', emoji: '🥣', reason: 'Comfort food that actually works — complex carbs boost serotonin naturally', nutrients: ['Beta-glucan', 'Tryptophan', 'Iron'] },
      { name: 'Honey + Warm Milk', emoji: '🍯', reason: 'Tryptophan from milk + glucose from honey optimizes serotonin entry to brain', nutrients: ['Tryptophan', 'Calcium', 'Natural Sugars'] },
      { name: 'Berries with Yogurt', emoji: '🫐', reason: 'Gut-brain axis support + antioxidants that protect mood-regulating neurons', nutrients: ['Probiotics', 'Anthocyanins', 'Calcium'] },
      { name: 'Herbal Tea (Lavender)', emoji: '🌸', reason: 'Linalool activates parasympathetic nervous system within 10 minutes', nutrients: ['Linalool', 'Linalyl acetate'] },
    ],
  },
};

export const ALL_MOOD_KEYS = Object.keys(MOODS);

export function getFoodSuggestionsForMood(mood: string): MoodFoodInfo | null {
  return MOODS[mood] ?? null;
}
