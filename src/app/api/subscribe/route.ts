import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/gmail';

// Auto-welcome email expires: Jan 25, 2026 at 9:00 AM Eastern (14:00 UTC)
const WELCOME_EMAIL_CUTOFF = new Date('2026-01-25T14:00:00Z');

const WELCOME_SUBJECT = 'DETAILS';

const WELCOME_BODY = `HEY. WE LOVE EVERYBODY THAT GAVE US THEIR EMAIL. WE STARTED THIS TO BRING FRIENDS ALONG FOR MORE FUN THINGS. MORE ON THIS LATER.

NOW, SUNDAY.

  FRIENDS HAVE SLEDS.
  FRIENDS HAVE SKIS.
  FRIENDS HAVE CARDBOARD.

  A SPECIAL FRIEND HAS A JEEP.

  WE'RE GOING SURFING IN THE STREETS.

DETAILS: AWAITING A MORE DETAILED FORECAST TO DETERMINE WHEN THE BEST SKIING WILL TAKE PLACE. OUR CURRENT PLAN IS TO HOST A MAGICAL HANG ON A CORNER IN THE WEST VILLAGE WITH SOME TUNES AND HOT CHOCOLATE EARLY AFTERNOON, MAYBE NEAR A COZY CAFE, WHILE WE SKI IN AND AROUND THERE. EXPECT AN EMAIL TOMORROW AM!`;

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

    // Send welcome email if before cutoff time
    if (new Date() < WELCOME_EMAIL_CUTOFF) {
      try {
        await sendEmail({
          to: email.toLowerCase(),
          subject: WELCOME_SUBJECT,
          text: WELCOME_BODY,
        });
        console.log(`Welcome email sent to ${email}`);
      } catch (emailErr) {
        // Log but don't fail the subscription if email fails
        console.error('Failed to send welcome email:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
