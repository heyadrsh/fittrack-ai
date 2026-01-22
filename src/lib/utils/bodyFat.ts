/**
 * Body fat calculation using the Navy Method
 * For men: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
 */

export interface BodyFatResult {
  percentage: number;
  category: string;
  description: string;
  targetRange: string;
}

// Body fat categories for men
const BODY_FAT_CATEGORIES = [
  { max: 6, category: 'Essential Fat', description: 'Too low - health risk' },
  { max: 13, category: 'Athletes', description: 'Athletic build' },
  { max: 17, category: 'Fitness', description: 'Fit and lean' },
  { max: 24, category: 'Average', description: 'Acceptable range' },
  { max: 100, category: 'Obese', description: 'Above healthy range' },
];

/**
 * Calculate body fat percentage using the Navy method
 * All measurements in centimeters
 */
export function calculateBodyFatNavy(
  waistCm: number,
  neckCm: number,
  heightCm: number
): number {
  // Validate inputs
  if (waistCm <= neckCm) {
    throw new Error('Waist measurement must be larger than neck measurement');
  }

  if (waistCm <= 0 || neckCm <= 0 || heightCm <= 0) {
    throw new Error('All measurements must be positive numbers');
  }

  // Navy formula for men
  const bodyFat = 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;

  // Round to 1 decimal place
  return Math.round(bodyFat * 10) / 10;
}

/**
 * Get body fat category and description
 */
export function getBodyFatCategory(bodyFatPercentage: number): BodyFatResult {
  const category = BODY_FAT_CATEGORIES.find(c => bodyFatPercentage <= c.max);

  return {
    percentage: bodyFatPercentage,
    category: category?.category || 'Unknown',
    description: category?.description || 'Unable to categorize',
    targetRange: '10-15%', // Athletic to fitness range for recomp goal
  };
}

/**
 * Calculate lean body mass
 */
export function calculateLeanBodyMass(weightKg: number, bodyFatPercentage: number): number {
  const fatMass = weightKg * (bodyFatPercentage / 100);
  return Math.round((weightKg - fatMass) * 10) / 10;
}

/**
 * Calculate fat mass
 */
export function calculateFatMass(weightKg: number, bodyFatPercentage: number): number {
  return Math.round(weightKg * (bodyFatPercentage / 100) * 10) / 10;
}

/**
 * Estimate fat loss needed to reach target body fat
 */
export function calculateFatLossToTarget(
  weightKg: number,
  currentBodyFatPercent: number,
  targetBodyFatPercent: number
): {
  currentFatMass: number;
  targetFatMass: number;
  fatToLose: number;
  estimatedTargetWeight: number;
} {
  const currentLeanMass = calculateLeanBodyMass(weightKg, currentBodyFatPercent);
  const currentFatMass = calculateFatMass(weightKg, currentBodyFatPercent);

  // Assuming lean mass stays the same (ideal recomp scenario)
  // Target weight = lean mass / (1 - target body fat percentage)
  const estimatedTargetWeight = Math.round(currentLeanMass / (1 - targetBodyFatPercent / 100) * 10) / 10;
  const targetFatMass = Math.round((estimatedTargetWeight - currentLeanMass) * 10) / 10;
  const fatToLose = Math.round((currentFatMass - targetFatMass) * 10) / 10;

  return {
    currentFatMass,
    targetFatMass,
    fatToLose,
    estimatedTargetWeight,
  };
}

/**
 * Get body composition summary
 */
export function getBodyComposition(
  weightKg: number,
  waistCm: number,
  neckCm: number,
  heightCm: number
): {
  bodyFatPercentage: number;
  category: BodyFatResult;
  leanMass: number;
  fatMass: number;
  fatLossToTarget: ReturnType<typeof calculateFatLossToTarget>;
} {
  const bodyFatPercentage = calculateBodyFatNavy(waistCm, neckCm, heightCm);
  const category = getBodyFatCategory(bodyFatPercentage);
  const leanMass = calculateLeanBodyMass(weightKg, bodyFatPercentage);
  const fatMass = calculateFatMass(weightKg, bodyFatPercentage);
  const fatLossToTarget = calculateFatLossToTarget(weightKg, bodyFatPercentage, 15); // Target 15% for recomp

  return {
    bodyFatPercentage,
    category,
    leanMass,
    fatMass,
    fatLossToTarget,
  };
}
