import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';

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

    // Send email to each subscriber
    // Note: For production, you'd want to use batch sending or a queue
    const fromEmail = process.env.FROM_EMAIL || 'hello@yourdomain.com';

    const emails = subscribers.map((sub) => sub.email);

    // Resend supports batch sending up to 100 emails
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: emails,
      subject: subject,
      text: body,
    });

    if (sendError) {
      console.error('Resend error:', sendError);
      return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: subscribers.length });
  } catch (err) {
    console.error('Send error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
