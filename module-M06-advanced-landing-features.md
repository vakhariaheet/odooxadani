# Module M06: Advanced Landing Features

## Overview

**Estimated Time:** 45min

**Complexity:** Simple

**Type:** Frontend-only

**Risk Level:** Low

**Dependencies:** F02 (EventHub Landing Page)

## Problem Context

Building on the basic landing page, EventHub needs advanced marketing features including interactive demos, dynamic content, lead capture forms, newsletter signup, and integration with the actual platform data to showcase real events and venues.

## Technical Requirements

**Module Type:** Frontend-only

### Frontend Tasks

- [ ] **Enhanced Landing Components:**
  - `InteractiveDemo.tsx` - Live platform preview/walkthrough
  - `FeaturedEventsCarousel.tsx` - Showcase real events from F01
  - `FeaturedVenuesGrid.tsx` - Showcase real venues from F03
  - `NewsletterSignup.tsx` - Email capture with validation
  - `LeadCaptureForm.tsx` - Contact form with lead scoring
  - `LiveStatsCounter.tsx` - Real-time platform statistics
  - `UserTestimonials.tsx` - Dynamic testimonial carousel

- [ ] **shadcn Components:** carousel, form, input, button, badge, card, dialog, alert

- [ ] **API Integration:** Read-only access to events and venues for showcasing

- [ ] **State Management:** Local state for forms, TanStack Query for platform data

- [ ] **Routing:**
  - `/demo` - Interactive platform demo
  - `/success` - Thank you page after form submissions
  - `/newsletter-confirm` - Newsletter confirmation page

- [ ] **Responsive Design:** Enhanced mobile experience with touch interactions

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### No Backend Required

This module enhances the frontend-only landing page with dynamic content from existing APIs (F01 events, F03 venues). No new backend endpoints needed.

### Integration Points

**With F01 (Event Management):**

- Fetch featured/popular events for landing page showcase
- Display real event data to build trust

**With F03 (Venue Management):**

- Fetch featured venues for landing page showcase
- Show real venue availability and pricing

**With Existing User System:**

- Track newsletter signups in local storage
- Prepare lead data for future CRM integration

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (10-15 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Frontend architecture and patterns
   - API integration patterns with TanStack Query
   - Component structure and conventions
   - Existing hooks usage (`useApi`, `useAsync`)

2. **Study Existing Code:**
   - Review F02 landing page components for consistency
   - Check F01 event API endpoints for data structure
   - Check F03 venue API endpoints for data structure
   - Study existing form patterns in the codebase

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.tsx, .ts, etc.)

### Step 1: Enhanced Landing Components

**File Structure:**

```
client/src/
├── components/landing/
│   ├── InteractiveDemo.tsx      # Platform walkthrough
│   ├── FeaturedEventsCarousel.tsx # Real events showcase
│   ├── FeaturedVenuesGrid.tsx   # Real venues showcase
│   ├── NewsletterSignup.tsx     # Email capture
│   ├── LeadCaptureForm.tsx      # Advanced contact form
│   ├── LiveStatsCounter.tsx     # Platform statistics
│   └── UserTestimonials.tsx     # Dynamic testimonials
├── pages/
│   ├── DemoPage.tsx             # Interactive demo page
│   ├── SuccessPage.tsx          # Thank you page
│   └── NewsletterConfirmPage.tsx # Newsletter confirmation
└── hooks/
    └── useLandingData.ts        # Landing page data fetching
```

**Enhanced Component Examples:**

```typescript
// components/landing/FeaturedEventsCarousel.tsx
import { useApi } from '@/hooks';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export const FeaturedEventsCarousel = () => {
  const { data: events, loading } = useApi({
    url: '/api/events/popular',
    params: { limit: 6 }
  });

  if (loading) return <EventsSkeleton />;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Discover Amazing Events
        </h2>
        <Carousel>
          <CarouselContent>
            {events?.map(event => (
              <CarouselItem key={event.id} className="md:basis-1/3">
                <EventCard event={event} showBookButton />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

// components/landing/InteractiveDemo.tsx
export const InteractiveDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const demoSteps = [
    { title: "Browse Events", component: <DemoEventList /> },
    { title: "Select Venue", component: <DemoVenueSearch /> },
    { title: "Book Instantly", component: <DemoBookingForm /> },
    { title: "Manage Everything", component: <DemoDashboard /> }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          See EventHub in Action
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            {demoSteps.map((step, index) => (
              <Button
                key={index}
                variant={currentStep === index ? "default" : "outline"}
                onClick={() => setCurrentStep(index)}
                className="mx-2"
              >
                {step.title}
              </Button>
            ))}
          </div>
          <div className="bg-gray-100 rounded-lg p-8 min-h-96">
            {demoSteps[currentStep].component}
          </div>
        </div>
      </div>
    </section>
  );
};
```

### Step 2: Dynamic Content Integration

**API Integration for Real Data:**

```typescript
// hooks/useLandingData.ts
export const useLandingData = () => {
  const { data: featuredEvents } = useApi({
    url: '/api/events/popular',
    params: { limit: 6 },
  });

  const { data: featuredVenues } = useApi({
    url: '/api/venues',
    params: { limit: 8, featured: true },
  });

  const { data: stats } = useApi({
    url: '/api/admin/stats', // If available
    fallback: {
      totalEvents: 150,
      totalVenues: 75,
      totalBookings: 500,
      activeUsers: 1200,
    },
  });

  return {
    featuredEvents,
    featuredVenues,
    stats,
    loading: !featuredEvents || !featuredVenues,
  };
};
```

### Step 3: Lead Capture and Analytics

**Enhanced Forms:**

```typescript
// components/landing/LeadCaptureForm.tsx
export const LeadCaptureForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'event_organizer', // or venue_owner
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Store lead in localStorage for now
    const leads = JSON.parse(localStorage.getItem('leads') || '[]');
    leads.push({
      ...formData,
      timestamp: new Date().toISOString(),
      source: 'landing_page'
    });
    localStorage.setItem('leads', JSON.stringify(leads));

    // Show success message and redirect
    toast.success('Thank you! We\'ll be in touch soon.');
    // Redirect to success page
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields with validation */}
    </form>
  );
};
```

## Acceptance Criteria

- [ ] Landing page displays real events and venues from the platform
- [ ] Interactive demo showcases key platform features
- [ ] Newsletter signup captures emails with validation
- [ ] Lead capture form stores inquiries locally
- [ ] Live stats counter shows platform activity
- [ ] All components are mobile-responsive
- [ ] **Demo Ready:** Can show enhanced landing page with real data in 30 seconds
- [ ] **Dynamic Content:** Real events and venues are displayed
- [ ] **Professional Polish:** Significantly enhanced from basic landing page
- [ ] **Lead Generation:** Forms capture and store lead information
- [ ] **Mobile Optimized:** Touch-friendly interactions on mobile

## Testing Checklist

- [ ] **Frontend Testing:**
  - Test interactive demo on desktop and mobile
  - Test carousel navigation and responsiveness
  - Test form validation and submission
  - Test real data integration (events/venues display)
  - Test loading states and error handling

- [ ] **Integration Testing:**
  - Verify events API integration works
  - Verify venues API integration works
  - Test form data storage in localStorage
  - Test navigation between landing pages

- [ ] **Performance Testing:**
  - Check page load speed with real data
  - Test carousel performance with multiple items
  - Verify images load quickly and are optimized

## Deployment Checklist

- [ ] **API Integration:** Verified connection to F01 and F03 APIs
- [ ] **Assets:** All demo images and content are optimized
- [ ] **Forms:** Lead capture and newsletter signup work correctly
- [ ] **Responsive:** All components work on mobile devices
- [ ] **Performance:** Page loads quickly with dynamic content

## Related Modules

- **Depends On:** F02 (EventHub Landing Page)
- **Integrates With:** F01 (Event Management - for featured events)
- **Integrates With:** F03 (Venue Management - for featured venues)
- **Enables:** Future CRM integration for lead management

## Content Strategy

**Interactive Demo Scenarios:**

1. **Browse Events:** Show event search with filters
2. **Select Venue:** Demonstrate venue discovery and details
3. **Book Instantly:** Walk through booking process
4. **Manage Everything:** Show dashboard capabilities

**Social Proof Elements:**

- Real event and venue counts
- User testimonials (can be mock initially)
- Success stories and case studies
- Trust badges and certifications

**Conversion Optimization:**

- Clear value propositions
- Multiple CTA buttons
- Social proof throughout
- Reduced friction in forms
- Mobile-first design
