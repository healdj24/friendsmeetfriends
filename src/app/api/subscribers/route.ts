import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    return NextResponse.json({ subscribers: data, count: data?.length || 0 });
  } catch (err) {
    console.error('Fetch subscribers error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
