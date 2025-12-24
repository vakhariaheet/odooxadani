import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturedEventsCarousel } from '@/components/landing/FeaturedEventsCarousel';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { FeaturedVenuesGrid } from '@/components/landing/FeaturedVenuesGrid';
import { LiveStatsCounter } from '@/components/landing/LiveStatsCounter';
import { UserTestimonials } from '@/components/landing/UserTestimonials';
import { PricingSection } from '@/components/landing/PricingSection';
import { NewsletterSignup } from '@/components/landing/NewsletterSignup';
import { LeadCaptureForm } from '@/components/landing/LeadCaptureForm';
import { ContactSection } from '@/components/landing/ContactSection';
import { FooterSection } from '@/components/landing/FooterSection';

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <FeaturedEventsCarousel />
      <InteractiveDemo />
      <FeaturedVenuesGrid />
      <HowItWorksSection />
      <LiveStatsCounter />
      <UserTestimonials />
      <PricingSection />
      <NewsletterSignup />
      <LeadCaptureForm />
      <ContactSection />
      <FooterSection />
    </main>
  );
}
