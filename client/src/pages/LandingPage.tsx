import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FooterSection } from '@/components/landing/FooterSection';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <div id="hero">
        <HeroSection />
      </div>
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <div id="faq">
        <FAQSection />
      </div>
      
      {/* Placeholder sections for footer navigation */}
      <div id="templates" className="h-20"></div>
      <div id="integrations" className="h-20"></div>
      <div id="blog" className="h-20"></div>
      <div id="careers" className="h-20"></div>
      <div id="contact" className="h-20"></div>
      <div id="press" className="h-20"></div>
      
      <FooterSection />
    </div>
  );
}