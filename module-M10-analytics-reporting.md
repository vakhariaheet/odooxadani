# Module M10: Analytics & Reporting

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Complex

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F01 (Event Management) + F03 (Venue Management) + F04 (Booking System)

## Problem Context

Platform administrators and business users need comprehensive analytics across events, venues, and bookings to understand platform performance, user behavior, revenue trends, and growth opportunities. This module provides the business intelligence needed to optimize the EventHub platform.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create comprehensive analytics endpoints
  - `handlers/getPlatformAnalytics.ts` - GET /api/analytics/platform (admin only)
  - `handlers/getEventAnalytics.ts` - GET /api/analytics/events
  - `handlers/getVenueAnalytics.ts` - GET /api/analytics/venues
  - `handlers/getBookingAnalytics.ts` - GET /api/analytics/bookings
  - `handlers/getUserAnalytics.ts` - GET /api/analytics/users
  - `handlers/getRevenueAnalytics.ts` - GET /api/analytics/revenue

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'analytics', 'read')`
  - Admin-only endpoints use `withRbac` with admin role checking

- [ ] **Service Layer:** Create comprehensive `AnalyticsService.ts`
  - Cross-module data aggregation
  - Time-series analytics and trend calculation
  - User behavior analysis and segmentation
  - Revenue analytics and forecasting
  - Platform performance metrics
  - Comparative analytics and benchmarking

- [ ] **Type Definitions:** Add comprehensive analytics types
  - `PlatformAnalytics`, `EventAnalytics`, `VenueAnalytics`, `BookingAnalytics`
  - `UserAnalytics`, `RevenueAnalytics`, `TrendAnalysis`
  - `AnalyticsTimeframe`, `AnalyticsFilters`, `MetricComparison`

- [ ] **RBAC Verification:** Module already configured in `permissions.ts`
  - `admin`: full access to all analytics
  - `venue_owner`: access to own venue analytics
  - `event_organizer`: access to own event analytics
  - `user`: access to personal usage analytics

- [ ] **AWS Service Integration:** Use existing DynamoDB client wrapper
  - **NEVER import @aws-sdk packages directly**
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`
  - Complex queries across multiple GSIs

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Analytics Dashboard Components:**
  - `PlatformAnalyticsDashboard.tsx` - Admin overview dashboard
  - `EventAnalyticsDashboard.tsx` - Event performance analytics
  - `VenueAnalyticsDashboard.tsx` - Venue performance analytics
  - `BookingAnalyticsDashboard.tsx` - Booking trends and patterns
  - `UserAnalyticsDashboard.tsx` - User behavior and engagement
  - `RevenueAnalyticsDashboard.tsx` - Revenue trends and forecasting

- [ ] **Chart and Visualization Components:**
  - `TrendChart.tsx` - Time-series trend visualization
  - `ComparisonChart.tsx` - Period-over-period comparisons
  - `GeographicHeatmap.tsx` - Location-based analytics
  - `UserSegmentChart.tsx` - User behavior segmentation
  - `RevenueWaterfall.tsx` - Revenue breakdown visualization

- [ ] **shadcn Components:** card, select, button, badge, tabs, progress, table

- [ ] **Chart Library:** Enhanced recharts usage for complex visualizations
  - Multi-axis charts for different metrics
  - Interactive charts with drill-down capabilities
  - Real-time data updates

- [ ] **API Integration:** Complex analytics queries with caching

- [ ] **State Management:** Analytics filters, date ranges, cached data

- [ ] **Routing:**
  - `/admin/analytics` - Platform analytics (admin only)
  - `/dashboard/analytics/events` - Event organizer analytics
  - `/dashboard/analytics/venues` - Venue owner analytics
  - `/dashboard/analytics/personal` - Personal usage analytics

- [ ] **Responsive Design:** Dashboard layouts optimized for desktop and tablet

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema for Analytics

```
# Analytics aggregation patterns
pk: ANALYTICS#PLATFORM | sk: DAILY#[date] | gsi1pk: ANALYTICS#PLATFORM | gsi1sk: [date]
pk: ANALYTICS#PLATFORM | sk: MONTHLY#[month] | gsi1pk: ANALYTICS#PLATFORM | gsi1sk: [month]

# Cross-module analytics
pk: ANALYTICS#EVENT#[eventId] | sk: SUMMARY | gsi1pk: EVENT#[eventId] | gsi1sk: ANALYTICS
pk: ANALYTICS#VENUE#[venueId] | sk: SUMMARY | gsi1pk: VENUE#[venueId] | gsi1sk: ANALYTICS
pk: ANALYTICS#USER#[userId] | sk: SUMMARY | gsi1pk: USER#[userId] | gsi1sk: ANALYTICS

Platform analytics fields:
- totalEvents: number
- totalVenues: number
- totalBookings: number
- totalUsers: number
- totalRevenue: number
- activeUsers: number
- newSignups: number
- conversionRate: number
- averageBookingValue: number
- topCategories: { category: string, count: number }[]
- topLocations: { city: string, count: number }[]
- userGrowthRate: number
- revenueGrowthRate: number
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Complete backend and frontend architecture
   - Database design and complex query patterns
   - Cross-module data access patterns
   - Analytics and reporting best practices

2. **Study All Foundation Modules:**
   - Review F01 event data structures and patterns
   - Review F03 venue data structures and patterns
   - Review F04 booking data structures and patterns
   - Understand how to aggregate data across modules

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.ts, .tsx, .yml, etc.)

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/analytics/
├── handlers/
│   ├── getPlatformAnalytics.ts     # GET /api/analytics/platform
│   ├── getEventAnalytics.ts        # GET /api/analytics/events
│   ├── getVenueAnalytics.ts        # GET /api/analytics/venues
│   ├── getBookingAnalytics.ts      # GET /api/analytics/bookings
│   ├── getUserAnalytics.ts         # GET /api/analytics/users
│   └── getRevenueAnalytics.ts      # GET /api/analytics/revenue
├── functions/
│   ├── getPlatformAnalytics.yml
│   ├── getEventAnalytics.yml
│   ├── getVenueAnalytics.yml
│   ├── getBookingAnalytics.yml
│   ├── getUserAnalytics.yml
│   └── getRevenueAnalytics.yml
├── services/
│   ├── AnalyticsService.ts         # Main analytics service
│   ├── EventAnalyticsService.ts    # Event-specific analytics
│   ├── VenueAnalyticsService.ts    # Venue-specific analytics
│   └── RevenueAnalyticsService.ts  # Revenue calculations
└── types.ts                        # Analytics types and interfaces
```

**Comprehensive Analytics Service:**

```typescript
// services/AnalyticsService.ts
export class AnalyticsService {
  async getPlatformAnalytics(timeframe: AnalyticsTimeframe): Promise<PlatformAnalytics> {
    // Aggregate data across all modules
    // Calculate platform-wide KPIs
    // Generate growth trends and comparisons
    // Identify top-performing categories and locations
  }

  async getCrossModuleInsights(filters: AnalyticsFilters): Promise<CrossModuleInsights> {
    // Analyze relationships between events, venues, and bookings
    // Calculate conversion funnels
    // Identify optimization opportunities
    // Generate actionable recommendations
  }

  async generateTrendAnalysis(
    metric: string,
    timeframe: AnalyticsTimeframe
  ): Promise<TrendAnalysis> {
    // Time-series analysis for any metric
    // Seasonal pattern detection
    // Growth rate calculations
    // Forecasting and predictions
  }

  async getUserSegmentAnalysis(): Promise<UserSegmentAnalysis> {
    // Segment users by behavior patterns
    // Calculate lifetime value
    // Identify high-value user characteristics
    // Generate retention insights
  }
}

// services/RevenueAnalyticsService.ts
export class RevenueAnalyticsService {
  async getRevenueBreakdown(timeframe: AnalyticsTimeframe): Promise<RevenueBreakdown> {
    // Revenue by source (events vs venues)
    // Revenue by category and location
    // Average transaction values
    // Revenue per user metrics
  }

  async getRevenueForecast(months: number): Promise<RevenueForecast> {
    // Predictive revenue modeling
    // Seasonal adjustments
    // Growth scenario planning
    // Revenue optimization recommendations
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/analytics/
│   ├── PlatformAnalyticsDashboard.tsx # Admin overview
│   ├── EventAnalyticsDashboard.tsx    # Event analytics
│   ├── VenueAnalyticsDashboard.tsx    # Venue analytics
│   ├── BookingAnalyticsDashboard.tsx  # Booking analytics
│   ├── UserAnalyticsDashboard.tsx     # User analytics
│   └── RevenueAnalyticsDashboard.tsx  # Revenue analytics
├── components/charts/
│   ├── TrendChart.tsx                 # Time-series charts
│   ├── ComparisonChart.tsx            # Period comparisons
│   ├── GeographicHeatmap.tsx          # Location analytics
│   ├── UserSegmentChart.tsx           # User segmentation
│   └── RevenueWaterfall.tsx           # Revenue breakdown
├── pages/analytics/
│   ├── AdminAnalyticsPage.tsx         # Admin analytics page
│   ├── EventAnalyticsPage.tsx         # Event organizer analytics
│   ├── VenueAnalyticsPage.tsx         # Venue owner analytics
│   └── PersonalAnalyticsPage.tsx      # User analytics
├── hooks/
│   ├── useAnalytics.ts                # Analytics data hooks
│   ├── useTrendAnalysis.ts            # Trend analysis hooks
│   └── useRevenueAnalytics.ts         # Revenue analytics hooks
└── utils/
    ├── analyticsHelpers.ts            # Analytics calculations
    └── chartFormatters.ts             # Chart data formatting
```

**Comprehensive Dashboard Example:**

```typescript
// components/analytics/PlatformAnalyticsDashboard.tsx
export const PlatformAnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('month');
  const { data: platformAnalytics, loading } = usePlatformAnalytics(timeframe);
  const { data: trendData } = useTrendAnalysis(['users', 'bookings', 'revenue'], timeframe);

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectItem value="week">Last 7 Days</SelectItem>
          <SelectItem value="month">Last 30 Days</SelectItem>
          <SelectItem value="quarter">Last 3 Months</SelectItem>
          <SelectItem value="year">Last 12 Months</SelectItem>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={platformAnalytics.totalUsers}
          change={platformAnalytics.userGrowthRate}
          trend="up"
        />
        <MetricCard
          title="Total Bookings"
          value={platformAnalytics.totalBookings}
          change={platformAnalytics.bookingGrowthRate}
          trend="up"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(platformAnalytics.totalRevenue)}
          change={platformAnalytics.revenueGrowthRate}
          trend="up"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(platformAnalytics.conversionRate * 100).toFixed(1)}%`}
          change={platformAnalytics.conversionRateChange}
          trend={platformAnalytics.conversionRateChange > 0 ? "up" : "down"}
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={trendData.users}
              xKey="date"
              yKey="count"
              color="#8884d8"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={trendData.revenue}
              xKey="date"
              yKey="amount"
              color="#82ca9d"
              formatValue={formatCurrency}
            />
          </CardContent>
        </Card>
      </div>

      {/* Category and Location Analytics */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Event Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platformAnalytics.topCategories.map((category, index) => (
                <div key={category.category} className="flex justify-between items-center">
                  <span>{category.category}</span>
                  <Badge variant="outline">{category.count} events</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platformAnalytics.topLocations.map((location, index) => (
                <div key={location.city} className="flex justify-between items-center">
                  <span>{location.city}</span>
                  <Badge variant="outline">{location.count} venues</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### Step 3: Advanced Analytics Features

**Real-time Analytics Updates:**

```typescript
// hooks/useAnalytics.ts
export const useAnalytics = (type: AnalyticsType, filters: AnalyticsFilters) => {
  const { data, loading, error } = useApi({
    url: `/api/analytics/${type}`,
    params: filters,
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  const refreshAnalytics = useCallback(() => {
    // Manual refresh trigger
    mutate();
  }, [mutate]);

  return {
    data,
    loading,
    error,
    refreshAnalytics,
  };
};
```

**Export and Reporting:**

```typescript
// utils/analyticsHelpers.ts
export const exportAnalyticsData = (data: any[], format: 'csv' | 'json' | 'pdf') => {
  switch (format) {
    case 'csv':
      return exportToCSV(data);
    case 'json':
      return exportToJSON(data);
    case 'pdf':
      return exportToPDF(data);
  }
};

export const generateAnalyticsReport = (analytics: PlatformAnalytics) => {
  // Generate comprehensive analytics report
  // Include insights, trends, and recommendations
  // Format for executive summary
};
```

## Acceptance Criteria

- [ ] Platform administrators can view comprehensive analytics across all modules
- [ ] Event organizers can see detailed analytics for their events
- [ ] Venue owners can access analytics for their venues
- [ ] Analytics show meaningful trends and insights
- [ ] Charts and visualizations are clear and interactive
- [ ] Data can be filtered by date ranges and other criteria
- [ ] **Demo Ready:** Can show comprehensive analytics dashboard in 30 seconds
- [ ] **Cross-Module Insights:** Analytics combine data from events, venues, and bookings
- [ ] **Performance:** Analytics load quickly despite complex calculations
- [ ] **Role-Based Access:** Users only see analytics they're authorized to view

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test platform analytics with different timeframes
  - Test role-based access to analytics endpoints
  - Test cross-module data aggregation accuracy
  - Test analytics performance with large datasets

- [ ] **Frontend Testing:**
  - Test analytics dashboards with real data
  - Test chart interactions and drill-down capabilities
  - Test filter combinations and date range selection
  - Test responsive design on different screen sizes

- [ ] **Integration:** End-to-end analytics flow from data collection to visualization

## Deployment Checklist

- [ ] **Chart Library:** Enhanced recharts configuration for complex visualizations
- [ ] **Serverless Config:** Added analytics function imports to serverless.yml
- [ ] **Performance:** Analytics queries optimized for large datasets
- [ ] **Caching:** Analytics data cached appropriately for performance
- [ ] **RBAC:** Role-based analytics access verified

## Related Modules

- **Depends On:** F01 (Event Management) + F03 (Venue Management) + F04 (Booking System)
- **Integrates With:** M07 (Venue Analytics - enhanced venue insights)
- **Enables:** Data-driven decision making across the platform
- **Future Enhancement:** Machine learning insights and predictions

## Analytics Categories

**Platform Health:**

- User acquisition and retention
- Platform usage patterns
- System performance metrics
- Error rates and reliability

**Business Performance:**

- Revenue trends and forecasting
- Conversion funnel analysis
- Customer lifetime value
- Market penetration by location

**User Behavior:**

- Feature usage patterns
- User journey analysis
- Engagement metrics
- Churn prediction

**Operational Insights:**

- Peak usage times
- Resource utilization
- Support ticket trends
- Performance bottlenecks
