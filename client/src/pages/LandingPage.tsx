import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { FooterSection } from '@/components/landing/FooterSection';

export function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    // Handle anchor links when navigating to the landing page
    if (location.hash) {
      const elementId = location.hash.substring(1); // Remove '#'
      const element = document.getElementById(elementId);
      if (element) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <AboutSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
