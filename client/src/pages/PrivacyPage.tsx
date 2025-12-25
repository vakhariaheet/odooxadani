import { FooterSection } from '@/components/landing/FooterSection';

export function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: December 25, 2024</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account,
              participate in hackathons, or contact us for support.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to provide, maintain, and improve our services,
              facilitate team formation, and communicate with you about your account and our
              services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third
              parties without your consent, except as described in this policy.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at
              privacy@hackmatch.com.
            </p>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
