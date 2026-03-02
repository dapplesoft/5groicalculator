import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '5G ROI Calculator | DappleSoft',
  description: 'Calculate the Return on Investment for your 5G network deployment. Get detailed projections, payback periods, and financial analysis.',
  keywords: '5G, ROI, calculator, network, investment, telecommunications',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
