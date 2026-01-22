import { NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/gemini/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Food description is required' },
        { status: 400 }
      );
    }

    // Analyze food using Gemini
    const result = await analyzeFood(description.trim());

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Food analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze food',
      },
      { status: 500 }
    );
  }
}
