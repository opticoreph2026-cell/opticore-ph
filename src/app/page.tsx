import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Calculator } from '@/components/landing/Calculator';
import { Products } from '@/components/landing/Products';
import { Process } from '@/components/landing/Process';
import { Coverage } from '@/components/landing/Coverage';

export default function OptiCoreLandingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#08080B] text-white min-h-screen">
        <Hero />
        <Features />
        <Products />
        <Calculator />
        <Process />
        <Coverage />
      </main>
      <Footer />
    </>
  );
}
