import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBatchEmails } from '@/lib/gmail';

export async function POST(request: NextRequest) {
  try {
    const { subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body required' }, { status: 400 });
    }

    // Get all subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('subscribers')
      .select('email');

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers' }, { status: 400 });
    }

    const emails = subscribers.map((sub) => sub.email);

    // Send emails individually via Gmail OAuth
    const results = await sendBatchEmails(emails, subject, body);

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      count: successCount,
      failed: failedCount,
      results,
    });
  } catch (err) {
    console.error('Send error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
