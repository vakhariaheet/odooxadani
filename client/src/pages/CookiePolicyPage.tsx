import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> December 23, 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when 
                you visit a website. They are widely used to make websites work more efficiently and 
                provide information to website owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">
                ProposalFlow uses cookies for several purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies</h3>
                <p className="text-gray-700 mb-2">
                  These cookies are necessary for the website to function and cannot be switched off:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Authentication cookies (keep you logged in)</li>
                  <li>Security cookies (protect against fraud)</li>
                  <li>Session cookies (maintain your session)</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies</h3>
                <p className="text-gray-700 mb-2">
                  These cookies help us understand how visitors interact with our website:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Google Analytics (website usage statistics)</li>
                  <li>Hotjar (user behavior analysis)</li>
                  <li>Mixpanel (product analytics)</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Cookies</h3>
                <p className="text-gray-700 mb-2">
                  These cookies are used to deliver relevant advertisements:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Google Ads (advertising targeting)</li>
                  <li>Facebook Pixel (social media advertising)</li>
                  <li>LinkedIn Insight Tag (professional network advertising)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                <li><strong>Opt-out Tools:</strong> Use industry opt-out tools for advertising cookies</li>
                <li><strong>Cookie Preferences:</strong> Adjust your preferences in our cookie banner</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Please note that blocking certain cookies may impact your experience on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                Some cookies on our site are set by third-party services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Google:</strong> Analytics, Ads, and other Google services</li>
                <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                <li><strong>Intercom:</strong> Customer support and messaging</li>
                <li><strong>Clerk:</strong> Authentication and user management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time. We will notify you of any 
                significant changes by posting the new policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                Email: privacy@proposalflow.com<br />
                Address: 123 Business St, Suite 100, San Francisco, CA 94105
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}