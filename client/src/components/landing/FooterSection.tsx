import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Help Center', href: '#' },
    { name: 'API Documentation', href: '#' },
    { name: 'Status', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '#' },
    { name: 'GDPR', href: '#' },
  ],
};

const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { name: 'Email', icon: Mail, href: 'mailto:support@hackmatch.com' },
];

export const FooterSection = () => {
  const location = useLocation();

  const handleAnchorClick = (href: string) => {
    if (href.startsWith('/#')) {
      const elementId = href.substring(2); // Remove '/#'
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderLink = (link: { name: string; href: string }, index: number) => {
    if (link.href.startsWith('/#')) {
      // Handle anchor links
      if (location.pathname === '/') {
        // We're on the landing page, scroll to section
        return (
          <button
            key={index}
            onClick={() => handleAnchorClick(link.href)}
            className="text-gray-400 hover:text-white transition-colors text-left"
          >
            {link.name}
          </button>
        );
      } else {
        // We're on a different page, navigate to landing page with anchor
        return (
          <Link
            key={index}
            to={link.href}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {link.name}
          </Link>
        );
      }
    } else {
      // Regular links
      return (
        <Link
          key={index}
          to={link.href}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {link.name}
        </Link>
      );
    }
  };
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">HackMatch</h3>
            <p className="text-gray-400 mb-6">
              Connecting hackathon participants with the perfect teammates and ideas.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>{renderLink(link, index)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-700 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© 2024 HackMatch. All rights reserved.</p>
          <p className="text-gray-400 text-sm">Made with ❤️ for the hackathon community</p>
        </div>
      </div>
    </footer>
  );
};
