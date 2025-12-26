// Landing page types and interfaces

export interface PlatformMetrics {
  totalParticipants: number;
  totalIdeas: number;
  teamsFormed: number;
  successfulProjects: number;
  lastUpdated: string;
}

export interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export interface ProcessStepData {
  step: number;
  title: string;
  description: string;
  icon: string; // Icon name for Lucide React
}

export interface FeatureData {
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'teams' | 'ideas' | 'technical';
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'partnership' | 'feedback';
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year' | 'free';
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}
