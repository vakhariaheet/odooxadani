import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  eventType: string;
  message: string;
}

export const LeadCaptureForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    phone: '',
    eventType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store lead in localStorage
      const leads = JSON.parse(localStorage.getItem('eventHub_leads') || '[]');
      const newLead = {
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'landing_page',
        id: Date.now(),
        score: calculateLeadScore(formData),
      };

      leads.push(newLead);
      localStorage.setItem('eventHub_leads', JSON.stringify(leads));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Thank you! We'll be in touch within 24 hours.");

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        role: '',
        phone: '',
        eventType: '',
        message: '',
      });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple lead scoring algorithm
  const calculateLeadScore = (data: FormData): number => {
    let score = 0;

    // Role-based scoring
    if (data.role === 'event_organizer') score += 30;
    if (data.role === 'venue_owner') score += 35;
    if (data.role === 'marketing_manager') score += 25;
    if (data.role === 'business_owner') score += 20;

    // Company field filled
    if (data.company) score += 15;

    // Phone provided
    if (data.phone) score += 10;

    // Event type specified
    if (data.eventType) score += 10;

    // Message length (shows engagement)
    if (data.message.length > 50) score += 10;

    return Math.min(score, 100);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Let's discuss how EventHub can transform your event management experience. Our team
              will reach out within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Tell Us About Your Needs</CardTitle>
                <CardDescription>
                  Fill out this form and we'll provide a personalized demo and pricing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Your Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleChange('role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event_organizer">Event Organizer</SelectItem>
                          <SelectItem value="venue_owner">Venue Owner</SelectItem>
                          <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                          <SelectItem value="business_owner">Business Owner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="eventType">Event Type</Label>
                      <Select
                        value={formData.eventType}
                        onValueChange={(value) => handleChange('eventType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Primary event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corporate">Corporate Events</SelectItem>
                          <SelectItem value="weddings">Weddings</SelectItem>
                          <SelectItem value="conferences">Conferences</SelectItem>
                          <SelectItem value="social">Social Events</SelectItem>
                          <SelectItem value="multiple">Multiple Types</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Tell us about your event needs</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Describe your event management challenges, typical event size, frequency, or any specific requirements..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Get My Free Demo'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to our{' '}
                    <Link to="#" className="underline hover:text-gray-700">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Benefits & Social Proof */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🚀</span>
                    What You'll Get
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <div>
                        <strong>Personalized Demo</strong>
                        <p className="text-sm text-gray-600">
                          See EventHub in action with your specific use case
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <div>
                        <strong>Custom Pricing</strong>
                        <p className="text-sm text-gray-600">
                          Get pricing tailored to your event volume and needs
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <div>
                        <strong>Implementation Plan</strong>
                        <p className="text-sm text-gray-600">
                          Step-by-step guidance to get you up and running
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <div>
                        <strong>Free Trial Access</strong>
                        <p className="text-sm text-gray-600">
                          30-day trial with full platform access
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">💬</span>
                    What Our Customers Say
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
                    "EventHub reduced our event planning time by 60% and increased our venue
                    bookings by 40%. The ROI was clear within the first month."
                  </blockquote>
                  <p className="text-sm text-gray-600 mt-2">
                    — Sarah Johnson, Event Director at TechCorp
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">📞</span>
                    Prefer to Talk?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Schedule a call with our team for immediate assistance
                  </p>
                  <Button variant="outline" className="w-full">
                    Book a Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
