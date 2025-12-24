# Module M05: Enhanced Event Discovery

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F01 (Event Management)

## Problem Context

Building on the basic event management system, users need advanced discovery features including smart filtering, search functionality, personalized recommendations, and category-based browsing to solve the event discovery challenges mentioned in the problem statement.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Enhance existing event handlers with advanced features
  - `handlers/searchEvents.ts` - GET /api/events/search (advanced search with filters)
  - `handlers/getEventsByCategory.ts` - GET /api/events/category/:category
  - `handlers/getRecommendedEvents.ts` - GET /api/events/recommended (personalized)
  - `handlers/getPopularEvents.ts` - GET /api/events/popular (trending events)

- [ ] **Function Configs:** Create corresponding .yml files for new handlers

- [ ] **Service Layer:** Enhance `EventService.ts` with advanced features
  - Advanced search with multiple filters (location radius, price range, date range)
  - Category-based filtering and browsing
  - Basic recommendation engine (based on user's past bookings/interests)
  - Popular events calculation (based on booking count, views)
  - Location-based search with distance calculation

- [ ] **Type Definitions:** Add enhanced types to `types.ts`
  - `EventSearchQuery`, `EventFilters`, `RecommendationRequest`
  - `PopularEventsResponse`, `CategoryEventsResponse`
  - Location and distance calculation types

- [ ] **RBAC Verification:** Uses existing event module permissions
  - All authenticated users can access enhanced discovery features

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Enhanced Components:**
  - `EventSearchBar.tsx` - Advanced search with autocomplete
  - `EventFilters.tsx` - Comprehensive filtering sidebar
  - `EventCategoryGrid.tsx` - Category-based browsing
  - `RecommendedEvents.tsx` - Personalized recommendations section
  - `PopularEvents.tsx` - Trending events carousel
  - `EventMap.tsx` - Map view of events (optional)

- [ ] **shadcn Components:** input, select, slider, checkbox, badge, tabs, command

- [ ] **API Integration:** Enhanced search and filtering with debounced queries

- [ ] **State Management:** URL state for filters, local state for search

- [ ] **Routing:**
  - `/events/search?q=...&category=...&location=...` - Advanced search
  - `/events/category/:category` - Category browsing
  - `/events/recommended` - Personalized recommendations
  - `/events/popular` - Popular/trending events

### Database Schema Enhancements

```
# Additional GSI patterns for enhanced discovery
pk: EVENT#[eventId] | sk: CATEGORY#[category] | gsi1pk: CATEGORY#[category] | gsi1sk: [popularity_score]
pk: EVENT#[eventId] | sk: LOCATION#[city] | gsi1pk: LOCATION#[city] | gsi1sk: [startDate]
pk: EVENT#[eventId] | sk: POPULARITY | gsi1pk: POPULAR#[date] | gsi1sk: [booking_count]

Additional event fields:
- tags: string[] (searchable keywords)
- viewCount: number
- bookingCount: number
- popularityScore: number (calculated field)
- searchableText: string (concatenated searchable fields)
```

## Implementation Guide

### Step 1: Backend Enhancement

**Enhanced Service Methods:**

```typescript
// services/EventService.ts (enhance existing)
export class EventService {
  async searchEvents(query: EventSearchQuery): Promise<EventListResponse> {
    // Full-text search across title, description, tags
    // Filter by location (with radius), category, price range, date range
    // Sort by relevance, date, popularity, price
  }

  async getEventsByCategory(category: string, limit: number = 20): Promise<Event[]> {
    // Get events in specific category
    // Sort by popularity or date
  }

  async getRecommendedEvents(userId: string): Promise<Event[]> {
    // Basic recommendation based on:
    // - User's past bookings (categories they've booked)
    // - Popular events in their location
    // - Events similar to ones they've viewed
  }

  async getPopularEvents(timeframe: 'week' | 'month' = 'week'): Promise<Event[]> {
    // Calculate popularity based on:
    // - Booking count
    // - View count
    // - Recent activity
  }
}
```

### Step 2: Frontend Enhancement

**Enhanced Search Experience:**

```typescript
// components/events/EventSearchBar.tsx
export const EventSearchBar = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<EventFilters>({});
  const debouncedQuery = useDebounce(query, 300);

  // Real-time search with debouncing
  // Autocomplete suggestions
  // Filter integration
};

// components/events/EventFilters.tsx
export const EventFilters = ({ filters, onFiltersChange }) => {
  // Category selection
  // Date range picker
  // Location/radius selector
  // Price range slider
  // Event type checkboxes
};
```

### Step 3: Integration with F01

- [ ] Enhance existing event listing pages with new search capabilities
- [ ] Add recommendation sections to dashboard
- [ ] Integrate popular events into landing page
- [ ] Update event detail pages with related events

## Acceptance Criteria

- [ ] Users can search events with multiple filters simultaneously
- [ ] Category-based browsing works smoothly
- [ ] Personalized recommendations appear for logged-in users
- [ ] Popular events section shows trending content
- [ ] Search results are relevant and fast (<2 seconds)
- [ ] Filters can be combined and work together properly
- [ ] **Demo Ready:** Can demonstrate advanced search and recommendations in 30 seconds
- [ ] **Enhanced UX:** Significantly better than basic event listing
- [ ] **Mobile Responsive:** All new features work on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test advanced search with various filter combinations
  - Test category browsing
  - Test recommendation engine with different users
  - Test popular events calculation

- [ ] **Frontend Testing:**
  - Test search bar with autocomplete
  - Test filter combinations
  - Test responsive design on mobile
  - Test performance with large result sets

## Related Modules

- **Depends On:** F01 (Event Management)
- **Enables:** M10 (Analytics - search analytics)
- **Integrates With:** F02 (Landing Page - popular events section)
