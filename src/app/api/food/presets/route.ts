import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

    // Fetch user's food presets
    const { data: presets, error } = await supabase
      .from('food_presets')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Fetch presets error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch presets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: presets || [],
    });
  } catch (error) {
    console.error('Food presets error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch presets',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const { name, description, calories, protein_g, carbs_g, fat_g } = body;

    if (!name || typeof calories !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Name and calories are required' },
        { status: 400 }
      );
    }

    // Get user
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

    // Insert preset
    const { data: preset, error } = await supabase
      .from('food_presets')
      .insert({
        user_id: user.id,
        name,
        description: description || name,
        calories: Math.round(calories),
        protein_g: protein_g || 0,
        carbs_g: carbs_g || 0,
        fat_g: fat_g || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert preset error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save preset' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: preset,
    });
  } catch (error) {
    console.error('Food preset create error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create preset',
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
        { success: false, error: 'Preset ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('food_presets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete preset error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete preset' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Food preset delete error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete preset',
      },
      { status: 500 }
    );
  }
}
