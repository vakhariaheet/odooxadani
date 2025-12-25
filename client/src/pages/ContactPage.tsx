import { ContactSection } from '@/components/landing/ContactSection';
import { FooterSection } from '@/components/landing/FooterSection';

export function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-20">
        <ContactSection />
      </div>
      <FooterSection />
    </div>
  );
}
