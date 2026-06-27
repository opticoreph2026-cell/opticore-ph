import React from 'react';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/ui/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://opticore-energy-solutions.vercel.app'),
  title: 'OptiCore Energy Solutions | Solar & ESS for Cebu, Bohol & Leyte',
  description:
    'Cebu-based solar PV and ESS installation by a Registered Mechanical Engineer. Free site assessment for Cebu, Bohol, and Leyte.',
  openGraph: {
    title: 'OptiCore Energy Solutions | Solar & ESS for Cebu, Bohol & Leyte',
    description: 'Cebu-based solar PV and ESS installation by a Registered Mechanical Engineer.',
    url: 'https://opticore-ph.vercel.app',
    siteName: 'OptiCore Energy Solutions',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptiCore Energy Solutions',
    description: 'Cebu-based solar PV and ESS installation by a Registered Mechanical Engineer.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
