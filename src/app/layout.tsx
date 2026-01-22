import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://friendsdoingfunthings.com'),
  title: {
    default: 'FDFT',
    template: '%s | FDFT',
  },
  applicationName: 'FDFT',
  description: "Friends Doing Fun Things — for those who are generally down to clown.",
  // Intentionally omit og:image so iMessage doesn't render a big preview card.
  openGraph: {
    title: 'FDFT',
    description: "Friends Doing Fun Things — for those who are generally down to clown.",
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'FDFT',
    description: "Friends Doing Fun Things — for those who are generally down to clown.",
  },
  themeColor: '#0F9D58', // Green like the mascot
  icons: {
    icon: '/mascot.png',
    apple: '/mascot.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
