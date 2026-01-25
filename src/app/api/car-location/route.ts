import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Update car location (driver only)
export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, is_active } = await request.json();

    // Upsert location (always update the single row with id=1)
    const { error } = await supabase
      .from('car_location')
      .upsert({
        id: 1,
        latitude,
        longitude,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Car location error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// GET - Get current car location (public)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('car_location')
      .select('latitude, longitude, is_active, updated_at')
      .eq('id', 1)
      .single();

    if (error) {
      // No data yet is fine
      if (error.code === 'PGRST116') {
        return NextResponse.json({ is_active: false });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to get location' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Get car location error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
