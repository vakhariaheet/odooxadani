# Module F02: EventHub Landing Page

## Overview

**Estimated Time:** 45min

**Complexity:** Simple

**Type:** Frontend-only

**Risk Level:** Low

**Dependencies:** None

## Problem Context

EventHub needs a compelling landing page that showcases the platform's value proposition, builds trust with potential users, and drives sign-ups for both event organizers and venue owners. This creates the first impression and conversion funnel entry point.

## Technical Requirements

**Module Type:** Frontend-only

### Frontend Tasks

- [ ] **Landing Page Components:**
  - `HeroSection.tsx` - Main value proposition with CTA buttons
  - `FeaturesSection.tsx` - Key platform benefits showcase
  - `HowItWorksSection.tsx` - Step-by-step process explanation
  - `TestimonialsSection.tsx` - Social proof and user testimonials
  - `PricingSection.tsx` - Pricing plans for different user types
  - `ContactSection.tsx` - Contact form and support information
  - `FooterSection.tsx` - Links, legal, and additional info

- [ ] **shadcn Components:** button, card, input, textarea, badge, separator

- [ ] **Static Content:** No backend API calls needed - all content is static/hardcoded

- [ ] **State Management:** Local state for contact form, no server state needed

- [ ] **Routing:**
  - `/` - Main landing page (replace existing)
  - `/features` - Detailed features page
  - `/pricing` - Pricing details page
  - `/contact` - Contact form page
  - `/about` - About EventHub page

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

- [ ] **Performance:** Optimized images, lazy loading, fast initial load

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### No Backend Required

This is a frontend-only module with static content. No API endpoints, database, or server-side logic needed.

### Content Structure

**Hero Section:**

- Headline: "Find Perfect Venues, Create Amazing Events"
- Subheading: "Discover venues, manage bookings, and create unforgettable experiences all in one platform"
- CTA Buttons: "Find Events" (→ /events), "List Your Venue" (→ /sign-up?role=venue_owner)

**Features Section:**

- Event Discovery: Smart filtering, personalized recommendations
- Venue Management: Real-time availability, booking management
- Seamless Booking: One-click reservations, secure payments
- Analytics: Performance insights, revenue tracking

**How It Works:**

1. Browse Events: Discover events by category, location, date
2. Book Instantly: Secure your spot with real-time availability
3. Manage Everything: Track bookings, communicate with organizers

**Pricing Plans:**

- Free: Basic event browsing and booking
- Organizer Pro: Advanced event management tools
- Venue Owner: Comprehensive venue management suite

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (10-15 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Frontend architecture and patterns
   - Component structure and conventions
   - Routing patterns with React Router
   - shadcn/ui component usage
   - Styling with Tailwind CSS

2. **Study Existing Frontend Code:**
   - Review `client/src/pages/LandingPage.tsx` for current structure
   - Check `client/src/components/ui/` for available shadcn components
   - Examine existing pages for routing patterns
   - Study Tailwind CSS usage patterns

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.tsx, .ts, etc.)

### Step 1: Frontend Implementation

**File Structure:**

```
client/src/
├── components/landing/
│   ├── HeroSection.tsx      # Main hero with CTA
│   ├── FeaturesSection.tsx  # Platform benefits
│   ├── HowItWorksSection.tsx # Process explanation
│   ├── TestimonialsSection.tsx # Social proof
│   ├── PricingSection.tsx   # Pricing plans
│   ├── ContactSection.tsx   # Contact form
│   └── FooterSection.tsx    # Footer content
├── pages/
│   ├── LandingPage.tsx      # Main landing page (update existing)
│   ├── FeaturesPage.tsx     # Detailed features
│   ├── PricingPage.tsx      # Pricing details
│   ├── ContactPage.tsx      # Contact form
│   └── AboutPage.tsx        # About EventHub
└── assets/
    └── landing/             # Landing page images/icons
```

**Component Pattern:**

```typescript
// components/landing/HeroSection.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Find Perfect Venues, Create Amazing Events
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Discover venues, manage bookings, and create unforgettable experiences all in one platform
        </p>
        <div className="space-x-4">
          <Button size="lg" variant="secondary">
            Find Events
          </Button>
          <Button size="lg" variant="outline">
            List Your Venue
          </Button>
        </div>
      </div>
    </section>
  );
};
```

### Step 2: Routing Integration

Update React Router configuration to include new landing pages:

```typescript
// App.tsx or routing configuration
{
  path: "/",
  element: <LandingPage />,
},
{
  path: "/features",
  element: <FeaturesPage />,
},
{
  path: "/pricing",
  element: <PricingPage />,
},
{
  path: "/contact",
  element: <ContactPage />,
},
{
  path: "/about",
  element: <AboutPage />,
}
```

### Step 3: Styling and Responsiveness

- Use Tailwind CSS for all styling
- Implement mobile-first responsive design
- Use shadcn/ui components for consistency
- Add smooth scrolling and animations
- Optimize for fast loading

## Acceptance Criteria

- [ ] Landing page loads quickly (<2 seconds) on mobile and desktop
- [ ] Hero section clearly communicates value proposition
- [ ] Features section highlights key platform benefits
- [ ] Pricing section shows clear plans for different user types
- [ ] Contact form captures leads (stores locally for now)
- [ ] **Demo Ready:** Can show complete landing page in 30 seconds
- [ ] **Mobile Responsive:** Works perfectly on mobile devices
- [ ] **Professional Design:** Looks polished and trustworthy
- [ ] **Clear CTAs:** Sign-up and navigation paths are obvious
- [ ] **Fast Loading:** Optimized images and minimal bundle size

## Testing Checklist

- [ ] **Frontend Testing:**
  - Manual testing on desktop (Chrome, Firefox, Safari)
  - Manual testing on mobile (iOS Safari, Android Chrome)
  - Test all navigation links work correctly
  - Test contact form validation and submission
  - Test responsive design at different screen sizes

- [ ] **Performance Testing:**
  - Check page load speed with browser dev tools
  - Verify images are optimized and load quickly
  - Test smooth scrolling and animations

- [ ] **Accessibility:** Basic accessibility checks (keyboard navigation, alt text)

## Deployment Checklist

- [ ] **Assets:** All images and icons are optimized and included
- [ ] **Routing:** New routes are properly configured
- [ ] **Styling:** Tailwind CSS classes are working correctly
- [ ] **Testing:** Manual testing completed across devices
- [ ] **Performance:** Page loads quickly and smoothly

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M06 (Advanced Landing Features)
- **Conflicts With:** None

## Content Guidelines

**Tone:** Professional, friendly, trustworthy
**Focus:** Benefits over features, user outcomes over technical details
**CTAs:** Clear, action-oriented, benefit-focused
**Images:** High-quality, diverse, showing real events and venues
**Copy:** Concise, scannable, conversion-optimized
