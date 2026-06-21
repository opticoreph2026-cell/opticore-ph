import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/billtools/Hero';
import { Features } from '@/components/billtools/Features';
import { Calculator } from '@/components/billtools/Calculator';
import { Pricing } from '@/components/billtools/Pricing';

export default function BillToolsLandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Calculator />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
