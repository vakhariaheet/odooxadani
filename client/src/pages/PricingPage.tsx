import { PricingSection } from '@/components/landing/PricingSection';
import { FooterSection } from '@/components/landing/FooterSection';

export function PricingPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-20">
        <PricingSection />
      </div>
      <FooterSection />
    </div>
  );
}
