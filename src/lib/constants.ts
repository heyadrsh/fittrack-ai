// User Profile Constants
export const USER_PROFILE = {
  PIN: '0007',
  WEIGHT_KG: 67.7,
  HEIGHT_CM: 168,
  AGE: 23,
  GOAL: 'body_recomposition',
  DIET: 'vegetarian_eggs',
  WORKOUT_DAYS: [1, 2, 3, 4, 5], // Mon-Fri
  WATER_GOAL_ML: 3000,
  CALORIE_TARGET: 2200,
  PROTEIN_TARGET_G: 135,
} as const;

// XP Values for gamification
export const XP_VALUES = {
  LOG_FOOD: 5,
  COMPLETE_WORKOUT: 20,
  LOG_WATER_250ML: 2,
  LOG_SLEEP: 3,
  LOG_SUPPLEMENT: 2,
  LOG_BODY_METRICS: 10,
  HIT_PROTEIN_GOAL: 15,
  HIT_CALORIE_GOAL: 10,
  NEW_PR: 25,
} as const;

// Level thresholds
export const LEVELS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
  7: 3500,
  8: 5500,
  9: 8000,
  10: 12000,
};

// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

// Supplement list
export const SUPPLEMENTS = [
  'Protein Powder',
  'Creatine',
  'Multivitamin',
  'Fish Oil',
  'Vitamin D',
] as const;

// Meal types
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
] as const;

export type MealType = typeof MEAL_TYPES[number];
export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;
