import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VERITY — AI Behavioral Analysis',
  description: 'Forensic linguistic analysis tool for detecting deception patterns in text.',
  keywords: ['lie detector', 'deception analysis', 'forensic linguistics', 'behavioral analysis'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-[#060A10]">
        {children}
      </body>
    </html>
  );
}
