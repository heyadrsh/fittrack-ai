import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch food logs for the period
    const { data: foodLogs, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startDate.toISOString())
      .lte('logged_at', endDate.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Fetch history error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch food history' },
        { status: 500 }
      );
    }

    // Group logs by date
    const groupedLogs: Record<string, typeof foodLogs> = {};
    foodLogs?.forEach((log) => {
      const date = new Date(log.logged_at).toISOString().split('T')[0];
      if (!groupedLogs[date]) {
        groupedLogs[date] = [];
      }
      groupedLogs[date].push(log);
    });

    // Calculate daily totals
    const dailyTotals = Object.entries(groupedLogs).map(([date, logs]) => ({
      date,
      logs,
      totals: {
        calories: logs.reduce((sum, log) => sum + (log.calories || 0), 0),
        protein_g: logs.reduce((sum, log) => sum + (log.protein_g || 0), 0),
        carbs_g: logs.reduce((sum, log) => sum + (log.carbs_g || 0), 0),
        fat_g: logs.reduce((sum, log) => sum + (log.fat_g || 0), 0),
      },
    }));

    return NextResponse.json({
      success: true,
      data: dailyTotals,
    });
  } catch (error) {
    console.error('Food history error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch food history',
      },
      { status: 500 }
    );
  }
}
