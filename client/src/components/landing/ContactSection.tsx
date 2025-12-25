import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { contactApi, type ContactFormData } from '@/services/contactApi';
import { toast } from 'sonner';

export const ContactSection = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Basic client-side validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await contactApi.submitContactForm(formData);

      if (result.success) {
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);

      // Handle different types of errors
      if (error?.response?.status === 400) {
        toast.error('Please check your input and try again');
      } else if (error?.response?.status === 500) {
        toast.error(
          'Email service is temporarily unavailable. Please try again later or contact us directly at support@webbound.dev'
        );
      } else if (error?.response?.status === 403) {
        toast.error(
          'Service configuration issue. Please contact us directly at support@webbound.dev'
        );
      } else if (error?.message?.includes('Network Error') || error?.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection and try again');
      } else {
        toast.error(
          'Sorry, there was an error sending your message. Please contact us directly at support@webbound.dev'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Get in Touch</h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-blue-600 mr-4" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a
                    href="mailto:support@webbound.dev"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    support@webbound.dev
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-6 h-6 text-blue-600 mr-4" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 text-blue-600 mr-4" />
                <div>
                  <p className="font-semibold">Live Chat</p>
                  <p className="text-gray-600">Available 24/7 during hackathons</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Frequently Asked Questions</h4>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <strong>Q:</strong> How does team matching work?
                  <br />
                  <strong>A:</strong> Our AI analyzes skills, interests, and project needs to
                  suggest compatible teammates.
                </p>
                <p className="text-gray-600">
                  <strong>Q:</strong> Is it really free for participants?
                  <br />
                  <strong>A:</strong> Yes! Participants can use all core features completely free.
                </p>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Having trouble with the form?</strong> You can also reach us directly at{' '}
                  <a
                    href="mailto:support@webbound.dev"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    support@webbound.dev
                  </a>
                </p>
              </div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this about?"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
