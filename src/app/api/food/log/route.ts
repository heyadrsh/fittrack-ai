import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const {
      description,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      meal_type = 'snack',
    } = body;

    // Validate required fields
    if (!description || typeof calories !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Description and calories are required' },
        { status: 400 }
      );
    }

    // Get user (for now, use a hardcoded user ID or fetch from auth)
    // In a real app, we'd get this from the session
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (userError || !users) {
      // Create a default user if none exists
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          pin_hash: '0007', // Will be hashed in production
          weight_kg: 67.7,
          height_cm: 168,
          age: 23,
          goal: 'body_recomposition',
        })
        .select('id')
        .single();

      if (createError || !newUser) {
        return NextResponse.json(
          { success: false, error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Insert food log
    const { data: foodLog, error: insertError } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        description,
        calories: Math.round(calories),
        protein_g: protein_g || 0,
        carbs_g: carbs_g || 0,
        fat_g: fat_g || 0,
        fiber_g: fiber_g || 0,
        meal_type,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save food log' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: foodLog,
    });
  } catch (error) {
    console.error('Food log error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save food log',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get today's start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's food logs
    const { data: foodLogs, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', today.toISOString())
      .lt('logged_at', tomorrow.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch food logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: foodLogs || [],
    });
  } catch (error) {
    console.error('Food log fetch error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch food logs',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Food log ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete food log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Food log delete error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete food log',
      },
      { status: 500 }
    );
  }
}
