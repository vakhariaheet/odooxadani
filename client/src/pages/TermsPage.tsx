import { FooterSection } from '@/components/landing/FooterSection';

export function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: December 25, 2024</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using HackMatch, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily use HackMatch for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">User Accounts</h2>
            <p className="mb-4">
              You are responsible for safeguarding the password and for maintaining the
              confidentiality of your account information.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Uses</h2>
            <p className="mb-4">
              You may not use our service for any unlawful purpose or to solicit others to perform
              unlawful acts.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at
              legal@hackmatch.com.
            </p>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
