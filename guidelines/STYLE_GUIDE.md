# Style Guide - Freelancer Invoice & Contract Generator

## Overview

This style guide defines the visual design system, UI patterns, and component standards for the Freelancer Invoice & Contract Generator application. Follow these guidelines to ensure consistency across all modules.

---

## Color Palette

### Primary Colors (Alice Blue)

Our primary color palette uses Alice Blue tones for a professional, trustworthy appearance suitable for financial applications.

```css
/* Alice Blue Scale */
--color-alice-blue-50: #eff3f6; /* Lightest - backgrounds, hover states */
--color-alice-blue-100: #dee7ed; /* Light - subtle backgrounds */
--color-alice-blue-200: #becfda; /* Light-medium - borders, dividers */
--color-alice-blue-300: #9db7c8; /* Medium-light - disabled states */
--color-alice-blue-400: #7c9fb6; /* Medium - secondary text */
--color-alice-blue-500: #5c87a3; /* Base - primary brand color */
--color-alice-blue-600: #496c83; /* Medium-dark - hover states */
--color-alice-blue-700: #375162; /* Dark - active states */
--color-alice-blue-800: #253641; /* Darker - headings */
--color-alice-blue-900: #121b21; /* Darkest - body text */
--color-alice-blue-950: #0d1317; /* Almost black - emphasis */
```

### Semantic Colors

```css
/* Status Colors */
--color-success: #10b981; /* Green - paid, accepted, signed */
--color-warning: #f59e0b; /* Amber - pending, draft */
--color-error: #ef4444; /* Red - rejected, overdue, cancelled */
--color-info: #3b82f6; /* Blue - sent, viewed */

/* Background Colors */
--color-background: #ffffff; /* Main background */
--color-background-secondary: #f9fafb; /* Secondary background */
--color-background-tertiary: var(--color-alice-blue-50);

/* Text Colors */
--color-text-primary: var(--color-alice-blue-900);
--color-text-secondary: var(--color-alice-blue-700);
--color-text-tertiary: var(--color-alice-blue-500);
--color-text-disabled: var(--color-alice-blue-300);

/* Border Colors */
--color-border: var(--color-alice-blue-200);
--color-border-hover: var(--color-alice-blue-400);
--color-border-focus: var(--color-alice-blue-600);
```

---

## Typography

### Font Families

```css
/* Primary Font - UI */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Monospace Font - Code, Numbers */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Font Sizes

```css
/* Font Scale */
--text-xs: 0.75rem; /* 12px - captions, labels */
--text-sm: 0.875rem; /* 14px - body small, secondary text */
--text-base: 1rem; /* 16px - body text */
--text-lg: 1.125rem; /* 18px - large body text */
--text-xl: 1.25rem; /* 20px - small headings */
--text-2xl: 1.5rem; /* 24px - section headings */
--text-3xl: 1.875rem; /* 30px - page headings */
--text-4xl: 2.25rem; /* 36px - hero headings */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## Spacing System

Use consistent spacing based on 4px increments:

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
```

---

## Component Patterns

### Status Badges

Use consistent status badges across all modules (proposals, invoices, contracts):

```tsx
// Status Badge Component Pattern
<Badge variant={statusVariant}>
  {statusText}
</Badge>

// Status Variants
draft → variant="secondary" (gray)
sent → variant="info" (blue)
viewed → variant="info" (blue)
pending_signature → variant="warning" (amber)
accepted/signed → variant="success" (green)
paid → variant="success" (green)
rejected → variant="destructive" (red)
overdue → variant="destructive" (red)
cancelled → variant="outline" (gray outline)
```

### Cards

```tsx
// Standard Card Pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>

// Card Spacing
- Padding: var(--space-6) (24px)
- Gap between elements: var(--space-4) (16px)
```

### Tables

```tsx
// Standard Table Pattern
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>

// Table Styling
- Zebra striping: Use for tables with 10+ rows
- Hover state: Always enabled
- Sticky header: Use for tables with 20+ rows
```

### Forms

```tsx
// Standard Form Pattern
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input placeholder="Placeholder" {...field} />
          </FormControl>
          <FormDescription>
            Optional helper text
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>

// Form Spacing
- Gap between fields: var(--space-6) (24px)
- Label margin bottom: var(--space-2) (8px)
- Helper text margin top: var(--space-1) (4px)
```

### Buttons

```tsx
// Button Variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Tertiary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Delete/Cancel</Button>

// Button Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Button States
- Loading: Show spinner, disable interaction
- Disabled: Reduce opacity to 0.5
- Icon buttons: Use ghost variant for toolbar actions
```

---

## Module-Specific Patterns

### F01: Proposal Management

**List View:**

- Display proposals in table format
- Columns: Proposal #, Client, Title, Amount, Status, Date, Actions
- Status badge in dedicated column
- Quick actions: View, Edit, Send, Delete

**Form View:**

- Two-column layout on desktop
- Left: Client details, pricing
- Right: Scope of work (markdown editor)
- Preview button before sending

**Colors:**

- Draft proposals: Gray badge
- Sent proposals: Blue badge
- Accepted proposals: Green badge
- Rejected proposals: Red badge

### F02: Client Management

**List View:**

- Card grid on desktop (3 columns)
- List view on mobile
- Search bar prominent at top
- Quick add button (floating action button on mobile)

**Card Pattern:**

```tsx
<Card>
  <CardHeader>
    <Avatar>{initials}</Avatar>
    <CardTitle>{clientName}</CardTitle>
    <CardDescription>{company}</CardDescription>
  </CardHeader>
  <CardContent>
    <p>{email}</p>
    <p>{phone}</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">View</Button>
    <Button variant="ghost">Edit</Button>
  </CardFooter>
</Card>
```

### F03: Invoice Management

**List View:**

- Table format with financial data
- Right-align all currency amounts
- Use monospace font for numbers
- Highlight overdue invoices (red background tint)

**Invoice Form:**

- Line items editor with add/remove rows
- Real-time calculation display
- Subtotal, tax, total in right sidebar
- Currency selector at top

**Number Formatting:**

```tsx
// Always format currency
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Display: $1,234.56
```

### F04: Dashboard & Analytics

**Layout:**

- Stats cards in 4-column grid (responsive)
- Revenue chart full-width below stats
- Recent activity in sidebar (desktop) or below chart (mobile)

**Stats Card Pattern:**

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
  </CardContent>
</Card>
```

**Chart Colors:**

- Revenue: var(--color-alice-blue-600)
- Expenses: var(--color-alice-blue-300)
- Profit: var(--color-success)

### M05: Contract & E-Signature

**Signature Canvas:**

- White background with light gray border
- Aspect ratio: 3:1 (landscape)
- Clear button in top-right corner
- Pen color: var(--color-alice-blue-900)
- Pen width: 2px

**Signing Page:**

- Contract text in center (max-width: 800px)
- Signature canvas below contract
- "I agree to the terms" checkbox
- Sign button (large, prominent)

### M06: PDF Generation

**Download Button Pattern:**

```tsx
<Button variant="outline" size="sm">
  <Download className="mr-2 h-4 w-4" />
  Download PDF
</Button>

// Loading state
<Button variant="outline" size="sm" disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Generating...
</Button>
```

### M07: Email Reminders

**Reminder Button:**

```tsx
<Button variant="ghost" size="sm">
  <Mail className="mr-2 h-4 w-4" />
  Send Reminder
</Button>

// Disabled state (recently sent)
<Button variant="ghost" size="sm" disabled>
  <Mail className="mr-2 h-4 w-4" />
  Reminder Sent
</Button>
```

---

## Layout Patterns

### Page Layout

```tsx
// Standard Page Layout
<div className="container mx-auto py-8 px-4">
  {/* Page Header */}
  <div className="mb-8">
    <h1 className="text-3xl font-bold">{pageTitle}</h1>
    <p className="text-muted-foreground">{pageDescription}</p>
  </div>

  {/* Page Content */}
  <div className="space-y-6">{/* Content sections */}</div>
</div>
```

### List Page Layout

```tsx
// List Page with Filters
<div className="container mx-auto py-8 px-4">
  {/* Header with Actions */}
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Create New
    </Button>
  </div>

  {/* Filters */}
  <div className="flex gap-4 mb-6">
    <Input placeholder="Search..." className="max-w-sm" />
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>{/* Options */}</SelectContent>
    </Select>
  </div>

  {/* List Content */}
  <Card>
    <CardContent className="p-0">
      <Table>{/* Table content */}</Table>
    </CardContent>
  </Card>
</div>
```

### Form Page Layout

```tsx
// Form Page (Create/Edit)
<div className="container mx-auto py-8 px-4 max-w-4xl">
  {/* Header */}
  <div className="mb-8">
    <h1 className="text-3xl font-bold">{formTitle}</h1>
  </div>

  {/* Form Card */}
  <Card>
    <CardHeader>
      <CardTitle>{sectionTitle}</CardTitle>
    </CardHeader>
    <CardContent>
      <Form {...form}>{/* Form fields */}</Form>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSubmit}>Save</Button>
    </CardFooter>
  </Card>
</div>
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Mobile-First Patterns

**Navigation:**

- Desktop: Sidebar navigation
- Mobile: Bottom tab bar or hamburger menu

**Tables:**

- Desktop: Full table
- Mobile: Card list with key information

**Forms:**

- Desktop: Two-column layout
- Mobile: Single column, full-width inputs

**Dashboard:**

- Desktop: 4-column stats grid
- Tablet: 2-column stats grid
- Mobile: Single column stats

---

## Accessibility

### Color Contrast

- Text on background: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

### Focus States

```css
/* Focus ring for keyboard navigation */
.focus-visible:focus {
  outline: 2px solid var(--color-alice-blue-600);
  outline-offset: 2px;
}
```

### ARIA Labels

```tsx
// Always provide aria-labels for icon-only buttons
<Button variant="ghost" size="icon" aria-label="Delete proposal">
  <Trash2 className="h-4 w-4" />
</Button>

// Use aria-describedby for form hints
<Input
  aria-describedby="email-hint"
  placeholder="Email"
/>
<p id="email-hint" className="text-sm text-muted-foreground">
  We'll never share your email.
</p>
```

---

## Animation & Transitions

### Standard Transitions

```css
/* Default transition for interactive elements */
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover states */
transition: background-color 150ms ease;

/* Loading states */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Loading States

```tsx
// Skeleton loading for lists
<div className="space-y-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="h-20 bg-gray-200 animate-pulse rounded" />
  ))}
</div>

// Spinner for buttons
<Loader2 className="h-4 w-4 animate-spin" />
```

---

## Icons

### Icon Library

Use **Lucide React** icons throughout the application:

```tsx
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Mail,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Check,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';
```

### Icon Sizes

```tsx
// Small (16px) - inline with text
<Icon className="h-4 w-4" />

// Medium (20px) - buttons, cards
<Icon className="h-5 w-5" />

// Large (24px) - page headers
<Icon className="h-6 w-6" />

// Extra large (32px) - empty states
<Icon className="h-8 w-8" />
```

### Icon Colors

```tsx
// Match text color
<Icon className="text-current" />

// Muted (secondary)
<Icon className="text-muted-foreground" />

// Status colors
<Icon className="text-success" />
<Icon className="text-warning" />
<Icon className="text-destructive" />
```

---

## Empty States

```tsx
// Empty State Pattern
<div className="flex flex-col items-center justify-center py-12 text-center">
  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
  <p className="text-muted-foreground mb-6 max-w-sm">
    Get started by creating your first proposal for a client.
  </p>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Create Proposal
  </Button>
</div>
```

---

## Error States

```tsx
// Error Alert Pattern
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    {errorMessage}
  </AlertDescription>
</Alert>

// Inline Form Error
<FormMessage className="text-destructive">
  {error.message}
</FormMessage>
```

---

## Success States

```tsx
// Success Toast Pattern
toast({
  title: 'Success',
  description: 'Proposal sent successfully',
  variant: 'default',
});

// Success Alert
<Alert variant="default" className="border-success bg-success/10">
  <Check className="h-4 w-4 text-success" />
  <AlertTitle className="text-success">Success</AlertTitle>
  <AlertDescription>Your invoice has been created.</AlertDescription>
</Alert>;
```

---

## Best Practices

### Do's ✅

- Use consistent spacing from the spacing system
- Apply status colors consistently across modules
- Use semantic HTML elements
- Provide loading states for all async operations
- Show success feedback after mutations
- Use skeleton loaders for initial page loads
- Format currency consistently
- Right-align numeric data in tables
- Use monospace font for invoice numbers and amounts
- Provide clear error messages
- Use aria-labels for accessibility
- Test on mobile devices

### Don'ts ❌

- Don't use arbitrary spacing values
- Don't mix color systems
- Don't use generic error messages
- Don't forget loading states
- Don't use color alone to convey information
- Don't make clickable areas too small (<44px)
- Don't use low-contrast text
- Don't forget focus states
- Don't use too many font sizes
- Don't overcomplicate layouts

---

## Quick Reference

### Common Class Combinations

```tsx
// Page container
className = 'container mx-auto py-8 px-4';

// Section spacing
className = 'space-y-6';

// Card padding
className = 'p-6';

// Button with icon
className = 'flex items-center gap-2';

// Muted text
className = 'text-sm text-muted-foreground';

// Right-aligned text
className = 'text-right';

// Truncate text
className = 'truncate';

// Center content
className = 'flex items-center justify-center';
```

---

## Resources

- **shadcn/ui Documentation:** https://ui.shadcn.com
- **Tailwind CSS Documentation:** https://tailwindcss.com
- **Lucide Icons:** https://lucide.dev
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

**Last Updated:** December 2024
