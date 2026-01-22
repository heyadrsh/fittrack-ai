# FitTrack AI - Agent Instructions

## Project Overview
Personal fitness tracking web app with AI-powered nutrition analysis.

## Tech Stack
- Next.js 16+ (App Router)
- Supabase (PostgreSQL + Edge Functions)
- Gemini AI for food/body analysis
- Telegram Bot for notifications
- Tailwind CSS (black/white/grey minimalist brutalist)

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Key Patterns
- Use Server Components by default, Client Components only when needed
- All API routes in /app/api folder
- Supabase client: use createServerClient for server, createBrowserClient for client
- Gemini calls should be server-side only (API routes)
- All forms should have loading states and error handling

## Design System
- Colors: black (#000), white (#fff), greys (#1a1a1a to #f5f5f5)
- Borders: 2px solid black (brutalist)
- Spacing: generous (p-6, gap-4 minimum)
- Typography: font-mono for data, font-sans for text

## User Profile (Hardcoded Constants)
```typescript
// lib/constants.ts
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
};
```

## Folder Structure
```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx              # Dashboard
│   │   ├── food/
│   │   ├── workout/
│   │   ├── body/
│   │   ├── water/
│   │   ├── supplements/
│   │   ├── sleep/
│   │   ├── progress/
│   │   ├── reports/
│   │   ├── achievements/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── food/
│   │   ├── workout/
│   │   ├── body/
│   │   ├── water/
│   │   ├── supplements/
│   │   ├── sleep/
│   │   ├── stats/
│   │   ├── reports/
│   │   └── ai/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # Design system
│   ├── dashboard/
│   ├── food/
│   ├── workout/
│   ├── body/
│   ├── charts/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── gemini/
│   │   └── client.ts
│   ├── telegram/
│   │   └── bot.ts
│   ├── utils/
│   │   ├── calories.ts
│   │   ├── bodyFat.ts
│   │   └── dates.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useFoodLog.ts
│   ├── useWorkout.ts
│   └── useStats.ts
└── types/
    └── index.ts
```

## Critical Implementation Details

### Gemini Model Configuration
```typescript
// Use gemini-3-flash-preview model with thinking support
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const config = {
  thinkingConfig: {
    thinkingLevel: 'HIGH',  // Enable deep thinking
  },
};

const model = 'gemini-3-flash-preview';  // Latest model with thinking support
```

### Gemini API - Food Analysis Prompt
```typescript
const FOOD_ANALYSIS_PROMPT = `You are a nutrition expert specializing in Indian cuisine.

Analyze the following food description and return ONLY a JSON object with nutritional information.
Be accurate for Indian foods like paneer (25g protein per 100g), roti (3g protein per piece), dal (7-9g protein per cup cooked), eggs (6g protein each).

Food description: {userInput}

Return ONLY this JSON format, no other text:
{
  "food_name": "standardized name of the food",
  "portion_description": "estimated portion size",
  "calories": number (kcal),
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "confidence": "high" | "medium" | "low"
}

If multiple items, sum them up into one response.
Example: "2 rotis with paneer sabji" = ~400 cal, ~20g protein`;
```

### Navy Body Fat Calculation
```typescript
// Navy Method for men (all measurements in cm)
function calculateBodyFatNavy(waist: number, neck: number, height: number): number {
  // Formula: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
  const bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  return Math.round(bodyFat * 10) / 10; // Round to 1 decimal
}
```

### BMR/TDEE Calculations (Mifflin-St Jeor)
```typescript
// Mifflin-St Jeor Equation for men
function calculateBMR(weightKg: number, heightCm: number, age: number): number {
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

// TDEE with activity multiplier
function calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return Math.round(bmr * multipliers[activityLevel]);
}
```

### XP and Badge System
```typescript
const XP_VALUES = {
  LOG_FOOD: 5,
  COMPLETE_WORKOUT: 20,
  LOG_WATER_250ML: 2,
  LOG_SLEEP: 3,
  LOG_SUPPLEMENT: 2,
  LOG_BODY_METRICS: 10,
  HIT_PROTEIN_GOAL: 15,
  HIT_CALORIE_GOAL: 10,
  NEW_PR: 25
};

const LEVELS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
  7: 3500,
  8: 5500,
  9: 8000,
  10: 12000
};
```

### Workout Split (5-Day Plan)
```typescript
const WORKOUT_PLAN = {
  monday: {
    name: "Push Day (Chest, Shoulders, Triceps)",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "8-10", muscle: "chest", youtube: "rT7DgCr-3pg" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", muscle: "chest", youtube: "8iPEnn-ltC8" },
      { name: "Overhead Press", sets: 4, reps: "8-10", muscle: "shoulders", youtube: "2yjwXTZQDDI" },
      { name: "Lateral Raises", sets: 3, reps: "12-15", muscle: "shoulders", youtube: "3VcKaXpzqRo" },
      { name: "Tricep Pushdowns", sets: 3, reps: "12-15", muscle: "triceps", youtube: "2-LAMcpzODU" },
      { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", muscle: "triceps", youtube: "YbX7Wd8jQ-Q" }
    ]
  },
  tuesday: {
    name: "Pull Day (Back, Biceps)",
    exercises: [
      { name: "Lat Pulldowns", sets: 4, reps: "10-12", muscle: "back", youtube: "CAwf7n6Luuc" },
      { name: "Seated Cable Rows", sets: 4, reps: "10-12", muscle: "back", youtube: "GZbfZ033f74" },
      { name: "Face Pulls", sets: 3, reps: "15-20", muscle: "rear_delts", youtube: "rep-qVOkqgk" },
      { name: "Barbell Curls", sets: 3, reps: "10-12", muscle: "biceps", youtube: "kwG2ipFRgfo" },
      { name: "Hammer Curls", sets: 3, reps: "12-15", muscle: "biceps", youtube: "zC3nLlEvin4" }
    ]
  },
  wednesday: {
    name: "Legs Day (Quads, Hamstrings, Glutes)",
    exercises: [
      { name: "Barbell Squats", sets: 4, reps: "8-10", muscle: "quads", youtube: "bEv6CCg2BC8" },
      { name: "Romanian Deadlifts", sets: 4, reps: "10-12", muscle: "hamstrings", youtube: "7j-2w4-P14I" },
      { name: "Leg Press", sets: 3, reps: "12-15", muscle: "quads", youtube: "IZxyjW7MPJQ" },
      { name: "Leg Curls", sets: 3, reps: "12-15", muscle: "hamstrings", youtube: "1Tq3QdYUuHs" },
      { name: "Calf Raises", sets: 4, reps: "15-20", muscle: "calves", youtube: "gwLzBJYoWlI" }
    ]
  },
  thursday: {
    name: "Upper Body (Chest, Back, Arms)",
    exercises: [
      { name: "Incline Bench Press", sets: 3, reps: "10-12", muscle: "chest", youtube: "8iPEnn-ltC8" },
      { name: "Bent Over Rows", sets: 4, reps: "10-12", muscle: "back", youtube: "FWJR5Ve8bnQ" },
      { name: "Dumbbell Flyes", sets: 3, reps: "12-15", muscle: "chest", youtube: "eozdVDA78K0" },
      { name: "Lat Pulldowns (Close Grip)", sets: 3, reps: "12-15", muscle: "back", youtube: "an1BMInTXLk" },
      { name: "Preacher Curls", sets: 3, reps: "12-15", muscle: "biceps", youtube: "fIWP-FRFNU0" },
      { name: "Skull Crushers", sets: 3, reps: "12-15", muscle: "triceps", youtube: "d_KZxkY_0cM" }
    ]
  },
  friday: {
    name: "Core & Conditioning",
    exercises: [
      { name: "Hanging Leg Raises", sets: 4, reps: "12-15", muscle: "abs", youtube: "hdng3Nm1x_E" },
      { name: "Cable Crunches", sets: 3, reps: "15-20", muscle: "abs", youtube: "7rRWy7-Gokg" },
      { name: "Plank", sets: 3, reps: "60 sec", muscle: "core", youtube: "ASdvN_XEl_c" },
      { name: "Russian Twists", sets: 3, reps: "20 each side", muscle: "obliques", youtube: "wkD8rjkodUI" },
      { name: "Dead Bug", sets: 3, reps: "12 each side", muscle: "core", youtube: "I5xbsA71v1A" },
      { name: "Farmer's Walk", sets: 3, reps: "40m", muscle: "full_body", youtube: "Fkzk_RqlYig" }
    ]
  }
};
```

### Indian Food Nutrition Database
```typescript
const INDIAN_FOOD_NUTRITION = {
  // Dairy
  "paneer_100g": { calories: 265, protein: 18, carbs: 1, fat: 21 },
  "milk_1cup": { calories: 150, protein: 8, carbs: 12, fat: 8 },
  "curd_1cup": { calories: 100, protein: 10, carbs: 6, fat: 4 },
  // Eggs
  "egg_boiled": { calories: 78, protein: 6, carbs: 0.5, fat: 5 },
  "egg_omelette_2eggs": { calories: 180, protein: 12, carbs: 1, fat: 14 },
  // Lentils
  "dal_1cup_cooked": { calories: 230, protein: 18, carbs: 40, fat: 1 },
  "chana_1cup": { calories: 270, protein: 15, carbs: 45, fat: 4 },
  // Breads
  "roti_1piece": { calories: 80, protein: 3, carbs: 15, fat: 1 },
  "paratha_1piece": { calories: 200, protein: 5, carbs: 25, fat: 9 },
  // Rice
  "rice_1cup_cooked": { calories: 200, protein: 4, carbs: 45, fat: 0.5 },
  // Vegetables
  "mixed_sabji_1cup": { calories: 100, protein: 3, carbs: 15, fat: 4 },
  "palak_paneer_1cup": { calories: 300, protein: 15, carbs: 10, fat: 22 },
  // South Indian
  "idli_1piece": { calories: 60, protein: 2, carbs: 12, fat: 0.5 },
  "dosa_1piece": { calories: 170, protein: 4, carbs: 30, fat: 4 },
  // Snacks
  "protein_shake_1scoop": { calories: 120, protein: 24, carbs: 3, fat: 1 }
};
```

## Database Schema
Tables to create in Supabase:
1. users
2. food_logs
3. food_presets
4. workout_plans
5. workout_logs
6. exercises
7. body_metrics
8. progress_photos
9. water_logs
10. supplement_logs
11. sleep_logs
12. user_stats
13. personal_records

See prd.json for detailed schema and SQL migration.

## Notes for Ralph
- Always verify workout suggestions with reliable sources
- Indian food nutrition data should be approximate but reasonable
- UI must be responsive (mobile-first for gym use)
- Keep forms minimal - quick logging is priority
- Test Gemini responses for accuracy before marking stories complete
- Always include "Typecheck passes" verification
- For UI stories, verify in browser before marking complete
