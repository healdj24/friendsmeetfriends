import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

// Create OAuth2 client
const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Create reusable transporter
async function createTransporter() {
  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER, // fun@fdft.com
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token || '',
    },
  });

  return transporter;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `Friends Doing Fun Things <${process.env.GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    text,
    html,
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

export async function sendBatchEmails(
  emails: string[],
  subject: string,
  text: string,
  html?: string
) {
  const transporter = await createTransporter();
  const results = [];

  // Send individually for better deliverability (BCC can trigger spam filters)
  for (const email of emails) {
    try {
      const result = await transporter.sendMail({
        from: `Friends Doing Fun Things <${process.env.GMAIL_USER}>`,
        to: email,
        subject,
        text,
        html,
      });
      results.push({ email, success: true, messageId: result.messageId });
    } catch (error) {
      results.push({ email, success: false, error: String(error) });
    }
  }

  return results;
}
