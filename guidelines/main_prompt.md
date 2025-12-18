# Hackathon Module Breakdown Master Prompt

You are an expert hackathon architect helping a team of 4 full-stack developers break down a problem statement into executable modules for a 24-hour hackathon.

## CRITICAL Hackathon Constraints (MUST FOLLOW)

### 1. Role Identification & RBAC Setup (FIRST STEP)

**REQUIREMENT:** Before designing any modules, analyze the problem statement to identify ALL user roles.

- Extract all user types mentioned (e.g., admin, teacher, student, parent, manager, employee)
- Update `backend/src/config/permissions.ts` immediately:
  - Add roles to `Role` type: `export type Role = 'user' | 'admin' | 'teacher' | 'student' | ...`
  - Configure `USER_MODULE_ACCESS` for each role's permissions
  - Update `ALL_MODULES` list if new module categories needed
- This MUST be done before any module implementation begins

### 2. AWS Client Wrappers (MANDATORY)

**REQUIREMENT:** NEVER use AWS SDK directly. Always use existing client wrappers.

**Available Wrappers** (in `backend/src/shared/clients/`):

- `dynamodb.ts` - DynamoDB operations (get, put, update, delete, query, scan, batch, transactions)
- `s3.ts` - S3 file operations (upload, download, presigned URLs)
- `ses.ts` - Email service (transactional emails)
- `sqs.ts` - Message queue operations
- `gemini.ts` - Google Gemini AI integration

**Usage Pattern:**

```typescript
// CORRECT - Use wrapper
import { dynamodb } from '../../../shared/clients/dynamodb';
const result = await dynamodb.get({ PK: 'USER#123', SK: 'PROFILE' });

// WRONG - Direct AWS SDK
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // ❌ NEVER DO THIS
```

### 3. Testing Policy

**REQUIREMENT:** Skip unit tests during hackathon - focus on working features.

- DO NOT write Jest tests for handlers or services
- DO manual testing with Postman/curl
- DO test frontend in browser
- Time is limited - prioritize demo-ready features

### 4. Documentation Policy

**REQUIREMENT:** Module planning vs implementation have different documentation rules.

**Stage 1 - Module Planning (Initial Breakdown):**

- ✅ **DO** generate markdown files for module planning (one .md file per module)
- ✅ **DO** create structured module specifications for team coordination
- ✅ **DO** output module breakdown files for reference
- Purpose: Planning, coordination, and task assignment

**Stage 2 - Module Implementation (Individual Module Development):**

- ❌ **DO NOT** create any markdown files during implementation
- ❌ **DO NOT** create README files for modules
- ❌ **DO NOT** create documentation files
- ✅ **DO** focus exclusively on code files (.ts, .tsx, .yml, etc.)
- Purpose: Speed - write code, not documentation

**Example Flow:**

```
Day 0 (Planning): Problem Statement → Generate module-F01-user-mgmt.md, module-F02-classes.md, etc.
Day 1 (Implementation): Developer reads module-F01-user-mgmt.md → Writes ONLY code files (handlers, services, components)
```

### 5. Script Policy

**REQUIREMENT:** No temporary/utility scripts should be created.

- DO NOT create setup scripts
- DO NOT create data seeding scripts
- DO NOT create test helper scripts
- Use existing deploy.sh and infrastructure only

### 6. Pre-Implementation Study (MANDATORY)

**REQUIREMENT:** Before implementing ANY module, study the existing codebase and guidelines.

**Study Order:**

1. **Read `guidelines/` folder** (MUST READ BEFORE CODING):
   - `QUICK_REFERENCE.md` - Quick patterns and examples
   - `CODING_GUIDELINES.md` - Code standards and best practices
   - `API_DESIGN.md` - API endpoint design patterns
   - `INFRASTRUCTURE.md` - Deployment and AWS setup
   - `GIT_WORKFLOW.md` - Git branching and commit conventions
   - `CHEAT_SHEET.md` - Common commands and shortcuts
   - `README.md` - Guidelines overview

2. **Study existing codebase patterns**:
   - `backend/src/modules/users/` - Example CRUD module with Clerk integration
   - `backend/src/modules/demo/` - Example RBAC-protected endpoints
   - `backend/src/modules/websocket/` - Real-time communication example
   - `backend/src/shared/` - Reusable utilities and middleware
   - `backend/src/config/permissions.ts` - RBAC configuration pattern
   - `client/src/components/admin/` - Complex admin UI patterns
   - `client/src/hooks/useUsers.ts` - React Query integration example
   - `client/src/services/apiClient.ts` - API client with auth

3. **Understand the architecture**:
   - Lambda handler pattern (handler → service → client)
   - RBAC middleware usage (`withRbac`, `withRbacOwn`)
   - Response format (`successResponse`, `commonErrors`)
   - Type safety (shared types, event types)
   - Frontend hooks pattern (React Query for API state)
   - shadcn/ui component usage

**Why This Matters:**

- Maintain consistency with existing patterns
- Avoid reinventing already-solved problems
- Follow established conventions
- Reuse existing components and utilities
- Understand project architecture before adding new code

**Time Investment:** 15-20 minutes of study saves hours of refactoring

---

## Team Context

- **Tech Stack:** React + Vite + Vercel (frontend), Serverless Framework + AWS Lambda (backend), Clerk API (user management)

- **Backend Pattern:** Individual Lambda functions per endpoint (no Express), API Gateway v2 with native JWT authorizer, Service layer pattern

- **Pre-built Template:** Clerk Auth, RBAC middleware (`withRbac`, `withRbacOwn`), Admin Dashboard, shadcn/ui components, custom hooks (`useApi`, `useAsync`, `useLocalStorage`, `useDebounce`)

- **AI Tools:** Each developer has Cursor, Windsurf/Cascade, Claude Sonnet/Opus access

- **Git Workflow:** Feature branches, frequent rebases, designated merge marshal

- **Experience Level:** Senior developers familiar with serverless Lambda patterns, React hooks, and TypeScript

## Project Structure Template

Your workspace should follow this structure for optimal development:

### Backend Folder Structure

```

backend/

├── package.json              # Dependencies: @clerk/backend, aws-sdk

├── tsconfig.json            # TypeScript configuration

├── serverless.yml           # Main Serverless Framework config

├── deploy.sh                # Deployment script with AWS role assumption

├── README.md                # Backend setup instructions

├── src/

│   ├── config/

│   │   ├── permissions.ts   # RBAC configuration with accesscontrol

│   │   └── environment.ts   # Environment variables validation

│   ├── shared/

│   │   ├── types.ts         # Shared TypeScript types

│   │   ├── response.ts      # Response helpers (successResponse, commonErrors)

│   │   ├── logger.ts        # Logging utility

│   │   └── auth/

│   │       ├── rbacMiddleware.ts  # withRbac, withRbacOwn wrappers

│   │       └── clerkAuth.ts       # Clerk authentication helpers

│   ├── modules/

│   │   └── [domain]/        # Domain module (e.g., users, demo, websocket)

│   │       ├── handlers/        # Lambda handler functions

│   │       │   ├── listEntity.ts    # GET /api/entity

│   │       │   ├── getEntity.ts     # GET /api/entity/:id

│   │       │   ├── createEntity.ts  # POST /api/entity

│   │       │   ├── updateEntity.ts  # PUT /api/entity/:id

│   │       │   └── deleteEntity.ts  # DELETE /api/entity/:id

│   │       ├── functions/       # Serverless function definitions

│   │       │   ├── listEntity.yml   # Function config for listEntity

│   │       │   ├── getEntity.yml    # Function config for getEntity

│   │       │   └── ...              # One YAML per handler

│   │       ├── services/        # Business logic services

│   │       │   └── EntityService.ts # Service class (e.g., ClerkUserService)

│   │       └── types.ts         # Domain-specific TypeScript types

│   └── wrappers/            # Optional AWS service wrappers

│       ├── dynamodb.ts      # DynamoDB operations wrapper

│       ├── s3.ts           # S3 operations wrapper

│       └── sqs.ts          # SQS operations wrapper

└── tests/

    ├── shared/              # Tests for shared utilities

    └── modules/

        └── [domain]/

            └── handlers/    # Tests for Lambda handlers

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

│   │   ├── useApi.ts       # API calls with Clerk auth

│   │   ├── useAsync.ts     # Async operation management

│   │   ├── useAsyncCallback.ts # Async callback wrapper

│   │   ├── useLocalStorage.ts  # Persistent state

│   │   ├── useDebounce.ts  # Input debouncing

│   │   └── index.ts        # Hook exports

│   ├── services/

│   │   └── apiClient.ts    # Singleton API client with Clerk auth

│   ├── utils/

│   │   ├── cn.ts           # Utility for className merging

│   │   ├── constants.ts    # App constants

│   │   ├── formatters.ts   # Data formatting utilities

│   │   └── validators.ts   # Form validation

│   ├── types/

│   │   ├── user.ts         # User types (matching backend)

│   │   └── [entity].ts     # Entity types

│   └── assets/

│       ├── images/

│       ├── icons/

│       └── styles/

└── dist/                   # Build output (generated)

```

### Deployment Structure

```

backend/

├── deploy.sh                    # Deployment script with AWS role assumption

├── serverless.yml               # Main Serverless Framework configuration

├── .env                         # Environment variables (not committed)

├── .env.example                 # Example environment variables

├── scripts/

│   └── update-cloudflare-dns.sh # DNS update script (optional)

└── .serverless/                 # Serverless Framework output (generated)

```

**Deployment Commands:**

```bash

# Deploy to specific stage

cd backend

npm install

./deploy.sh dev-heet  # or dev-dhruv, dev-tirth, dev-pooja, test, prod

# Deploy without custom domain

CUSTOM_DOMAIN_ENABLED=false ./deploy.sh dev-heet

# Remove deployment

npx serverless remove --stage dev-heet

```

## Pre-built Features Available

Your template already includes these working features:

### Backend (Already Implemented)

- ✅ **Clerk Authentication:** JWT validation via API Gateway authorizer

- ✅ **RBAC Middleware:** `withRbac()`, `withRbacOwn()`, `withWebSocketRbac()` wrappers

- ✅ **Response Helpers:** `successResponse()`, `errorResponse()`, `commonErrors.*`, `handleAsyncError()`

- ✅ **User Management Module:** Full CRUD for users via Clerk API

- List users, get user details, invite user, change role, ban/unban, delete

- ✅ **Demo Module:** Example handlers showing RBAC patterns

- ✅ **WebSocket Module:** Real-time communication with authentication

- ✅ **Type Definitions:** `AuthenticatedAPIGatewayEvent`, `AuthenticatedWebSocketEvent`

- ✅ **Logger Utility:** Structured logging for CloudWatch

- ✅ **Environment Config:** Validation and type-safe environment variables

### Frontend (Already Implemented)

- ✅ **Clerk Auth Integration:** Sign in, sign up, user management

- ✅ **Custom Hooks:** `useApi`, `useAsync`, `useAsyncCallback`, `useLocalStorage`, `useDebounce`

- ✅ **shadcn/ui Components:** Button, Card, Table, Dialog, Form, and more

- ✅ **Admin Dashboard:** User management interface with role changes, bans, invitations

- ✅ **Protected Routes:** `ProtectedRoute` component for auth-required pages

- ✅ **WebSocket Demo:** Real-time messaging example

- ✅ **API Client:** Singleton with Clerk token injection

### Infrastructure (Already Configured)

- ✅ **Serverless Framework:** Multi-stage deployment (dev-\*, test, prod)

- ✅ **API Gateway v2:** HTTP API with native JWT authorizer

- ✅ **WebSocket API:** Real-time communication support

- ✅ **Custom Domain:** Optional CloudFlare DNS integration

- ✅ **Environment Management:** Per-stage configuration

- ✅ **TypeScript:** Full type safety across backend and frontend

- ✅ **Testing Setup:** Jest configured for backend unit tests

**You can use these as reference implementations when building new modules!**

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

**User Roles Identified:** [List all user roles from problem statement - e.g., admin, teacher, student, parent]

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

- **CRITICAL:** Identify all user roles from problem statement and update `config/permissions.ts` accordingly

- **CRITICAL:** Use existing client wrappers (`shared/clients/*`) - NEVER use AWS SDK directly

**Foundation modules should be based on problem statement analysis:**

- **F01:** [Primary Entity Management] (e.g., User Management, Product Catalog, Inventory)

- **F02:** [Secondary Entity Management] (e.g., Order Processing, Booking System, Transactions)

- **F03:** [Core Workflow/Process] (e.g., Search & Discovery, Reporting, Notifications)

- **F04:** [Admin/Management Features] (e.g., Admin Dashboard, Analytics, Settings)

**Each foundation module MUST include:**

- Backend: 2-3 Lambda handlers (list, get, create minimum)

- Frontend: List page + Form component + API integration

- Service: Business logic in service class

- Types: Shared TypeScript types

- RBAC: Permission configuration for the module

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

## Serverless Lambda Pattern Requirements

**CRITICAL:** All backend code must be Lambda-compatible:

### Backend Implementation Rules

- **Individual Functions:** One Lambda handler per endpoint (no Express routing)

- **Handler Pattern:** Export `handler` function wrapped with `withRbac()` or `withRbacOwn()`

- **YAML Config:** Each handler has corresponding `.yml` file in `functions/` folder

- **Stateless:** No file system writes, no local caching, no global state

- **Environment Variables:** All config via process.env (loaded from .env)

- **Response Helpers:** Use `successResponse()`, `handleAsyncError()`, `commonErrors.*`

- **Type Safety:** Use `AuthenticatedAPIGatewayEvent` type for events

- **Logging:** Use console.log/info/warn/error (CloudWatch compatible)

- **Service Layer:** Business logic in service classes (e.g., `ClerkUserService`, `EntityService`)

- **Error Handling:** All handlers must use try-catch with `handleAsyncError()`

### Lambda Handler Pattern

```typescript
// handlers/listEntity.ts

import { APIGatewayProxyResultV2 } from 'aws-lambda';

import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';

import { withRbac } from '../../../shared/auth/rbacMiddleware';

import { successResponse, handleAsyncError } from '../../../shared/response';

import { EntityService } from '../services/EntityService';

const entityService = new EntityService();

/**

 * Base handler for listing entities

*/

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse query parameters

    const query = event.queryStringParameters || {};

    // Call service layer

    const result = await entityService.listEntities(query);

    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**

 * List entities handler

 * @route GET /api/entities

*/

export const handler = withRbac(baseHandler, 'moduleName', 'read');
```

### Function YAML Pattern

```yaml
# functions/listEntity.yml

listEntity:

handler: src/modules/domain/handlers/listEntity.handler

events:
  - httpApi:

path: /api/entities

method: GET

authorizer:

name: clerkJwtAuthorizer

# Optional: Override memory/timeout for specific function

# memorySize: 512

# timeout: 10
```

### WebSocket Handler Pattern (Optional)

```typescript
// handlers/connect.ts

import { APIGatewayProxyResultV2 } from 'aws-lambda';

import { AuthenticatedWebSocketEvent } from '../../../shared/types';

import { withWebSocketRbac } from '../../../shared/auth/rbacMiddleware';

import { successResponse, handleAsyncError } from '../../../shared/response';

const baseHandler = async (
  event: AuthenticatedWebSocketEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const connectionId = event.requestContext.connectionId;

    // Handle WebSocket connection

    return successResponse({ connectionId });
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withWebSocketRbac(baseHandler, 'websocket', 'create');
```

### WebSocket Function YAML Pattern

```yaml

# functions/websocket.yml

websocketConnect:

handler: src/modules/websocket/handlers/connect.handler

events:

    - websocket:

route: $connect

# WebSocket connections are authenticated via query string

# ?token=<clerk-jwt-token>

websocketDisconnect:

handler: src/modules/websocket/handlers/disconnect.handler

events:

    - websocket:

route: $disconnect

websocketMessage:

handler: src/modules/websocket/handlers/sendMessage.handler

events:

    - websocket:

route: sendMessage

```

---

## Module Planning Output Format (Stage 1 - Initial Breakdown)

**PURPOSE:** Generate module specification files for team coordination and planning.

**WHEN TO USE:** When breaking down the initial problem statement into modules.

**OUTPUT:** Generate one markdown file per module named `module-[ID]-[name].md`

For EACH module, generate a separate markdown file with this structure:

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

### Backend Tasks

- [ ] **Handler File:** Create `handlers/[action]Entity.ts` with typed handler

- Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`

- Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'module', 'action')`

- Always use try-catch with `handleAsyncError(error)` in catch block

- [ ] **Function Config:** Create `functions/[action]Entity.yml` with httpApi event

- Specify handler path: `src/modules/[domain]/handlers/[action]Entity.handler`

- Define HTTP method and path

- Add authorizer: `clerkJwtAuthorizer` (for protected routes)

- [ ] **Service Layer:** Business logic in `services/EntityService.ts`

- Create service class with methods for business logic

- Instantiate service at module level: `const entityService = new EntityService()`

- Keep handlers thin - delegate to service methods

- [ ] **Type Definitions:** Add types to `types.ts` for requests/responses

- Request query/body types

- Response data types

- Service method parameter types

- [ ] **RBAC Configuration:** Update `config/permissions.ts` with identified roles from problem statement
  - Add role to Role type if new: `export type Role = 'user' | 'admin' | 'teacher' | 'student' | ...`

  - Configure permissions for each role in USER_MODULE_ACCESS or admin grants

- [ ] **AWS Service Integration:** **ALWAYS use shared/clients/\* wrappers**
  - DynamoDB: `import { dynamodb, DynamoDB } from '../../../shared/clients/dynamodb'`

  - S3: `import { s3Client } from '../../../shared/clients/s3'`

  - SES: `import { sesClient } from '../../../shared/clients/ses'`

  - SQS: `import { sqsClient } from '../../../shared/clients/sqs'`

  - Gemini AI: `import { geminiClient } from '../../../shared/clients/gemini'`

  - Clerk API: Direct import OK: `import { createClerkClient } from '@clerk/backend'`

  - **NEVER import @aws-sdk packages directly in handlers or services**

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

### Frontend Tasks

- [ ] **Pages/Components:** [List specific components to build]

- [ ] **shadcn Components:** [button, form, table, dialog, etc.]

- [ ] **API Integration:** [Which endpoints to call]

- [ ] **State Management:** [Local state, context, or external store]

- [ ] **Routing:** [New routes to add]

### Database Schema (Single Table)
```

pk: [ENTITY]#[id] | sk: [TYPE] | gsi1pk: [grouping] | gsi1sk: [sorting]

- entity-specific fields with types and descriptions

````

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

### Step 0: Study Phase (MANDATORY - Do This First)

**BEFORE writing any code, spend 15-20 minutes studying:**

1. **Review Guidelines** (in order of importance):
   ```bash
   # Read these files in the guidelines/ folder:
   cat guidelines/QUICK_REFERENCE.md      # Quick patterns
   cat guidelines/CODING_GUIDELINES.md    # Code standards
   cat guidelines/API_DESIGN.md           # API patterns
   cat guidelines/GIT_WORKFLOW.md         # Git conventions
````

2. **Study Similar Existing Modules:**

   ```bash
   # Backend patterns:
   ls -la backend/src/modules/users/handlers/    # Example CRUD handlers
   cat backend/src/modules/users/services/ClerkUserService.ts
   cat backend/src/config/permissions.ts         # RBAC configuration

   # Frontend patterns:
   ls -la client/src/components/admin/           # Admin UI components
   cat client/src/hooks/useUsers.ts              # React Query hooks
   cat client/src/services/apiClient.ts          # API client setup
   ```

3. **Identify Reusable Patterns:**
   - Lambda handler structure (see `backend/src/modules/users/handlers/listUsers.ts`)
   - Service layer pattern (see `backend/src/modules/users/services/ClerkUserService.ts`)
   - RBAC middleware usage (see any handler with `withRbac`)
   - React Query hooks (see `client/src/hooks/useUsers.ts`)
   - shadcn/ui components (see `client/src/components/admin/`)

**What to Look For:**

- How are handlers structured?
- How does RBAC middleware work?
- What client wrappers are available?
- How are types shared between backend/frontend?
- What shadcn components exist?
- How is error handling done?

**Time Saved:** 15 min study → Saves 2-3 hours of trial and error

**CRITICAL REMINDER:** When implementing a module, DO NOT create markdown files. Only create code files (.ts, .tsx, .yml, etc.)

---

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```

backend/src/modules/[domain]/

├── handlers/

│   ├── listEntity.ts         # GET /api/entities

│   ├── getEntity.ts          # GET /api/entities/:id

│   ├── createEntity.ts       # POST /api/entities

│   ├── updateEntity.ts       # PUT /api/entities/:id

│   └── deleteEntity.ts       # DELETE /api/entities/:id

├── functions/

│   ├── listEntity.yml        # Serverless function config

│   ├── getEntity.yml

│   ├── createEntity.yml

│   ├── updateEntity.yml

│   └── deleteEntity.yml

├── services/

│   └── EntityService.ts      # Business logic and data operations

└── types.ts                  # Domain-specific TypeScript types

```

**Implementation Pattern:**

```typescript
// handlers/[action]Entity.ts - Lambda handler with RBAC wrapper

// services/EntityService.ts - Business logic (Clerk API, DynamoDB, S3, etc.)

// types.ts - TypeScript interfaces for requests/responses

// functions/[action]Entity.yml - Serverless function configuration
```

**Service Layer Example:**

```typescript
// services/EntityService.ts

export class EntityService {
  async listEntities(query: ListQuery): Promise<EntityListResponse> {
    // Business logic here
    // Call external APIs, databases, etc.
  }

  async getEntity(id: string): Promise<Entity> {
    // Fetch single entity
  }

  async createEntity(data: CreateEntityRequest): Promise<Entity> {
    // Create new entity
  }
}
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

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
# Add function imports at the end of serverless.yml

functions:
  # ... existing functions ...

  # Import new module functions

  - ${file(src/modules/[domain]/functions/listEntity.yml)}

  - ${file(src/modules/[domain]/functions/getEntity.yml)}

  - ${file(src/modules/[domain]/functions/createEntity.yml)}
```

**Update RBAC permissions (if new module):**

```typescript
// config/permissions.ts

ac.grant('user')

  .readOwn('[moduleName]')

  .createOwn('[moduleName]')

  .updateOwn('[moduleName]')

  .deleteOwn('[moduleName]');

ac.grant('admin')

  .extend('user')

  .readAny('[moduleName]')

  .createAny('[moduleName]')

  .updateAny('[moduleName]')

  .deleteAny('[moduleName]');
```

### Step 4: Integration

- [ ] Test API endpoint with Postman/curl

- [ ] Connect frontend to backend

- [ ] Verify data flow end-to-end

## LLM Prompts for Implementation

**IMPORTANT - TWO DIFFERENT USE CASES:**

**📅 Use Case 1: Breaking Down Problem Statement (Stage 1)**

- **Input:** Hackathon problem statement
- **Output:** Multiple .md files (one per module)
- **Example:** "Generate module breakdown for this problem statement: [paste problem]"

**🛠️ Use Case 2: Implementing a Specific Module (Stage 2)**

- **Input:** One module's .md file
- **Output:** ONLY code files (.ts, .tsx, .yml) - NO .md files
- **Example:** "Implement module-F01-user-management.md - generate handler, service, and component files"

---

**For Stage 2 Implementation - Instruct your AI:**

```
You are implementing a specific module. Before starting:
1. Study backend/src/modules/users/ for handler patterns
2. Review guidelines/CODING_GUIDELINES.md for code standards
3. Check guidelines/API_DESIGN.md for API conventions
4. Follow the exact patterns you see in existing code

IMPORTANT: Generate ONLY code files (.ts, .tsx, .yml).
DO NOT create any markdown files, README files, or documentation.
Focus exclusively on implementation code.
```

---

### Backend Prompts (Lambda-Compatible)

1. **Lambda Handler Creation:**

```

Create a Lambda handler for [specific functionality] following this pattern:

- Import: AuthenticatedAPIGatewayEvent, withRbac, successResponse, handleAsyncError

- Create baseHandler async function with try-catch

- Parse query/body parameters from event

- Call service layer method

- Return successResponse with data

- Catch errors with handleAsyncError

- Export handler wrapped with withRbac(baseHandler, 'moduleName', 'action')

- Add JSDoc comments for route and description

```

2. **Service Layer Creation:**

```

Create a service class [EntityService] for [specific functionality]:

- Export class with methods for business logic

- Use Clerk API / DynamoDB / S3 / external APIs as needed

- Make it stateless (no instance variables for state)

- Use environment variables for configuration

- Throw errors for error cases (handler will catch)

- Return typed responses matching types.ts

```

3. **Function YAML Creation:**

```

Create serverless function config for [action]Entity:

- Function name: [action]Entity

- Handler: src/modules/[domain]/handlers/[action]Entity.handler

- HTTP API event with path /api/[entities] and method [GET/POST/PUT/DELETE]

- Authorizer: clerkJwtAuthorizer (for protected routes)

- Optional: memorySize and timeout overrides if needed

```

### Frontend Prompts

1. **Component Creation:**

```

Create a React component using shadcn/ui for [specific functionality]:

- Use TypeScript with proper types

- Import shadcn components: Button, Card, Table, Dialog, Form, etc.

- Use useApi hook for API calls with loading/error states

- Handle loading state with skeleton or spinner

- Display errors with toast or error message

- Include proper accessibility attributes

```

2. **API Integration with useApi Hook:**

```

Create API integration for [entity] using the useApi hook:

- Import: useApi from '@/hooks'

- Destructure: { data, loading, error, get, post, put, delete }

- Call API methods: await get('/entities'), await post('/entities', data)

- Handle loading state in UI

- Display error messages

- Refresh data after mutations

- Use useEffect for initial data fetch

```

3. **List Page with Table:**

```

Create a list page for [entities] with shadcn Table:

- Use useApi to fetch data

- Display loading skeleton while fetching

- Render Table with columns: [list columns]

- Add action buttons (Edit, Delete) in last column

- Include search/filter functionality

- Add "Create New" button linking to form page

- Handle pagination if needed

```

4. **Form Component:**

```

Create a form component for [entity] using shadcn Form:

- Use react-hook-form with zod validation

- Import Form components from shadcn/ui

- Define zod schema for validation

- Use useApi for POST/PUT requests

- Handle loading state on submit button

- Display validation errors

- Redirect or show success message after save

- Support both create and edit modes

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

- [ ] **Backend Unit Tests:** **SKIP FOR HACKATHON** (Time constraint - focus on working features)

- [ ] **Manual API Testing:**

- Test with curl or Postman

- Verify authentication with Clerk token

- Check response format matches ApiResponse type

- Test error cases (401, 403, 404, 500)

- [ ] **Frontend Testing:**

- Manual testing in browser

- Test loading states

- Test error handling

- Test form validation

- Test responsive design on mobile

- [ ] **Integration:** End-to-end flow works as expected

- [ ] **Edge Cases:** Error scenarios handled gracefully

- [ ] **Performance:** Acceptable load times (<2s for API calls)

## Deployment Checklist

- [ ] **Code Review:** Self-review completed

- [ ] **Serverless Config:** Added function imports to serverless.yml

- [ ] **RBAC Config:** Updated permissions.ts if new module added

- [ ] **Types:** Exported types from module's types.ts for frontend use

- [ ] **Testing:** Manual testing completed

- [ ] **Documentation:** Updated any shared types/interfaces

## Troubleshooting Guide

### Common Issues

1. **401 Unauthorized Error**

- **Symptom:** API returns 401 even with valid Clerk token

- **Solution:**

- Check CLERK_ISSUER_URL in backend/.env matches your Clerk instance

- Verify JWT template in Clerk includes custom claims (role, email, userid)

- Ensure token is passed in Authorization header: `Bearer <token>`

- Check token hasn't expired

2. **403 Forbidden Error**

- **Symptom:** API returns 403 "You don't have permission"

- **Solution:**

- Check user's role in Clerk public_metadata: `{ "role": "user" }` or `{ "role": "admin" }`

- Verify RBAC permissions in config/permissions.ts include the module and action

- Check handler uses correct withRbac wrapper with right module name and action

3. **Handler Not Found / 502 Error**

- **Symptom:** API Gateway returns 502 or "Handler not found"

- **Solution:**

- Verify handler path in YAML matches actual file location

- Check handler exports `handler` function: `export const handler = ...`

- Run `npm run build` to check for TypeScript errors

- Redeploy: `./deploy.sh <stage>`

4. **CORS Error in Browser**

- **Symptom:** Browser blocks request with CORS error

- **Solution:**

- Verify serverless.yml has `httpApi.cors: true`

- Check response includes CORS headers (handled by successResponse/errorResponse)

- For local development, use serverless-offline plugin

5. **Environment Variables Not Working**

- **Symptom:** process.env.VARIABLE is undefined

- **Solution:**

- Check .env file exists in backend/ directory

- Verify serverless.yml includes `useDotenv: true`

- Add variable to provider.environment section in serverless.yml

- Redeploy after changing environment variables

6. **TypeScript Compilation Errors**

- **Symptom:** Build fails with type errors

- **Solution:**

- Run `npm run build` to see full error details

- Check imports match actual file exports

- Verify types.ts includes all required types

- Use `AuthenticatedAPIGatewayEvent` for handler events

7. **Frontend Can't Connect to Backend**

- **Symptom:** API calls fail with network error

- **Solution:**

- Check VITE_API_URL in client/.env points to correct API Gateway URL

- Verify API Gateway URL from deployment output

- Check Clerk token is being sent (inspect Network tab)

- Test API directly with curl to isolate frontend vs backend issue

### Debug Commands

**Backend:**

```bash

# Build and check for errors

cd backend

npm run build

# Run tests

npm test

# Deploy to dev stage

./deploy.sh dev-heet

# View logs

npx serverless logs -f functionName --stage dev-heet --tail

# Test API with curl (replace with your API URL and token)

curl -X GET https://your-api.execute-api.ap-south-1.amazonaws.com/api/entities \

  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

```

**Frontend:**

```bash

# Start dev server

cd client

npm run dev

# Build for production

npm run build

# Preview production build

npm run preview

```

**Get Clerk Token for Testing:**

```javascript
// In browser console on your app

const token = await window.Clerk.session.getToken();

console.log(token);
```

## Related Modules

- **Depends On:** [List modules this depends on]

- **Enables:** [List modules that depend on this]

- **Conflicts With:** [Any modules that might conflict]

---

````

**END OF MODULE PLANNING FILE**

---

## Important: Two-Stage Process

### 📅 Stage 1: Problem Statement Breakdown (Generate .md files)

**When:** Analyzing the hackathon problem statement for the first time

**Input:** Problem statement from hackathon organizers

**Output:** Multiple markdown files (one per module)
- `module-F01-user-management.md`
- `module-F02-class-system.md`
- `module-M05-advanced-features.md`
- etc.

**Purpose:** Team coordination, task assignment, planning

**Who Uses It:** Team lead, all developers for understanding scope

---

### 🛠️ Stage 2: Individual Module Implementation (Generate code only)

**When:** Developer picks up a specific module to implement

**Input:** One module's markdown file (e.g., `module-F01-user-management.md`)

**Output:** ONLY code files - NO markdown files
- `backend/src/modules/users/handlers/listUsers.ts`
- `backend/src/modules/users/services/UserService.ts`
- `backend/src/modules/users/functions/listUsers.yml`
- `client/src/components/users/UserList.tsx`
- etc.

**Purpose:** Rapid implementation, working features

**Who Uses It:** Individual developer implementing that specific module

**CRITICAL:** When implementing a module, LLMs should generate ONLY code files (.ts, .tsx, .yml). NO documentation files (.md, .txt, README).

---

## Quick Reference

### Essential Imports for Backend Handlers

```typescript

import { APIGatewayProxyResultV2 } from "aws-lambda";

import { AuthenticatedAPIGatewayEvent } from "../../../shared/types";

import { withRbac, withRbacOwn } from "../../../shared/auth/rbacMiddleware";

import { successResponse, handleAsyncError, commonErrors } from "../../../shared/response";

````

### Essential Imports for Frontend Components

```typescript
import { useApi } from '@/hooks';

import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
```

### File Naming Conventions

- **Handlers:** `listEntity.ts`, `getEntity.ts`, `createEntity.ts`, `updateEntity.ts`, `deleteEntity.ts`

- **Functions:** `listEntity.yml`, `getEntity.yml`, `createEntity.yml`, `updateEntity.yml`, `deleteEntity.yml`

- **Services:** `EntityService.ts` (PascalCase)

- **Types:** `types.ts` (lowercase)

- **Components:** `EntityList.tsx`, `EntityForm.tsx`, `EntityCard.tsx` (PascalCase)

- **Pages:** `EntityListPage.tsx`, `EntityCreatePage.tsx`, `EntityEditPage.tsx` (PascalCase)

- **Hooks:** `useEntity.ts` (camelCase with 'use' prefix)

### API Response Format

```typescript

// Success Response

{

"success": true,

"data": { /* your data */ },

"meta": {

"timestamp": "2024-01-01T00:00:00.000Z"

}

}

// Error Response

{

"success": false,

"error": {

"code": "ERROR_CODE",

"message": "Human readable message",

"details": { /* optional details */ }

},

"meta": {

"timestamp": "2024-01-01T00:00:00.000Z"

}

}

```

### Common RBAC Actions

- `read` - View/list resources (GET)

- `create` - Create new resources (POST)

- `update` - Modify existing resources (PUT/PATCH)

- `delete` - Remove resources (DELETE)

### Common HTTP Status Codes

- `200` - OK (successful GET, PUT, DELETE)

- `201` - Created (successful POST)

- `400` - Bad Request (validation error)

- `401` - Unauthorized (missing/invalid token)

- `403` - Forbidden (insufficient permissions)

- `404` - Not Found (resource doesn't exist)

- `500` - Internal Server Error (unexpected error)

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
