import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/gmail';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !to.includes('@')) {
      return NextResponse.json({ error: 'Valid "to" email required' }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject: subject || 'Test email from Friends Doing Fun Things',
      text: body || 'This is a test email. If you received this, Gmail OAuth is working!',
    });

    return NextResponse.json({ success: true, emailId: result.messageId });
  } catch (err) {
    console.error('Test send error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
