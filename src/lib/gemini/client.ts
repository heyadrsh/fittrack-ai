'use server';

import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Using Gemini 2.0 Flash with thinking capability
const MODEL_NAME = 'gemini-2.0-flash-thinking-exp-01-21';

export interface FoodAnalysisResult {
  food_name: string;
  portion_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface BodyAnalysisResult {
  estimated_body_fat_range: string;
  strong_areas: string[];
  improvement_areas: string[];
  recommendations: string[];
  overall_assessment: string;
}

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

const BODY_ANALYSIS_PROMPT = `You are a fitness expert analyzing body composition photos.

Analyze this progress photo and provide:
1. Estimated body fat percentage range
2. Visible muscle development areas
3. Areas that could use more focus
4. Specific recommendations for the user's goal (belly fat loss + muscle gain)

Be encouraging but honest. The user is a 23-year-old male, 168cm, 67.7kg, vegetarian, training 5 days/week.

Return in this JSON format:
{
  "estimated_body_fat_range": "X-Y%",
  "strong_areas": ["area1", "area2"],
  "improvement_areas": ["area1", "area2"],
  "recommendations": ["specific action 1", "specific action 2"],
  "overall_assessment": "2-3 sentences of feedback"
}`;

export async function analyzeFood(userInput: string): Promise<FoodAnalysisResult> {
  try {
    const prompt = FOOD_ANALYSIS_PROMPT.replace('{userInput}', userInput);

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text || '';

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]) as FoodAnalysisResult;

    // Validate required fields
    if (
      typeof result.calories !== 'number' ||
      typeof result.protein_g !== 'number' ||
      typeof result.carbs_g !== 'number' ||
      typeof result.fat_g !== 'number'
    ) {
      throw new Error('Invalid nutrition data');
    }

    return result;
  } catch (error) {
    console.error('Food analysis error:', error);
    throw new Error('Failed to analyze food. Please try again or enter values manually.');
  }
}

export async function analyzeBodyPhoto(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<BodyAnalysisResult> {
  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: BODY_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    const text = response.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]) as BodyAnalysisResult;

    // Validate required fields
    if (
      !result.estimated_body_fat_range ||
      !Array.isArray(result.strong_areas) ||
      !Array.isArray(result.improvement_areas) ||
      !Array.isArray(result.recommendations) ||
      !result.overall_assessment
    ) {
      throw new Error('Invalid body analysis data');
    }

    return result;
  } catch (error) {
    console.error('Body analysis error:', error);
    throw new Error('Failed to analyze photo. Please try again.');
  }
}

export async function generateWorkoutSuggestion(
  exerciseHistory: { name: string; weight: number; reps: number; date: string }[],
  currentExercise: string
): Promise<string> {
  try {
    const prompt = `Based on this exercise history for ${currentExercise}:
${JSON.stringify(exerciseHistory, null, 2)}

Provide a brief suggestion (1-2 sentences) for the next workout. Consider progressive overload principles.
If the user has been hitting target reps consistently, suggest increasing weight by 2.5kg.
Return only the suggestion text, no JSON.`;

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || 'Keep up the good work! Focus on proper form.';
  } catch (error) {
    console.error('Workout suggestion error:', error);
    return 'Keep up the good work! Focus on proper form.';
  }
}

export async function generateWeeklyReport(data: {
  workoutsCompleted: number;
  totalWorkouts: number;
  avgCalories: number;
  avgProtein: number;
  weightChange: number;
  proteinGoalHitDays: number;
}): Promise<string> {
  try {
    const prompt = `Generate a brief weekly fitness report for a user with these stats:
- Workouts completed: ${data.workoutsCompleted}/${data.totalWorkouts}
- Average daily calories: ${data.avgCalories} (target: 2200)
- Average daily protein: ${data.avgProtein}g (target: 135g)
- Weight change: ${data.weightChange > 0 ? '+' : ''}${data.weightChange}kg
- Days protein goal hit: ${data.proteinGoalHitDays}/7

User goal: Body recomposition (lose belly fat, gain muscle)
Diet: Vegetarian + eggs (Indian cuisine)

Provide:
1. A 2-3 sentence summary
2. What went well (1-2 points)
3. Areas to improve (1-2 points)
4. One specific action for next week

Keep it encouraging but actionable.`;

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || 'Report generation unavailable. Keep tracking your progress!';
  } catch (error) {
    console.error('Weekly report error:', error);
    return 'Report generation unavailable. Keep tracking your progress!';
  }
}
