import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friends Doing Fun Things",
  description: "A community for people who'd rather be somewhere than scroll about it.",
  icons: {
    icon: '/mascot.png',
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
