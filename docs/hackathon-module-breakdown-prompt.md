# Hackathon Module Breakdown Master Prompt

You are an expert hackathon architect helping a team of 4 full-stack developers break down a problem statement into executable modules for a 24-hour hackathon.

## Team Context
- **Tech Stack:** React + Vercel (frontend), Express + AWS Lambda (backend), DynamoDB Single Table Design, S3, OpenSearch
- **Pre-built Template:** Clerk Auth, RBAC, Admin Dashboard, shadcn/ui components, CDK infrastructure
- **AI Tools:** Each developer has Cursor, Windsurf/Cascade, Claude Sonnet/Opus access
- **Git Workflow:** Feature branches, frequent rebases, designated merge marshal
- **Experience Level:** Senior developers familiar with serverless, single-table DynamoDB patterns

## Project Structure Template
Your workspace should follow this structure for optimal development:

### Backend Folder Structure
```
backend/
├── package.json              # Dependencies: express, aws-sdk, @codegenie/serverless-express
├── tsconfig.json            # TypeScript configuration
├── README.md                # Backend setup instructions
├── src/
│   ├── index.ts             # Main Express app export
│   ├── lambda.ts            # AWS Lambda handler with serverless-express
│   ├── config/
│   │   ├── database.ts      # DynamoDB client setup
│   │   ├── aws.ts          # AWS SDK configuration
│   │   └── environment.ts   # Environment variables validation
│   ├── middleware/
│   │   ├── auth.ts         # Clerk authentication middleware
│   │   ├── cors.ts         # CORS configuration
│   │   ├── validation.ts   # Request validation middleware
│   │   └── errorHandler.ts # Global error handling
│   ├── routes/
│   │   ├── index.ts        # Route aggregation
│   │   ├── auth.ts         # Authentication routes
│   │   ├── admin.ts        # Admin-only routes
│   │   └── [entity].ts     # Entity-specific routes (users, orders, etc.)
│   ├── services/
│   │   ├── database.ts     # DynamoDB service layer
│   │   ├── s3.ts          # S3 file operations
│   │   ├── opensearch.ts   # Search functionality
│   │   └── [entity]Service.ts # Business logic services
│   ├── models/
│   │   ├── base.ts         # Base model interface
│   │   ├── user.ts         # User model/types
│   │   └── [entity].ts     # Entity models/types
│   ├── utils/
│   │   ├── logger.ts       # CloudWatch logging
│   │   ├── validation.ts   # Validation schemas
│   │   ├── response.ts     # API response formatting
│   │   └── dynamodb.ts     # DynamoDB helper functions
│   └── types/
│       ├── api.ts          # API request/response types
│       ├── database.ts     # Database schema types
│       └── global.ts       # Shared types
└── dist/                   # Compiled JavaScript (generated)
```

### Frontend Folder Structure
```
client/
├── package.json             # Dependencies: react, vite, shadcn/ui, clerk
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── index.html              # Main HTML template
├── README.md               # Frontend setup instructions
├── public/
│   ├── favicon.ico
│   └── assets/             # Static assets
├── src/
│   ├── main.tsx            # React app entry point
│   ├── App.tsx             # Main app component with routing
│   ├── index.css           # Global styles
│   ├── components/
│   │   ├── ui/             # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...         # Other shadcn components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   └── Analytics.tsx
│   │   └── [entity]/       # Entity-specific components
│   │       ├── [Entity]List.tsx
│   │       ├── [Entity]Form.tsx
│   │       ├── [Entity]Card.tsx
│   │       └── [Entity]Details.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── [entity]/
│   │       ├── [Entity]ListPage.tsx
│   │       ├── [Entity]CreatePage.tsx
│   │       └── [Entity]EditPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── useApi.ts       # Generic API hook
│   │   ├── useLocalStorage.ts
│   │   └── use[Entity].ts  # Entity-specific hooks
│   ├── services/
│   │   ├── api.ts          # Base API configuration
│   │   ├── auth.ts         # Authentication service
│   │   └── [entity]Api.ts  # Entity API services
│   ├── utils/
│   │   ├── cn.ts           # Utility for className merging
│   │   ├── constants.ts    # App constants
│   │   ├── formatters.ts   # Data formatting utilities
│   │   └── validators.ts   # Form validation
│   ├── types/
│   │   ├── api.ts          # API types (shared with backend)
│   │   ├── auth.ts         # Authentication types
│   │   └── [entity].ts     # Entity types
│   ├── context/
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── ThemeContext.tsx # Theme/UI context
│   ├── lib/
│   │   ├── clerk.ts        # Clerk configuration
│   │   └── utils.ts        # Shared utilities
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── styles/
└── dist/                   # Build output (generated)
```

### Infrastructure Folder Structure
```
infra/
├── package.json             # CDK dependencies
├── tsconfig.json           # TypeScript configuration
├── cdk.json                # CDK configuration
├── README.md               # Infrastructure setup instructions
├── bin/
│   └── infra.ts            # CDK app entry point
├── lib/
│   ├── infra-stack.ts      # Main infrastructure stack
│   ├── constructs/
│   │   ├── lambda.ts       # Lambda function construct
│   │   ├── dynamodb.ts     # DynamoDB table construct
│   │   ├── s3.ts           # S3 bucket construct
│   │   ├── opensearch.ts   # OpenSearch construct
│   │   ├── api-gateway.ts  # API Gateway construct
│   │   └── cloudfront.ts   # CloudFront distribution
│   ├── config/
│   │   ├── development.ts  # Dev environment config
│   │   ├── staging.ts      # Staging environment config
│   │   └── production.ts   # Production environment config
│   └── utils/
│       ├── tags.ts         # Resource tagging utilities
│       └── naming.ts       # Resource naming conventions
├── scripts/
│   ├── deploy.sh           # Deployment scripts
│   ├── destroy.sh          # Cleanup scripts
│   └── setup.sh            # Initial setup
└── cdk.out/                # CDK output (generated)
```

## Your Task
Analyze the problem statement and create a detailed module breakdown that generates individual module files.

### Problem Statement:
[PASTE PROBLEM STATEMENT HERE]

---

## Output Requirements

### 1. Executive Summary
```
**Problem:** [One sentence problem description]
**Solution Approach:** [High-level technical approach]
**Core Features:** [3-5 must-have features]
**Bonus Features:** [2-3 impressive additions]
**Estimated Completion:** [Realistic timeline]
**Risk Level:** [Low/Medium/High with key risks]
```

### 2. Foundation Modules (CRITICAL - Must be first 4 modules)
**REQUIREMENT:** The first 4 modules MUST be foundation modules with ZERO dependencies on each other. Each of the 4 team members should be able to start immediately without waiting for others.

**Foundation Module Rules:**
- Each foundation module must be **Full-Stack** (Frontend + Backend + Database)
- Each foundation module must be **Demo-Ready** (can show working feature in 30 seconds)
- Foundation modules should be derived from the core entities/workflows in the problem statement
- All backend code must be **Lambda-compatible** (stateless, no file system dependencies)
- Use **@codegenie/serverless-express** wrapper for Express routes in Lambda

**Foundation modules should be based on problem statement analysis:**
- **F01:** [Primary Entity Management] (e.g., User Management, Product Catalog)
- **F02:** [Secondary Entity Management] (e.g., Order Processing, Booking System)  
- **F03:** [Core Workflow/Process] (e.g., Search & Discovery, Reporting)
- **F04:** [Admin/Management Features] (e.g., Admin Dashboard, Analytics)

### 3. Module List Overview
Create a table with Foundation modules first (derived from problem statement):

| Module ID | Name | Time Est. | Complexity | Type | Dependencies | Risk |
|-----------|------|-----------|------------|------|--------------|------|
| **F01** | **[Primary Entity] Management** | **1hr** | **Medium** | **Full-stack** | **None** | **Low** |
| **F02** | **[Secondary Entity] System** | **1hr** | **Medium** | **Full-stack** | **None** | **Low** |
| **F03** | **[Core Process] Workflow** | **1hr** | **Medium** | **Full-stack** | **None** | **Low** |
| **F04** | **Admin & [Management Feature]** | **1hr** | **Medium** | **Full-stack** | **None** | **Low** |
| M05 | [Next feature building on F01] | [time] | [complexity] | [type] | F01 | [risk] |
| M06 | [Next feature building on F02] | [time] | [complexity] | [type] | F02 | [risk] |
| ... | ... | ... | ... | ... | ... | ... |

### 4. Dependency Graph
**Foundation Phase (No Dependencies - All Full-Stack & Demo-Ready):**
```
F01 ([Primary Entity])     ──┐
F02 ([Secondary Entity])   ──┤ PARALLEL START
F03 ([Core Process])       ──┤ (Hours 0-4)
F04 ([Admin Features])     ──┘

```

**Core Features Phase (Build on Foundation):**
```
F01 ──> M05 ([Enhanced Primary Features])
F02 ──> M06 ([Enhanced Secondary Features])  
F03 ──> M07 ([Advanced Process Features])
F04 ──> M08 ([Advanced Admin Features])

M05 + M06 ──> M09 (Complex Integration)
M07 + M08 ──> M10 (Advanced Workflows)
```

### 5. Critical Path Timeline
- **Hours 0-4:** Foundation Phase (F01, F02, F03, F04) - **PARALLEL WORK, NO DEPENDENCIES**
- **Hours 4-12:** Core Features (M05, M06, M07, M08) - Build on foundation
- **Hours 12-20:** Advanced Features (M09, M10, M11) - Bonus features
- **Hours 20-24:** Integration, Polish, Demo Prep

### 6. External Services Required
For each external service needed:
```
**Service:** Stripe
**Purpose:** Payment processing
**Setup Time:** 15min
**Free Tier:** Yes (test mode)
**Library:** stripe npm package
**Risk:** Low (test mode always works)
**Backup:** Mock payment success
```

### 7. Team Assignment Strategy

#### Phase 1: Foundation (Hours 0-4) - PARALLEL EXECUTION
```
**Dev 1:** F01 ([Primary Entity] Management) - Full-stack, demo-ready
**Dev 2:** F02 ([Secondary Entity] System) - Full-stack, demo-ready  
**Dev 3:** F03 ([Core Process] Workflow) - Full-stack, demo-ready
**Dev 4:** F04 (Admin & [Management Feature]) - Full-stack, demo-ready
```

#### Phase 2: Core Features (Hours 4-12)
```
**Dev 1:** M05, M08 (Building on F01)
**Dev 2:** M06, M09 (Building on F02)
**Dev 3:** M07, M10 (Building on F03)
**Dev 4:** M11, Integration (Building on F04)
```

#### Phase 3: Advanced Features (Hours 12-20)
```
[Reassign based on progress and remaining features]
```

---

## Lambda Compatibility Requirements

**CRITICAL:** All backend code must be Lambda-compatible:

### Backend Implementation Rules
- **Stateless:** No file system writes, no local caching, no global variables
- **Serverless Express:** Use `@codegenie/serverless-express` wrapper
- **Environment Variables:** All config via process.env (no config files)
- **Database:** DynamoDB only (no local databases or file-based storage)
- **File Uploads:** Direct to S3 using presigned URLs (no local temp files)
- **Logging:** Use console.log/error (CloudWatch compatible)
- **Dependencies:** Only npm packages that work in Lambda environment

### Lambda Handler Pattern
```
// lambda.js - serverless-express wrapper + app export
// app.js - express setup + middleware + routes + module.export
```

---

## Module File Generation

For EACH module, generate a separate markdown file named `module-[ID]-[name].md` with this exact structure:

```markdown
# Module [ID]: [Module Name]

## Overview
**Estimated Time:** [30min/45min/1hr/1.5hr]
**Complexity:** [Simple CRUD/Medium/Complex]
**Type:** [Backend-heavy/Frontend-heavy/Full-stack/Integration]
**Risk Level:** [Low/Medium/High]
**Dependencies:** [List module IDs or "None"]

## Problem Context
[2-3 sentences explaining what this module solves from the original problem statement]

## Technical Requirements

### Backend Tasks (Lambda-Compatible)
- [ ] **Lambda Handler:** Create `lambda.js` with serverless-express wrapper
- [ ] **Express Routes:** `[METHOD] /api/[endpoint]` - [Description]
- [ ] **DynamoDB Pattern:** 
  - PK: `[pattern]` (e.g., `USER#${userId}`)
  - SK: `[pattern]` (e.g., `PROFILE` or `BOOK#${bookId}`)
  - GSI: `[if needed]`
- [ ] **Middleware:** [Auth/validation requirements] - Stateless only
- [ ] **External Integration:** [If any - S3, OpenSearch, APIs] - No file system
- [ ] **Environment Config:** All config via process.env variables

### Frontend Tasks
- [ ] **Pages/Components:** [List specific components to build]
- [ ] **shadcn Components:** [button, form, table, dialog, etc.]
- [ ] **API Integration:** [Which endpoints to call]
- [ ] **State Management:** [Local state, context, or external store]
- [ ] **Routing:** [New routes to add]

### Database Schema (Single Table)
```
pk: [ENTITY]#[id] | sk: [TYPE] | gsi1pk: [grouping] | gsi1sk: [sorting]
+ entity-specific fields with types and descriptions
```

## External Services (if any)
### [Service Name]
- **Purpose:** [Why needed]
- **Setup Steps:**
  1. [Step 1]
  2. [Step 2]
- **Environment Variables:** `SERVICE_API_KEY, SERVICE_ENDPOINT, etc.`
- **NPM Package:** `npm install [package-name]`
- **Code Pattern:** `// Basic integration pattern with error handling`

## Implementation Guide

### Step 1: Backend Implementation (Lambda-Compatible)
**File Structure:**
```
backend/src/
├── routes/[entity].ts        # RESTful endpoints for entity
├── services/[entity]Service.ts # Business logic and DynamoDB operations
├── models/[entity].ts        # TypeScript interfaces and types
└── utils/[entity]Utils.ts    # Entity-specific utility functions
```

**Implementation Pattern:**
```typescript
// routes/[entity].ts - Express routes with validation
// services/[entity]Service.ts - DynamoDB operations using DocumentClient
// models/[entity].ts - TypeScript types and validation schemas
```

### Step 2: Frontend Implementation
**File Structure:**
```
client/src/
├── components/[entity]/
│   ├── [Entity]List.tsx      # List view with shadcn table
│   ├── [Entity]Form.tsx      # Create/edit form with shadcn components
│   ├── [Entity]Card.tsx      # Card component for grid views
│   └── [Entity]Details.tsx   # Detail view component
├── pages/[entity]/
│   ├── [Entity]ListPage.tsx  # List page wrapper
│   ├── [Entity]CreatePage.tsx # Create page wrapper
│   └── [Entity]EditPage.tsx  # Edit page wrapper
├── hooks/
│   └── use[Entity].ts        # API integration hooks
├── services/
│   └── [entity]Api.ts        # API service functions
└── types/
    └── [entity].ts           # Frontend-specific types
```

**Implementation Pattern:**
```typescript
// hooks/use[Entity].ts - React Query or SWR for data fetching
// services/[entity]Api.ts - Axios/fetch wrapper with error handling
// components/[entity]/ - Reusable UI components with TypeScript
```

### Step 3: Infrastructure Updates (if needed)
**File Structure:**
```
infra/lib/constructs/
├── [entity]-lambda.ts        # Lambda function for entity operations
└── [entity]-table.ts         # DynamoDB table updates or GSI additions
```

### Step 3: Integration
- [ ] Test API endpoint with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify data flow end-to-end

## LLM Prompts for Implementation

### Backend Prompts (Lambda-Compatible)
1. **Lambda Handler Creation:**
   ```
   Create a Lambda-compatible Express.js application for [specific functionality] using @codegenie/serverless-express wrapper. 
   Include DynamoDB single table design with PK pattern: [pattern], SK pattern: [pattern]. 
   Make it stateless with no file system dependencies. Include proper error handling and validation.
   ```

2. **Database Operations:**
   ```
   Write DynamoDB DocumentClient operations for [specific use case] using single table design and AWS SDK v3.
   Make it Lambda-compatible (stateless, no local caching). Handle [specific edge cases]. 
   Use environment variables for configuration. Return proper error responses.
   ```

### Frontend Prompts
1. **Component Creation:**
   ```
   Create a React component using shadcn/ui for [specific functionality].
   Include [specific features]. Use TypeScript and proper error handling.
   ```

2. **API Integration:**
   ```
   Create API integration hooks for [specific endpoints] using fetch/axios.
   Include loading states, error handling, and TypeScript types.
   ```

## Acceptance Criteria
- [ ] [Specific, testable requirement 1]
- [ ] [Specific, testable requirement 2]
- [ ] [Specific, testable requirement 3]
- [ ] **Demo Ready:** Can demonstrate complete feature (frontend + backend) in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend connects to database
- [ ] **Lambda Compatible:** Backend code works in serverless environment
- [ ] **Error Handling:** Graceful failure modes implemented
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist
- [ ] **Backend:** API returns expected responses
- [ ] **Frontend:** UI renders correctly and handles user interactions
- [ ] **Integration:** End-to-end flow works as expected
- [ ] **Edge Cases:** Error scenarios handled gracefully
- [ ] **Performance:** Acceptable load times (<2s for API calls)

## Merge Preparation
- [ ] **Code Review:** Self-review completed
- [ ] **Conflicts:** Checked for potential merge conflicts
- [ ] **Documentation:** Updated any shared types/interfaces
- [ ] **Testing:** Manual testing completed
- [ ] **Commit Message:** Clear, descriptive commit message

## Troubleshooting Guide
### Common Issues
1. **[Likely Issue 1]**
   - **Symptom:** [What you'll see]
   - **Solution:** [How to fix]

2. **[Likely Issue 2]**
   - **Symptom:** [What you'll see]
   - **Solution:** [How to fix]

### Debug Commands
```
npm run dev  # Start local development
curl -X GET http://localhost:3000/api/[endpoint]  # Test API
```

## Related Modules
- **Depends On:** [List modules this depends on]
- **Enables:** [List modules that depend on this]
- **Conflicts With:** [Any modules that might conflict]

---

*Generated for Hackathon: [Event Name] | Team: [Team Name] | Date: [Date]*
```

## Quality Guidelines

### Module Sizing Rules
- **30-45min modules:** Simple CRUD operations, basic UI components
- **1hr modules:** Complex business logic, external API integration
- **1.5hr modules:** Multi-step workflows, complex UI with state management
- **If >1.5hr:** Break into sub-modules
- **If <20min:** Combine with related module

### Foundation Module Requirements (CRITICAL)
- **F01-F04 MUST have zero dependencies on each other**
- **Each foundation module must be Full-Stack (Frontend + Backend + Database)**
- **Each foundation module must be Demo-Ready (working end-to-end feature)**
- **Foundation modules derived from problem statement entities/workflows**
- **All backend code must be Lambda-compatible (stateless, serverless-express)**
- **All 4 developers must be able to start simultaneously**

### Dependency Management
- **Foundation modules (F01-F04): ZERO dependencies**
- **Core modules (M05+): Maximum 2 dependencies per module**
- **No circular dependencies**
- **Critical path modules should have minimal dependencies**

### Risk Assessment Criteria
- **Low Risk:** Standard CRUD, well-defined scope, no external deps
- **Medium Risk:** External API integration, complex business logic
- **High Risk:** Real-time features, file processing, payment integration

### External Service Guidelines
- **Always prefer real integrations over mocks**
- **Must have free tier or test mode**
- **Setup time must be <30min**
- **Must have fallback/graceful degradation**

## Final Deliverables
1. **Module Overview Table** (for project planning)
2. **Individual Module Files** (one per module, ready for development)
3. **Dependency Graph** (visual representation)
4. **Team Assignment Recommendations**
5. **Critical Path Timeline**
6. **External Services Setup Guide**

---

Now analyze the provided problem statement and generate the complete module breakdown with individual module files.