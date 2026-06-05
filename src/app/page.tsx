import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Calculator } from '@/components/landing/Calculator';
import { Pricing } from '@/components/landing/Pricing';

export default function LandingPage() {
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
