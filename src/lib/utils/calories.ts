/**
 * Calorie and metabolism calculations using Mifflin-St Jeor equation
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little/no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9     // Very hard exercise, physical job
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation (for men)
 * BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number): number {
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

/**
 * Calculate Total Daily Energy Expenditure
 * TDEE = BMR * activity multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate target calories for different goals
 */
export function calculateTargetCalories(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain' | 'recomp'
): number {
  switch (goal) {
    case 'lose':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'maintain':
      return tdee;
    case 'gain':
      return Math.round(tdee * 1.1); // 10% surplus
    case 'recomp':
      return Math.round(tdee * 0.9); // 10% deficit (slight for recomp)
    default:
      return tdee;
  }
}

/**
 * Calculate protein target based on body weight
 * For muscle building/recomp: 1.6-2.2g per kg bodyweight
 */
export function calculateProteinTarget(weightKg: number, goal: 'lose' | 'maintain' | 'gain' | 'recomp'): number {
  const multiplier = goal === 'recomp' || goal === 'gain' ? 2.0 : 1.6;
  return Math.round(weightKg * multiplier);
}

/**
 * Calculate macros breakdown from total calories
 * Typical split: 30% protein, 40% carbs, 30% fat
 */
export function calculateMacros(
  totalCalories: number,
  proteinTarget: number
): { protein: number; carbs: number; fat: number } {
  // Protein: use target (4 cal per gram)
  const proteinCalories = proteinTarget * 4;

  // Fat: 25-30% of remaining calories (9 cal per gram)
  const remainingCalories = totalCalories - proteinCalories;
  const fatCalories = remainingCalories * 0.35;
  const fat = Math.round(fatCalories / 9);

  // Carbs: rest of calories (4 cal per gram)
  const carbCalories = totalCalories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);

  return {
    protein: proteinTarget,
    carbs,
    fat,
  };
}

/**
 * Calculate calorie deficit/surplus
 */
export function calculateDeficit(consumed: number, target: number): {
  difference: number;
  status: 'deficit' | 'surplus' | 'on_target';
  percentage: number;
} {
  const difference = consumed - target;
  const percentage = Math.round((consumed / target) * 100);

  let status: 'deficit' | 'surplus' | 'on_target';
  if (Math.abs(difference) <= 100) {
    status = 'on_target';
  } else if (difference < 0) {
    status = 'deficit';
  } else {
    status = 'surplus';
  }

  return { difference, status, percentage };
}

/**
 * Calculate days to reach goal weight at current rate
 */
export function calculateDaysToGoal(
  currentWeight: number,
  goalWeight: number,
  weeklyChangeKg: number
): number | null {
  if (weeklyChangeKg === 0) return null;

  const weightDiff = goalWeight - currentWeight;
  const weeksNeeded = weightDiff / weeklyChangeKg;

  // If the direction is wrong, return null
  if (weeksNeeded < 0) return null;

  return Math.round(weeksNeeded * 7);
}

/**
 * Get user stats summary
 */
export function getUserStats(weightKg: number, heightCm: number, age: number) {
  const bmr = calculateBMR(weightKg, heightCm, age);
  const tdee = calculateTDEE(bmr, 'moderate'); // Default to moderate (5 days/week gym)
  const targetCalories = calculateTargetCalories(tdee, 'recomp');
  const proteinTarget = calculateProteinTarget(weightKg, 'recomp');
  const macros = calculateMacros(targetCalories, proteinTarget);

  return {
    bmr,
    tdee,
    targetCalories,
    proteinTarget,
    macros,
  };
}
