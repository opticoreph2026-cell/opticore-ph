'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { ShieldCheck } from 'lucide-react';

const LAST_UPDATED = 'January 1, 2025';

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `OptiCore PH ("we", "us", "our") is committed to protecting your personal data in accordance with Republic Act No. 10173, known as the Data Privacy Act of 2012 (PDPA), and its Implementing Rules and Regulations.

This Privacy Policy explains how we collect, use, store, and protect information you provide when using the OptiCore PH platform, accessible at opticoreph.com.

By using our service, you consent to the collection and use of your information as described herein.`,
  },
  {
    id: 'data-we-collect',
    title: '2. Data We Collect',
    content: `We collect the following personal and utility data:

• Identity Data: Your full name and email address (required for account creation).
• Utility Data: Monthly electricity consumption (kWh), water consumption (m³), and corresponding bill amounts.
• Provider Data: Your selected electricity and water utility provider(s).
• Usage Data: How you interact with our platform (page views, feature usage).
• Payment Data: Processed securely by PayMongo. We do not store card numbers or bank details.

We do not collect: government IDs, biometric data, sensitive personal information as defined by the PDPA.`,
  },
  {
    id: 'how-we-use-your-data',
    title: '3. How We Use Your Data',
    content: `Your data is used exclusively to:

• Generate AI-powered utility bill analysis and recommendations.
• Send alerts when usage anomalies are detected.
• Process payments for Pro and Business subscriptions.
• Improve our AI models and benchmarking (anonymized and aggregated only).

We will never sell or rent your personal or utility data to third parties.`,
  },
  {
    id: 'data-retention',
    title: '4. Data Retention',
    content: `• Active accounts: Data retained for the duration of your subscription.
• Cancelled accounts: Personal data deleted within 90 days of cancellation.
• Utility readings: Retained for up to 5 years for trend analysis (anonymized after account deletion).
• Backups: Encrypted backups retained for 30 days.`,
  },
  {
    id: 'third-party-services',
    title: '5. Third-Party Services',
    content: `We use the following trusted service providers. Each is bound by their own privacy and security policies:

• Turso (turso.tech): Secure Edge database for storing client records and utility data.
• Google AI Services: Inference engine for parsing bills and generating recommendations. Only anonymized usage data is sent.
• PayMongo (paymongo.com): Philippine payment processor. PCI-DSS compliant.
• Netlify (netlify.com): Hosting provider.`,
  },
  {
    id: 'data-security',
    title: '6. Data Security',
    content: `We implement the following security measures:

• All data transmitted over HTTPS/TLS 1.2+.
• Passwords hashed using bcrypt.
• Database access restricted via secure tokens.
• Regular vulnerability scanning.

While we strive to use commercially acceptable means to protect your data, no method of transmission over the Internet is 100% secure.`,
  },
  {
    id: 'your-rights',
    title: '7. Your Rights Under PDPA',
    content: `As a data subject in the Philippines, you have the right to:

1. Be informed about how your data is processed.
2. Object to the processing of your data.
3. Access the data we hold about you.
4. Rectify any errors in your data.
5. Erase or block your data from our systems (Account Deletion).
6. Data portability.

To exercise these rights, please contact our Data Protection Officer.`,
  },
  {
    id: 'contact-us',
    title: '8. Contact Us',
    content: `For privacy-related inquiries, data access requests, or account deletion, please contact our Data Protection Officer at:

Email: opticoreph2026@gmail.com
Location: Manila, Philippines`,
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      // Find the section closest to the top of the viewport
      const scrollPosition = window.scrollY + 200; // Offset for header
      
      let current = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset for header
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-14 border-b border-white/[0.06] bg-surface-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-text-muted">
            Last Updated: <span className="font-mono text-text-secondary">{LAST_UPDATED}</span>
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
        
        {/* ScrollSpy Sidebar */}
        <aside className="w-full md:w-64 shrink-0 md:sticky top-28">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4 px-3">Table of Contents</p>
          <nav className="flex flex-col border-l border-white/[0.06]">
            {SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`text-left pl-4 py-2.5 text-xs font-semibold transition-all duration-150 ease-out border-l-2 -ml-[1px] relative
                    ${isActive 
                      ? 'border-brand-500 text-brand-400 bg-brand-500/[0.03]' 
                      : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
                    }`}
                >
                  {s.title}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8 min-w-0">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <section 
                key={section.id} 
                id={section.id}
                className={`scroll-mt-32 p-6 md:p-8 rounded-2xl bg-slate-900/50 transition-colors duration-300 ${
                  isActive ? 'border border-brand-500/50 shadow-amber-glow' : 'border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />}
                  <h2 className={`font-semibold text-lg transition-colors ${isActive ? 'text-brand-400' : 'text-text-primary'}`}>
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-text-secondary prose-li:text-text-secondary prose-li:marker:text-text-muted">
                  {/* Convert raw text into paragraph blocks for better pacing */}
                  {section.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="whitespace-pre-wrap font-body">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
