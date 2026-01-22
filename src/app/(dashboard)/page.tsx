'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Flame, Utensils, Droplets, Dumbbell, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { USER_PROFILE } from '@/lib/constants';

// Placeholder data - will be replaced with real data later
const todayStats = {
  calories: { current: 0, target: USER_PROFILE.CALORIE_TARGET },
  protein: { current: 0, target: USER_PROFILE.PROTEIN_TARGET_G },
  water: { current: 0, target: USER_PROFILE.WATER_GOAL_ML },
  workoutDone: false,
  streak: 0,
};

function ProgressBar({ current, target, color = 'bg-black' }: { current: number; target: number; color?: string }) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="progress-bar w-full">
      <div
        className={`progress-bar-fill ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function StatCard({
  title,
  current,
  target,
  unit,
  icon: Icon,
  color,
}: {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}) {
  const percentage = Math.round((current / target) * 100);

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{title}</span>
          </div>
          <span className="text-sm text-gray-500">{percentage}%</span>
        </div>
        <div className="font-data text-2xl font-bold mb-2">
          {current.toLocaleString()}
          <span className="text-sm font-normal text-gray-500"> / {target.toLocaleString()} {unit}</span>
        </div>
        <ProgressBar current={current} target={target} color={color} />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">{today}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold">{todayStats.streak}</span>
          <span className="text-sm text-gray-500">day streak</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Calories"
          current={todayStats.calories.current}
          target={todayStats.calories.target}
          unit="kcal"
          icon={Flame}
          color="bg-orange-500"
        />
        <StatCard
          title="Protein"
          current={todayStats.protein.current}
          target={todayStats.protein.target}
          unit="g"
          icon={Dumbbell}
          color="bg-blue-500"
        />
        <StatCard
          title="Water"
          current={todayStats.water.current}
          target={todayStats.water.target}
          unit="ml"
          icon={Droplets}
          color="bg-cyan-500"
        />
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5" />
              <span className="font-medium">Workout</span>
            </div>
            <div className="text-2xl font-bold mb-2">
              {todayStats.workoutDone ? (
                <span className="text-green-600">✓ Done</span>
              ) : (
                <span className="text-gray-400">Pending</span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {todayStats.workoutDone ? 'Great job today!' : 'Time to hit the gym!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/food">
              <Button variant="outline" className="w-full flex flex-col h-auto py-4 gap-2">
                <Utensils className="w-6 h-6" />
                <span>Log Food</span>
              </Button>
            </Link>
            <Link href="/water">
              <Button variant="outline" className="w-full flex flex-col h-auto py-4 gap-2">
                <Droplets className="w-6 h-6" />
                <span>Log Water</span>
              </Button>
            </Link>
            <Link href="/workout">
              <Button variant="outline" className="w-full flex flex-col h-auto py-4 gap-2">
                <Dumbbell className="w-6 h-6" />
                <span>Start Workout</span>
              </Button>
            </Link>
            <Link href="/body">
              <Button variant="outline" className="w-full flex flex-col h-auto py-4 gap-2">
                <Scale className="w-6 h-6" />
                <span>Log Weight</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
