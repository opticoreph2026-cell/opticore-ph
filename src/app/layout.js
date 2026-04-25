import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/ui/AuthProvider';

// Optimize and load fonts
const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({ 
  subsets: ['latin'], 
  display: 'swap', 
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800', '900']
});

export const metadata = {
  title: 'OptiCore PH — AI-Powered Utility Bill Optimizer',
  description:
    'Reduce your electricity and water bills with AI-driven insights. Works with any utility provider in the Philippines — Meralco, VECO, Davao Light, Cebu Light, MCWD, Manila Water, Maynilad, and more.',
  keywords: 'utility bill optimizer Philippines, Meralco savings, VECO savings, electricity bill reduction PH, water bill optimizer',
  authors: [{ name: 'OptiCore PH' }],
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'OptiCore PH — AI Utility Optimizer',
    description: 'Cut your utility bills with AI. Any provider. Anywhere in the Philippines.',
    type: 'website',
    locale: 'en_PH',
    url: 'https://opticoreph.com',
  },
};

// Required for proper mobile rendering
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f59e0b',
};

/**
 * Root layout — applies fonts, NextAuth SessionProvider, and base structure.
 * SessionProvider is required for signIn('google') to work on client pages.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en-PH" className={`${inter.variable} ${outfit.variable}`}>
      <body className={`antialiased ${inter.className}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
