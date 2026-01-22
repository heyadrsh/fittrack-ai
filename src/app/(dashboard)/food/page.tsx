'use client';

import { useState } from 'react';
import { Utensils, Loader2, Trash2, Plus, Sparkles, Save, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { USER_PROFILE } from '@/lib/constants';
import { useFoodLog } from '@/hooks/useFoodLog';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

function ProgressBar({ current, target, color = 'bg-black' }: { current: number; target: number; color?: string }) {
  const percentage = Math.min((current / target) * 100, 100);
  const isOver = current > target;

  return (
    <div className="progress-bar w-full">
      <div
        className={`progress-bar-fill ${isOver ? 'bg-red-500' : color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface AnalyzedFood {
  food_name: string;
  portion_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  confidence: 'high' | 'medium' | 'low';
}

function MacroChart({ totals }: { totals: { protein: number; carbs: number; fat: number } }) {
  const data = [
    { name: 'Protein', value: totals.protein * 4, grams: totals.protein, color: '#3b82f6' },
    { name: 'Carbs', value: totals.carbs * 4, grams: totals.carbs, color: '#f59e0b' },
    { name: 'Fat', value: totals.fat * 9, grams: totals.fat, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const totalCalories = data.reduce((sum, item) => sum + item.value, 0);

  if (totalCalories === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        <p>No macros logged yet</p>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            label={({ name, grams }) => `${name}: ${grams}g`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

export default function FoodPage() {
  const [foodDescription, setFoodDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState<AnalyzedFood | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSavePreset, setShowSavePreset] = useState(false);

  const {
    logs,
    presets,
    totals,
    isLoading,
    analyzeFood,
    logFood,
    deleteLog,
    savePreset,
    logFromPreset,
  } = useFoodLog();

  const handleAnalyze = async () => {
    if (!foodDescription.trim()) return;

    setIsAnalyzing(true);
    setLocalError(null);
    setAnalyzedFood(null);

    try {
      const result = await analyzeFood(foodDescription.trim());
      setAnalyzedFood(result);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to analyze food');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmLog = async () => {
    if (!analyzedFood) return;

    try {
      await logFood({
        description: analyzedFood.food_name || foodDescription,
        calories: analyzedFood.calories,
        protein_g: analyzedFood.protein_g,
        carbs_g: analyzedFood.carbs_g,
        fat_g: analyzedFood.fat_g,
        fiber_g: analyzedFood.fiber_g,
        meal_type: getMealType(),
      });

      setFoodDescription('');
      setAnalyzedFood(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save food log');
    }
  };

  const handleSaveAsPreset = async () => {
    if (!analyzedFood) return;

    try {
      await savePreset({
        name: analyzedFood.food_name || foodDescription,
        description: analyzedFood.portion_description,
        calories: analyzedFood.calories,
        protein_g: analyzedFood.protein_g,
        carbs_g: analyzedFood.carbs_g,
        fat_g: analyzedFood.fat_g,
      });
      setShowSavePreset(false);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save preset');
    }
  };

  const handlePresetClick = async (preset: typeof presets[0]) => {
    try {
      await logFromPreset(preset);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to log preset');
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteLog(id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to delete log');
    }
  };

  const getMealType = (): string => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 18) return 'snack';
    return 'dinner';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Utensils className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Food Log</h1>
        </div>
      </div>

      {/* Natural Language Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            What did you eat?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., 2 rotis with paneer sabji and 1 glass of milk"
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            className="min-h-32"
          />
          {localError && (
            <p className="text-red-500 text-sm">{localError}</p>
          )}

          {/* Analysis Result */}
          {analyzedFood && (
            <div className="p-4 border-2 border-black bg-gray-50 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold">{analyzedFood.food_name}</h4>
                  <p className="text-sm text-gray-600">{analyzedFood.portion_description}</p>
                </div>
                <Badge variant={analyzedFood.confidence === 'high' ? 'default' : 'secondary'}>
                  {analyzedFood.confidence} confidence
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-orange-100 border border-orange-300">
                  <p className="text-lg font-bold">{analyzedFood.calories}</p>
                  <p className="text-xs">kcal</p>
                </div>
                <div className="p-2 bg-blue-100 border border-blue-300">
                  <p className="text-lg font-bold">{analyzedFood.protein_g}g</p>
                  <p className="text-xs">protein</p>
                </div>
                <div className="p-2 bg-yellow-100 border border-yellow-300">
                  <p className="text-lg font-bold">{analyzedFood.carbs_g}g</p>
                  <p className="text-xs">carbs</p>
                </div>
                <div className="p-2 bg-red-100 border border-red-300">
                  <p className="text-lg font-bold">{analyzedFood.fat_g}g</p>
                  <p className="text-xs">fat</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleConfirmLog} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Food
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSavePreset(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Preset
                </Button>
              </div>

              {showSavePreset && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveAsPreset} size="sm">
                    Confirm Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSavePreset(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {!analyzedFood && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !foodDescription.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Presets */}
      {presets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="flex-shrink-0 flex flex-col items-start h-auto py-3 px-4"
                  onClick={() => handlePresetClick(preset)}
                >
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-gray-500">
                    {preset.calories}cal • {preset.protein_g}g protein
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Calories</span>
              <span className={totals.calories > USER_PROFILE.CALORIE_TARGET ? 'text-red-500' : ''}>
                {totals.calories} / {USER_PROFILE.CALORIE_TARGET} kcal
              </span>
            </div>
            <ProgressBar
              current={totals.calories}
              target={USER_PROFILE.CALORIE_TARGET}
              color="bg-orange-500"
            />
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Protein</span>
              <span className={totals.protein < USER_PROFILE.PROTEIN_TARGET_G ? 'text-yellow-600' : 'text-green-600'}>
                {Math.round(totals.protein)}g / {USER_PROFILE.PROTEIN_TARGET_G}g
              </span>
            </div>
            <ProgressBar
              current={totals.protein}
              target={USER_PROFILE.PROTEIN_TARGET_G}
              color="bg-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Macro Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Macro Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MacroChart totals={totals} />
          <div className="flex justify-around pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold font-data text-blue-500">{Math.round(totals.protein)}g</p>
              <p className="text-xs text-gray-500">Protein ({Math.round((totals.protein * 4 / (totals.calories || 1)) * 100)}%)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-data text-yellow-500">{Math.round(totals.carbs)}g</p>
              <p className="text-xs text-gray-500">Carbs ({Math.round((totals.carbs * 4 / (totals.calories || 1)) * 100)}%)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-data text-red-500">{Math.round(totals.fat)}g</p>
              <p className="text-xs text-gray-500">Fat ({Math.round((totals.fat * 9 / (totals.calories || 1)) * 100)}%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Food Log */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Log</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No food logged yet today</p>
              <p className="text-sm">Start by describing what you ate!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 border-2 border-black"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(log.logged_at)}
                      </Badge>
                      {log.meal_type && (
                        <Badge variant="secondary" className="text-xs">
                          {log.meal_type}
                        </Badge>
                      )}
                      <span className="font-medium">{log.description}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{log.calories} kcal</span>
                      <span>{log.protein_g}g protein</span>
                      <span>{log.carbs_g}g carbs</span>
                      <span>{log.fat_g}g fat</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteLog(log.id)}
                    className="ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
