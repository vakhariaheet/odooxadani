# Module M07: Venue Analytics Dashboard

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F03 (Venue Management)

## Problem Context

Venue owners need comprehensive analytics to understand booking patterns, revenue optimization opportunities, peak usage times, and customer insights. This module provides the data-driven insights mentioned in the problem statement to help venue owners make informed business decisions.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create analytics handlers for venue owners
  - `handlers/getVenueAnalytics.ts` - GET /api/venues/:id/analytics (venue performance)
  - `handlers/getBookingAnalytics.ts` - GET /api/venues/:id/bookings/analytics
  - `handlers/getRevenueAnalytics.ts` - GET /api/venues/:id/revenue/analytics
  - `handlers/getUsageAnalytics.ts` - GET /api/venues/:id/usage/analytics

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'analytics', 'read')`
  - Use ownership middleware to ensure venue owners only see their own data

- [ ] **Service Layer:** Business logic in `services/VenueAnalyticsService.ts`
  - Booking pattern analysis (peak times, popular days)
  - Revenue calculations and trends
  - Occupancy rate calculations
  - Customer demographics and behavior
  - Comparative analytics (vs previous periods)

- [ ] **Type Definitions:** Add types to `types.ts`
  - `VenueAnalytics`, `BookingAnalytics`, `RevenueAnalytics`, `UsageAnalytics`
  - `AnalyticsTimeframe`, `AnalyticsMetrics`, `TrendData`
  - Chart data structures and aggregation types

- [ ] **RBAC Verification:** Module already configured in `permissions.ts`
  - `venue_owner`: read own analytics only
  - `admin`: read all venue analytics

- [ ] **AWS Service Integration:** Use existing DynamoDB client wrapper
  - **NEVER import @aws-sdk packages directly**
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Analytics Components:**
  - `VenueAnalyticsDashboard.tsx` - Main analytics overview
  - `BookingTrendsChart.tsx` - Booking patterns over time
  - `RevenueChart.tsx` - Revenue trends and projections
  - `OccupancyHeatmap.tsx` - Usage patterns by time/day
  - `CustomerInsights.tsx` - Customer demographics and behavior
  - `PerformanceMetrics.tsx` - Key performance indicators

- [ ] **shadcn Components:** card, select, button, badge, tabs, progress

- [ ] **Chart Library:** Add recharts or similar for data visualization
  - Line charts for trends
  - Bar charts for comparisons
  - Heatmaps for usage patterns
  - Pie charts for demographics

- [ ] **API Integration:** Analytics data fetching with date range selection

- [ ] **State Management:** Local state for date ranges, TanStack Query for analytics data

- [ ] **Routing:**
  - `/dashboard/venues/:id/analytics` - Venue analytics dashboard
  - `/dashboard/analytics` - All venues overview (venue owners with multiple venues)

- [ ] **Responsive Design:** Dashboard layout optimized for desktop and tablet

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema Enhancements

```
# Analytics aggregation patterns
pk: ANALYTICS#VENUE#[venueId] | sk: DAILY#[date] | gsi1pk: VENUE#[venueId] | gsi1sk: [date]
pk: ANALYTICS#VENUE#[venueId] | sk: MONTHLY#[month] | gsi1pk: VENUE#[venueId] | gsi1sk: [month]

Analytics fields:
- venueId: string
- date: string (YYYY-MM-DD or YYYY-MM)
- bookingCount: number
- revenue: number
- occupancyRate: number (0-1)
- averageBookingDuration: number (hours)
- peakHours: string[] (HH:mm format)
- customerTypes: { event_organizer: number, user: number }
- repeatCustomers: number
- cancellationRate: number
- averageRating?: number
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Complete backend and frontend architecture
   - Database design and aggregation patterns
   - Authentication and authorization flow
   - Ownership middleware usage patterns

2. **Study Similar Existing Modules:**
   - Review F03 venue management for data structures
   - Check existing admin analytics patterns
   - Study ownership middleware implementation
   - Review chart/dashboard patterns in existing code

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.ts, .tsx, .yml, etc.)

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/venues/
├── handlers/
│   ├── getVenueAnalytics.ts     # GET /api/venues/:id/analytics
│   ├── getBookingAnalytics.ts   # GET /api/venues/:id/bookings/analytics
│   ├── getRevenueAnalytics.ts   # GET /api/venues/:id/revenue/analytics
│   └── getUsageAnalytics.ts     # GET /api/venues/:id/usage/analytics
├── functions/
│   ├── getVenueAnalytics.yml
│   ├── getBookingAnalytics.yml
│   ├── getRevenueAnalytics.yml
│   └── getUsageAnalytics.yml
├── services/
│   └── VenueAnalyticsService.ts # Analytics calculations and aggregations
└── types.ts                     # Enhanced with analytics types
```

**Service Layer Example:**

```typescript
// services/VenueAnalyticsService.ts
export class VenueAnalyticsService {
  async getVenueAnalytics(venueId: string, timeframe: AnalyticsTimeframe): Promise<VenueAnalytics> {
    // Aggregate booking data for the timeframe
    // Calculate key metrics: occupancy, revenue, trends
    // Compare with previous period for growth metrics
  }

  async getBookingTrends(
    venueId: string,
    startDate: string,
    endDate: string
  ): Promise<BookingTrendData[]> {
    // Daily/weekly/monthly booking counts
    // Peak booking times and patterns
    // Seasonal trends and predictions
  }

  async getRevenueAnalytics(
    venueId: string,
    timeframe: AnalyticsTimeframe
  ): Promise<RevenueAnalytics> {
    // Revenue trends over time
    // Average booking value
    // Revenue per available hour
    // Growth rate calculations
  }

  async getUsagePatterns(venueId: string): Promise<UsageAnalytics> {
    // Heatmap data for time/day usage
    // Peak hours identification
    // Capacity utilization rates
    // Optimal pricing recommendations
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/venues/analytics/
│   ├── VenueAnalyticsDashboard.tsx # Main dashboard
│   ├── BookingTrendsChart.tsx      # Booking patterns
│   ├── RevenueChart.tsx            # Revenue trends
│   ├── OccupancyHeatmap.tsx        # Usage heatmap
│   ├── CustomerInsights.tsx        # Customer analytics
│   └── PerformanceMetrics.tsx      # KPI cards
├── pages/venues/
│   └── VenueAnalyticsPage.tsx      # Analytics page wrapper
├── hooks/
│   └── useVenueAnalytics.ts        # Analytics data hooks
└── utils/
    └── chartHelpers.ts             # Chart data formatting
```

**Dashboard Component Example:**

```typescript
// components/venues/analytics/VenueAnalyticsDashboard.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const VenueAnalyticsDashboard = ({ venueId }: { venueId: string }) => {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('month');
  const { data: analytics, loading } = useVenueAnalytics(venueId, timeframe);

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Venue Analytics</h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectItem value="week">Last 7 Days</SelectItem>
          <SelectItem value="month">Last 30 Days</SelectItem>
          <SelectItem value="quarter">Last 3 Months</SelectItem>
        </Select>
      </div>

      <PerformanceMetrics metrics={analytics.summary} />

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Booking Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingTrendsChart data={analytics.bookingTrends} />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueChart data={analytics.revenue} />
        </TabsContent>

        <TabsContent value="usage">
          <OccupancyHeatmap data={analytics.usage} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerInsights data={analytics.customers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### Step 3: Chart Integration

**Add Chart Library:**

```bash
# Add recharts for data visualization
npm install recharts
npm install @types/recharts --save-dev
```

**Chart Components:**

```typescript
// components/venues/analytics/BookingTrendsChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BookingTrendsChart = ({ data }: { data: BookingTrendData[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" stroke="#8884d8" />
            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

## Acceptance Criteria

- [ ] Venue owners can view comprehensive analytics for their venues
- [ ] Analytics show booking trends, revenue patterns, and usage insights
- [ ] Charts and visualizations are clear and informative
- [ ] Date range selection works for different timeframes
- [ ] Performance metrics highlight key business indicators
- [ ] Dashboard is responsive and works on tablets
- [ ] **Demo Ready:** Can show analytics dashboard with meaningful data in 30 seconds
- [ ] **Ownership Security:** Venue owners only see their own venue data
- [ ] **Data Accuracy:** Analytics calculations are correct and consistent
- [ ] **Visual Appeal:** Charts and metrics are professionally designed

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test analytics endpoints with different date ranges
  - Test ownership restrictions (venue owners vs admin)
  - Test data aggregation accuracy
  - Test error handling for invalid venue IDs

- [ ] **Frontend Testing:**
  - Test dashboard with real analytics data
  - Test chart rendering and interactions
  - Test date range selection
  - Test responsive design on tablet/desktop

- [ ] **Integration:** End-to-end analytics flow from data to visualization

## Deployment Checklist

- [ ] **Chart Library:** Recharts installed and configured
- [ ] **Serverless Config:** Added analytics function imports to serverless.yml
- [ ] **Types:** Analytics types exported for frontend use
- [ ] **Testing:** Manual testing with sample data completed
- [ ] **RBAC:** Ownership restrictions verified

## Related Modules

- **Depends On:** F03 (Venue Management)
- **Integrates With:** F04 (Booking System - for booking data)
- **Enables:** M10 (Analytics & Reporting - venue insights)
- **Future Enhancement:** Real-time analytics with WebSocket updates

## Analytics Metrics

**Key Performance Indicators:**

- Total Bookings (current vs previous period)
- Total Revenue (current vs previous period)
- Average Occupancy Rate
- Average Booking Value
- Customer Retention Rate
- Peak Usage Hours
- Cancellation Rate

**Trend Analysis:**

- Daily/Weekly/Monthly booking patterns
- Seasonal trends and forecasting
- Revenue growth rate
- Customer acquisition trends

**Optimization Insights:**

- Optimal pricing recommendations
- Peak hour identification
- Capacity utilization opportunities
- Customer behavior patterns
