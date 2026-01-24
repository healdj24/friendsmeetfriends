import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'NYC Street Ski Map',
  description: 'Find the best streets to ski during NYC snowstorms',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        /* Override global styles for maps page */
        html, body {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `}</style>
      {children}
    </>
  );
}
