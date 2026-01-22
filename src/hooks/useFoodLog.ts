'use client';

import { useState, useEffect, useCallback } from 'react';
import { USER_PROFILE } from '@/lib/constants';

export interface FoodLog {
  id: string;
  logged_at: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  meal_type?: string;
}

export interface FoodPreset {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function useFoodLog() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [presets, setPresets] = useState<FoodPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totals: FoodTotals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein_g || 0),
      carbs: acc.carbs + (log.carbs_g || 0),
      fat: acc.fat + (log.fat_g || 0),
      fiber: acc.fiber + (log.fiber_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // Calculate percentages
  const caloriePercentage = Math.round((totals.calories / USER_PROFILE.CALORIE_TARGET) * 100);
  const proteinPercentage = Math.round((totals.protein / USER_PROFILE.PROTEIN_TARGET_G) * 100);

  // Fetch today's logs
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/food/log');
      const data = await response.json();

      if (data.success) {
        setLogs(data.data || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch food logs');
      console.error(err);
    }
  }, []);

  // Fetch presets
  const fetchPresets = useCallback(async () => {
    try {
      const response = await fetch('/api/food/presets');
      const data = await response.json();

      if (data.success) {
        setPresets(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch presets:', err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchLogs(), fetchPresets()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchLogs, fetchPresets]);

  // Analyze food with AI
  const analyzeFood = async (description: string) => {
    const response = await fetch('/api/ai/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to analyze food');
    }

    return data.data;
  };

  // Log food to database
  const logFood = async (foodData: {
    description: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    meal_type?: string;
  }) => {
    const response = await fetch('/api/food/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(foodData),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to save food log');
    }

    // Refresh logs
    await fetchLogs();
    return data.data;
  };

  // Delete food log
  const deleteLog = async (id: string) => {
    const response = await fetch(`/api/food/log?id=${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete food log');
    }

    // Update local state
    setLogs(logs.filter(log => log.id !== id));
  };

  // Save as preset
  const savePreset = async (presetData: {
    name: string;
    description?: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }) => {
    const response = await fetch('/api/food/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presetData),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to save preset');
    }

    // Refresh presets
    await fetchPresets();
    return data.data;
  };

  // Delete preset
  const deletePreset = async (id: string) => {
    const response = await fetch(`/api/food/presets?id=${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete preset');
    }

    // Update local state
    setPresets(presets.filter(preset => preset.id !== id));
  };

  // Log from preset
  const logFromPreset = async (preset: FoodPreset) => {
    return logFood({
      description: preset.name,
      calories: preset.calories,
      protein_g: preset.protein_g,
      carbs_g: preset.carbs_g,
      fat_g: preset.fat_g,
      meal_type: 'preset',
    });
  };

  return {
    logs,
    presets,
    totals,
    isLoading,
    error,
    caloriePercentage,
    proteinPercentage,
    analyzeFood,
    logFood,
    deleteLog,
    savePreset,
    deletePreset,
    logFromPreset,
    refreshLogs: fetchLogs,
    refreshPresets: fetchPresets,
  };
}
