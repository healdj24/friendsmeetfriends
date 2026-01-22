import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already subscribed!' }, { status: 400 });
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert({ email: email.toLowerCase() });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
