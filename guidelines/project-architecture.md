# Odoo Xadani - Complete Project Architecture Documentation

## Project Overview

**Odoo Xadani** is a production-grade serverless application built with a monorepo structure using Bun workspaces. It features authentication via Clerk, role-based access control (RBAC), admin dashboard, real-time WebSocket communication, and multi-stage deployment capabilities.

---

## 1. BACKEND ARCHITECTURE

### 1.1 Technology Stack

- **Runtime**: AWS Lambda (Node.js 20.x)
- **API Gateway**: AWS HTTP API v2 (API Gateway v2) with JWT Authorizer
- **Database**: DynamoDB (single-table design with 2 GSIs)
- **Authentication**: Clerk (JWT-based)
- **Authorization**: AccessControl library (RBAC)
- **Real-time**: WebSocket API (AWS API Gateway WebSocket)
- **Infrastructure**: Serverless Framework v3
- **Language**: TypeScript 5.3
- **Build Tool**: esbuild (via serverless-esbuild)
- **Testing**: Jest with ts-jest
- **Linting**: ESLint with TypeScript support

### 1.2 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── permissions.ts          # RBAC configuration (2 roles: user, admin)
│   ├── modules/
│   │   ├── users/                  # User management module
│   │   │   ├── functions/          # 12 Lambda function definitions (.yml)
│   │   │   ├── handlers/           # HTTP request handlers
│   │   │   ├── services/           # Business logic layer
│   │   │   └── types.ts            # Module-specific types
│   │   ├── demo/                   # RBAC testing module
│   │   │   ├── functions/          # 3 demo endpoints
│   │   │   └── handlers/
│   │   └── websocket/              # Real-time communication
│   │       ├── functions/
│   │       ├── handlers/
│   │       ├── services/
│   │       └── types.ts
│   └── shared/
│       ├── auth/
│       │   ├── clerkAuth.ts        # Clerk authentication utilities
│       │   ├── rbacMiddleware.ts   # Role-based access control
│       │   └── ownershipMiddleware.ts # Resource ownership verification
│       ├── clients/                # AWS service clients
│       │   ├── dynamodb.ts         # DynamoDB DocumentClient
│       │   ├── s3.ts               # S3 client
│       │   ├── ses.ts              # Email sending
│       │   ├── sqs.ts              # Queue processing
│       │   ├── gemini.ts           # Google Gemini AI
│       │   └── index.ts
│       ├── logger.ts               # Logging utilities
│       ├── response.ts             # Standardized API responses
│       └── types.ts                # Shared types and helpers
├── serverless.yml                  # Infrastructure & function definitions
├── resources.yml                   # CloudFormation resources (DynamoDB, outputs)
├── deploy.sh                       # Multi-stage deployment script
├── jest.config.js                  # Test configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies & scripts
```

### 1.3 Database Design (DynamoDB)

**Single-Table Design** with 3 indexes:

- **Primary Key**: PK (HASH) + SK (RANGE)
- **GSI1**: GSI1PK (HASH) + GSI1SK (RANGE)
- **GSI2**: GSI2PK (HASH) + GSI2SK (RANGE)

**Billing Mode**: PAY_PER_REQUEST (on-demand)

**Key Features**:

- Point-in-time recovery: Disabled
- Deletion policy: Configurable per stage (Delete for dev, Retain for prod)
- Automatic exports for CloudFormation

### 1.4 Authentication & Authorization

**Authentication Flow**:

1. Clerk handles user sign-up/sign-in
2. Clerk issues JWT tokens with custom claims
3. HTTP API v2 JWT Authorizer validates tokens
4. Claims extracted: `userid`, `email`, `role`

**RBAC Configuration** (2 roles):

- **user**:
  - `readOwn`, `updateOwn` on users module
  - `readAny` on demo module
  - `readAny`, `updateAny` on websocket module
- **admin**:
  - Full CRUD (`*Any`) on all modules (users, demo, admin, websocket)

**Authorization Middleware**:

- `rbacMiddleware`: Checks role-based permissions
- `ownershipMiddleware`: Verifies resource ownership
- Both integrated into handler layer

### 1.5 API Endpoints

**Users Module** (Admin Operations):

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{userId}` - Get user details
- `POST /api/admin/users/invite` - Invite new user
- `PUT /api/admin/users/{userId}/role` - Change user role
- `POST /api/admin/users/{userId}/ban` - Ban user
- `POST /api/admin/users/{userId}/unban` - Unban user
- `DELETE /api/admin/users/{userId}` - Delete user
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/invitations` - List pending invitations
- `DELETE /api/admin/invitations/{invitationId}` - Revoke invitation
- `POST /api/admin/invitations/{invitationId}/resend` - Resend invitation
- `GET /api/admin/permissions` - Get system permissions and roles

**Demo Module** (RBAC Testing):

- `GET /api/demo/whoami` - Get current user info (all authenticated users)
- `GET /api/demo/user` - User-only endpoint
- `GET /api/demo/admin` - Admin-only endpoint

**WebSocket Module**:

- `wss://your-domain/dev` - Real-time bidirectional communication

### 1.6 Clean Architecture Layers

1. **Handlers** (`src/modules/*/handlers/`)
   - Thin entry points for Lambda functions
   - Parse HTTP requests
   - Call service layer
   - Return standardized HTTP responses

2. **Services** (`src/modules/*/services/`)
   - Business logic implementation
   - Authorization checks
   - Input validation
   - Orchestrate repository calls

3. **Repositories** (`src/modules/*/repositories/`)
   - Data access layer
   - DynamoDB operations
   - Single-table design implementation

4. **Shared Layer** (`src/shared/`)
   - DynamoDB client (DocumentClient)
   - AWS service clients (S3, SES, SQS, Gemini)
   - RBAC middleware
   - Ownership verification
   - Shared types and utilities

### 1.7 Configuration & Environment

**Environment Variables**:

- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_ISSUER_URL` - JWT issuer URL
- `CLERK_AUDIENCE` - JWT audience claim
- `AWS_REGION` - AWS region (default: ap-south-1)
- `DYNAMODB_TABLE` - Auto-generated table name
- `STAGE` - Deployment stage
- `NODE_ENV` - Environment (dev/test/prod)

**Multi-Stage Deployment**:

- Individual dev stages: `dev-dhruv`, `dev-tirth`, `dev-pooja`, `dev-heet`
- Test stage: `test`
- Production stage: `prod`
- Each stage has different memory, timeout, and log retention settings

### 1.8 Testing Setup

**Framework**: Jest with ts-jest
**Coverage Thresholds**:

- Global: 70% statements, 60% branches, 70% functions, 70% lines
- Auth modules: 80% statements, 70% branches, 80% functions, 80% lines
- Config modules: 80% across all metrics

**Test Configuration**:

- Test timeout: 10 seconds
- Auto-clear mocks between tests
- Coverage collection from all src files
- Setup file: `tests/setup.ts`

### 1.9 Deployment

**Deployment Script** (`deploy.sh`):

- Supports multi-stage deployment (dev/test/prod)
- AWS credential management (assumes DevRole)
- Serverless Framework integration
- Custom domain setup via serverless-domain-manager
- Cloudflare DNS integration
- Comprehensive logging and error handling
- Deployment info saved to JSON file

**Deployment Process**:

1. Type checking
2. Credential verification
3. Serverless deployment
4. Custom domain creation
5. Cloudflare DNS update
6. Deployment summary

---

## 2. CLIENT ARCHITECTURE

### 2.1 Technology Stack

- **Framework**: React 19.2
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.2
- **Routing**: React Router v7
- **State Management**: TanStack Query (React Query) v5
- **Authentication**: Clerk React SDK v5.58
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **Theme**: next-themes (dark mode support)
- **Linting**: ESLint with TypeScript support
- **Package Manager**: Bun

### 2.2 Project Structure

```
client/
├── src/
│   ├── assets/                     # Static assets
│   ├── components/
│   │   ├── admin/                  # Admin-specific components
│   │   ├── classes/                # Class-related components
│   │   ├── dashboard/              # Dashboard components
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── AdminDashboard.tsx      # Main admin dashboard
│   │   ├── ApiProvider.tsx         # API client provider
│   │   ├── ProtectedRoute.tsx      # Route protection wrapper
│   │   ├── WebSocketDemo.tsx       # WebSocket demo
│   │   ├── WebSocketExample.tsx    # WebSocket example
│   │   └── WebSocketTest.tsx       # WebSocket testing
│   ├── hooks/
│   │   ├── useApi.ts               # API request hook
│   │   ├── useAsync.ts             # Async operation hook
│   │   ├── useConfirmDialog.ts     # Confirmation dialog hook
│   │   ├── useDebounce.ts          # Debounce hook
│   │   ├── useLocalStorage.ts      # Local storage hook
│   │   ├── useUsers.ts             # User management hook
│   │   ├── useWebSocket.ts         # WebSocket hook
│   │   └── index.ts                # Hook exports
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── pages/
│   │   ├── classes/                # Class-related pages
│   │   ├── AdminPage.tsx           # Admin panel page
│   │   ├── DashboardPage.tsx       # User dashboard
│   │   ├── LandingPage.tsx         # Landing page
│   │   ├── NotFoundPage.tsx        # 404 page
│   │   ├── SignInPage.tsx          # Sign in page
│   │   ├── SignUpPage.tsx          # Sign up page
│   │   └── WebSocketTestPage.tsx   # WebSocket testing page
│   ├── services/
│   │   ├── apiClient.ts            # HTTP client wrapper
│   │   ├── usersApi.ts             # Users API service
│   │   ├── storage.ts              # Storage service
│   │   └── index.ts                # Service exports
│   ├── types/
│   │   └── user.ts                 # User types and interfaces
│   ├── utils/
│   │   ├── constants.ts            # App constants
│   │   ├── formatters.ts           # Data formatters
│   │   └── index.ts                # Utility exports
│   ├── App.tsx                     # Main app component
│   ├── App.css                     # App styles
│   ├── index.css                   # Global styles
│   └── main.tsx                    # Entry point
├── public/                         # Static files
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── eslint.config.js                # ESLint configuration
├── components.json                 # shadcn/ui config
├── index.html                      # HTML template
└── package.json                    # Dependencies & scripts
```

### 2.3 Routing & Navigation

**Routes**:

- `/` - Landing page (redirects to dashboard if signed in)
- `/sign-in/*` - Clerk sign-in page
- `/sign-up/*` - Clerk sign-up page
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin panel (protected, admin-only)
- `/websocket-test` - WebSocket testing (protected)
- `*` - 404 Not Found page

**Route Protection**:

- `ProtectedRoute` component wraps protected routes
- Checks authentication status via Clerk
- Supports role-based access (e.g., admin-only routes)
- Redirects to sign-in if not authenticated
- Shows access denied message if role doesn't match

### 2.4 State Management

**TanStack Query (React Query)**:

- Server state management
- Automatic caching and synchronization
- Background refetching
- Optimistic updates support

**Custom Hooks**:

- `useUsers()` - User management operations
- `useApi()` - Generic API request hook
- `useAsync()` - Async operation handling
- `useWebSocket()` - WebSocket connection management
- `useLocalStorage()` - Persistent client-side storage
- `useDebounce()` - Debounced values
- `useConfirmDialog()` - Confirmation dialogs

**Clerk Integration**:

- `useAuth()` - Authentication state
- `useUser()` - Current user info
- `UserButton` - User profile dropdown
- `SignedIn`/`SignedOut` - Conditional rendering

### 2.5 API Client Architecture

**ApiClient** (`services/apiClient.ts`):

- Singleton HTTP client wrapper
- Automatic JWT token injection
- Error handling and response parsing
- File upload support
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`, `uploadFile()`

**Users API Service** (`services/usersApi.ts`):

- Admin user management operations
- Invitation management
- Statistics and permissions endpoints
- Type-safe API calls

**API Response Types**:

- Standardized success/error responses
- User, Invitation, and Stats types
- Dynamic role support

### 2.6 UI/UX Patterns

**Component Library**: shadcn/ui

- Radix UI primitives
- Tailwind CSS styling
- Accessible by default
- Customizable components

**UI Components**:

- Dialog/Modal
- Dropdown Menu
- Select
- Label
- Custom admin components
- Dashboard components
- Class management components

**Styling**:

- Tailwind CSS v4 with Vite plugin
- Dark mode support via next-themes
- Responsive design
- Custom animations (tw-animate-css)

**Notifications**:

- Sonner toast notifications
- Top-right positioning
- Rich colors support
- Close button
- Auto-dismiss (4 seconds)

**Loading States**:

- Loading spinner component
- Conditional rendering based on auth state
- Async operation indicators

### 2.7 Build & Development

**Vite Configuration**:

- React plugin for JSX/TSX
- Tailwind CSS Vite plugin
- Path alias: `@` → `./src`
- Fast HMR (Hot Module Replacement)

**Development Server**:

- `npm run dev` - Start Vite dev server
- Fast refresh for React components
- TypeScript support

**Production Build**:

- `npm run build` - TypeScript check + Vite build
- Optimized bundle
- Source maps for debugging

**Code Quality**:

- ESLint with React hooks plugin
- TypeScript strict mode
- Prettier formatting

### 2.8 Environment Configuration

**Environment Variables**:

- `VITE_API_URL` - Backend API base URL
- Loaded from `.env.local` (development)
- Clerk configuration via environment

**Build Outputs**:

- Optimized JavaScript bundles
- CSS modules
- Static assets
- Source maps

---

## 3. KEY FEATURES & CAPABILITIES

### 3.1 Authentication & Authorization

✅ Clerk-based authentication (JWT)
✅ Role-based access control (RBAC)
✅ Protected routes with role checking
✅ Ownership-based resource access
✅ Admin dashboard for user management

### 3.2 User Management

✅ User listing and filtering
✅ User invitations
✅ Role assignment and changes
✅ User banning/unbanning
✅ User deletion
✅ Admin statistics

### 3.3 Real-time Features

✅ WebSocket API for bidirectional communication
✅ Connection management
✅ Message routing

### 3.4 Infrastructure & DevOps

✅ Multi-stage deployment (dev/test/prod)
✅ Custom domains with Cloudflare DNS
✅ Serverless Framework integration
✅ CloudFormation resources
✅ Comprehensive logging
✅ Automated deployment script

### 3.5 Code Quality

✅ Full TypeScript coverage
✅ ESLint configuration
✅ Jest testing framework
✅ Code coverage thresholds
✅ Git hooks (Husky)
✅ Conventional commits

---

## 4. INTEGRATION POINTS & READY-TO-USE SERVICES

### 4.1 AWS Services (Configured)

- **Lambda**: Function compute
- **API Gateway v2**: HTTP and WebSocket APIs
- **DynamoDB**: NoSQL database
- **CloudFormation**: Infrastructure as code
- **CloudWatch**: Logging and monitoring

### 4.2 AWS Services (Ready to Integrate)

- **S3**: File storage (client configured)
- **SES**: Email sending (client configured)
- **SQS**: Message queuing (client configured)

### 4.3 Third-party Services

- **Clerk**: Authentication and user management
- **Google Gemini**: AI integration (client configured)
- **Cloudflare**: DNS management

---

## 5. DEPLOYMENT ARCHITECTURE

**Multi-Stage Pipeline**:

```
dev-dhruv ─┐
dev-tirth ─┼─→ test ─→ prod
dev-pooja ─┤
dev-heet  ─┘
```

**Stage Configuration**:
| Stage | Memory | Timeout | Log Retention | Deletion Policy |
|-------|--------|---------|---------------|-----------------|
| dev-\* | 256MB | 29s | 3 days | Delete |
| test | 512MB | 29s | 14 days | Delete |
| prod | 512MB | 29s | 30 days | Retain |

**Custom Domains**:

- HTTP API: `api-{stage}.yourdomain.com`
- WebSocket: `ws-{stage}.yourdomain.com`
- Managed via serverless-domain-manager
- DNS via Cloudflare

---

## 6. DEVELOPMENT WORKFLOW

**Scripts**:

```bash
# Root level
npm run backend          # Start backend dev server
npm run client           # Start client dev server
npm test               # Run all tests
npm run lint           # Lint all workspaces
npm run typecheck      # Type check all workspaces
npm run format         # Format code with Prettier

# Backend
npm run dev            # Start offline development
npm run deploy:dev     # Deploy to dev stage
npm run deploy:prod    # Deploy to production
npm run logs           # View Lambda logs

# Client
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

**Git Workflow**:

- Conventional commits
- Husky pre-commit hooks
- Lint-staged for staged files
- Commitlint for message validation

---

## 7. TECHNOLOGY SUMMARY

| Layer                  | Technology              | Purpose             |
| ---------------------- | ----------------------- | ------------------- |
| **Backend Runtime**    | AWS Lambda + Node.js 20 | Serverless compute  |
| **Backend API**        | HTTP API v2 + WebSocket | API Gateway         |
| **Backend Auth**       | Clerk + JWT             | Authentication      |
| **Backend Auth**       | AccessControl           | RBAC                |
| **Backend DB**         | DynamoDB                | NoSQL database      |
| **Backend Build**      | TypeScript + esbuild    | Language & bundling |
| **Backend Deploy**     | Serverless Framework    | Infrastructure      |
| **Frontend Framework** | React 19                | UI library          |
| **Frontend Routing**   | React Router v7         | Navigation          |
| **Frontend State**     | TanStack Query          | Server state        |
| **Frontend Auth**      | Clerk React SDK         | Authentication UI   |
| **Frontend UI**        | shadcn/ui + Tailwind    | Component library   |
| **Frontend Build**     | Vite                    | Build tool          |
| **Frontend Styling**   | Tailwind CSS v4         | CSS framework       |

---

## 8. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Landing, SignIn, SignUp, Dashboard, Admin    │   │
│  │ Components: UI (shadcn/ui), Admin, Dashboard        │   │
│  │ Hooks: useUsers, useApi, useWebSocket, etc.         │   │
│  │ Services: apiClient, usersApi                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│                    Clerk Auth SDK                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   HTTP API v2 + JWT Authorizer       │
        │   (API Gateway v2)                   │
        └──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Lambda)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Modules: Users, Demo, WebSocket                      │   │
│  │ ├─ Handlers: HTTP request entry points              │   │
│  │ ├─ Services: Business logic                         │   │
│  │ └─ Repositories: Data access                        │   │
│  │ Shared: Auth (RBAC), Clients (AWS), Types           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AWS Services:                                        │   │
│  │ • DynamoDB (Single-table design)                    │   │
│  │ • S3, SES, SQS (Ready to integrate)                 │   │
│  │ • CloudWatch (Logging)                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │   Clerk (Authentication)             │
        │   Cloudflare (DNS)                   │
        └──────────────────────────────────────┘
```

---

## 9. GETTING STARTED

### Prerequisites

- Node.js 20+
- Bun package manager
- AWS CLI configured
- Clerk account setup

### Quick Start

1. **Clone and Install**:

   ```bash
   git clone <repository>
   cd odoo-xadani
   bun install
   ```

2. **Environment Setup**:

   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Clerk keys

   # Client
   cp client/.env.example client/.env
   # Edit client/.env with API URL
   ```

3. **Development**:

   ```bash
   # Start backend (in one terminal)
   npm run backend

   # Start client (in another terminal)
   npm run client
   ```

4. **Deploy**:
   ```bash
   # Deploy to dev stage
   cd backend
   npm run deploy:dev
   ```

This comprehensive architecture provides a solid foundation for a production-grade serverless application with modern development practices, scalability, and maintainability.
