import { AboutSection } from '@/components/landing/AboutSection';
import { FooterSection } from '@/components/landing/FooterSection';

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-20">
        <AboutSection />
      </div>
      <FooterSection />
    </div>
  );
}
