# Module F02: Site Landing Page

## Overview

**Estimated Time:** 45min

**Complexity:** Simple

**Type:** Frontend-only

**Risk Level:** Low

**Dependencies:** None

## Problem Context

HackMatch needs a compelling landing page that showcases the platform's value proposition to hackathon participants, organizers, and judges. This includes hero section, features showcase, pricing/plans, contact forms, and about section to drive user adoption and explain the platform's benefits.

## Technical Requirements

**Module Type:** Frontend-only

### Frontend Tasks

- [ ] **Landing Page Components:**
  - `HeroSection.tsx` - Main hero with value proposition and CTA
  - `FeaturesSection.tsx` - Key features showcase with icons
  - `HowItWorksSection.tsx` - Step-by-step process explanation
  - `TestimonialsSection.tsx` - User testimonials and success stories
  - `PricingSection.tsx` - Pricing plans (free for participants, paid for organizers)
  - `ContactSection.tsx` - Contact form and support information
  - `AboutSection.tsx` - Team and mission information
  - `FooterSection.tsx` - Links, social media, legal pages

- [ ] **shadcn Components:** button, card, form, input, textarea, badge, separator

- [ ] **Static Content:**
  - Hero messaging focused on solving team formation pain points
  - Feature highlights: skill matching, idea validation, early feedback
  - How it works: 3-step process (pitch ideas, find teammates, get feedback)
  - Testimonials from beta users (can be placeholder initially)
  - Pricing: Free for participants, tiered plans for organizers
  - Contact form for inquiries and support

- [ ] **State Management:** Local state for form handling, no server state needed

- [ ] **Routing:**
  - `/` - Main landing page
  - `/about` - About page
  - `/pricing` - Pricing details page
  - `/contact` - Contact page
  - `/privacy` - Privacy policy
  - `/terms` - Terms of service

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS breakpoints

- [ ] **Animations:** Smooth scroll, fade-in effects, hover animations for better UX

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table) - Skip if Frontend-only

N/A - This is a frontend-only module with static content.

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED)
2. **Study Frontend Patterns:** Examine `client/src/components/` for UI patterns
3. **Review shadcn Components:** Check available components in `client/src/components/ui/`
4. **Study Routing:** Review `client/src/App.tsx` for routing patterns

### Step 1: Frontend Implementation

**File Structure:**

```
client/src/
├── components/landing/
│   ├── HeroSection.tsx          # Main hero section
│   ├── FeaturesSection.tsx      # Features showcase
│   ├── HowItWorksSection.tsx    # Process explanation
│   ├── TestimonialsSection.tsx  # User testimonials
│   ├── PricingSection.tsx       # Pricing plans
│   ├── ContactSection.tsx       # Contact form
│   ├── AboutSection.tsx         # About information
│   └── FooterSection.tsx        # Footer with links
├── pages/
│   ├── LandingPage.tsx          # Main landing page
│   ├── AboutPage.tsx            # About page
│   ├── PricingPage.tsx          # Pricing page
│   └── ContactPage.tsx          # Contact page
└── assets/
    └── landing/                 # Landing page images and icons
```

**Implementation Pattern:**

```typescript
// components/landing/HeroSection.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Stop Wasting Hackathon Time on Team Formation
        </h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          HackMatch connects solo hackers with the perfect teammates and validates ideas
          before the event starts. Spend your 24 hours building, not networking.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Find Your Team
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            Pitch Your Idea
          </Button>
        </div>
      </div>
    </section>
  );
};
```

**Features Section Example:**

```typescript
// components/landing/FeaturesSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb, Trophy, BarChart } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Smart Team Matching',
    description: 'AI-powered skill matching connects you with complementary teammates based on your expertise and project needs.'
  },
  {
    icon: Lightbulb,
    title: 'Idea Validation',
    description: 'Get community votes and early feedback on your ideas before investing time in development.'
  },
  {
    icon: Trophy,
    title: 'Judge Pre-Scoring',
    description: 'Receive early feedback from judges to refine your concept and improve your chances of winning.'
  },
  {
    icon: BarChart,
    title: 'Organizer Analytics',
    description: 'Event organizers get insights into participant skills and interests for better hackathon planning.'
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need for Successful Team Formation
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
```

### Step 2: Page Integration

**Main Landing Page:**

```typescript
// pages/LandingPage.tsx
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { FooterSection } from '@/components/landing/FooterSection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
};
```

### Step 3: Routing Integration

**Update App.tsx routing:**

```typescript
// Add routes for landing pages
<Route path="/" element={<LandingPage />} />
<Route path="/about" element={<AboutPage />} />
<Route path="/pricing" element={<PricingPage />} />
<Route path="/contact" element={<ContactPage />} />
```

### Step 4: Styling and Responsiveness

- [ ] **Mobile-First Design:** Use Tailwind responsive classes (sm:, md:, lg:, xl:)
- [ ] **Consistent Spacing:** Use Tailwind spacing scale (p-4, m-8, etc.)
- [ ] **Color Scheme:** Use consistent brand colors throughout
- [ ] **Typography:** Proper heading hierarchy and readable font sizes
- [ ] **Hover Effects:** Interactive elements with smooth transitions

## Acceptance Criteria

- [ ] Hero section clearly communicates value proposition with strong CTAs
- [ ] Features section highlights key platform benefits with icons
- [ ] How it works section explains the 3-step process clearly
- [ ] Pricing section shows free tier for participants, paid for organizers
- [ ] Contact form captures inquiries (can store locally initially)
- [ ] **Demo Ready:** Can showcase complete landing experience in 30 seconds
- [ ] **Mobile Responsive:** Looks great on all device sizes
- [ ] **Fast Loading:** Optimized images and smooth animations
- [ ] **SEO Friendly:** Proper meta tags and semantic HTML

## Testing Checklist

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test responsive design on mobile, tablet, desktop
  - Test all interactive elements (buttons, forms, links)
  - Test smooth scrolling and animations
  - Test contact form validation

- [ ] **Cross-Browser:** Test in Chrome, Firefox, Safari
- [ ] **Performance:** Fast loading times and smooth animations
- [ ] **Accessibility:** Proper alt tags, keyboard navigation, color contrast

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in client directory
- [ ] **Code Review:** Self-review completed
- [ ] **Assets:** All images optimized and properly referenced
- [ ] **Routing:** All routes working correctly
- [ ] **Responsive:** Tested on multiple screen sizes
- [ ] **Content:** All copy is compelling and error-free

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** User onboarding flow, marketing site
- **Conflicts With:** None

## Content Guidelines

**Hero Section:**

- Headline: Focus on the pain point (wasting time on team formation)
- Subheading: Emphasize the solution (find teammates and validate ideas pre-event)
- CTAs: "Find Your Team" and "Pitch Your Idea"

**Features Section:**

- Smart Team Matching: AI-powered skill-based matching
- Idea Validation: Community voting and feedback
- Judge Pre-Scoring: Early feedback from judges
- Organizer Analytics: Insights for better event planning

**How It Works:**

1. Pitch Your Idea: Submit your hackathon concept with skills needed
2. Find Your Team: Browse ideas and connect with complementary teammates
3. Get Feedback: Receive votes and judge feedback to refine your approach

**Pricing:**

- Free for Participants: Full access to idea pitching and team formation
- Organizer Plans: Analytics, moderation tools, custom branding
- Judge Plans: Scoring tools, feedback management, insights

**Testimonials (Placeholder):**

- "Found my perfect team in 15 minutes instead of 3 hours" - Sarah, Developer
- "Our idea got 50+ votes before the event, we knew we were on the right track" - Mike, Designer
- "As an organizer, the analytics helped us plan better workshops" - Lisa, Event Organizer
