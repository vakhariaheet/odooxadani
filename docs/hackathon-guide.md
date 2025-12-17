# 24-Hour Hackathon Strategy Guide

## Team Overview

- **Team Size:** 4 developers
- **Duration:** 24 hours
- **Strategy:** Maximum AI assistance with IDE rotation as limits are reached
- **Goal:** Build production-grade application with impressive architecture

## Tech Stack

### Frontend

- **Framework:** React + Vite + TypeScript
- **Deployment:** Vercel (auto-deploy from GitHub)
- **UI Library:** shadcn/ui components with Tailwind CSS
- **Authentication:** Clerk (fully configured with JWT)
- **State Management:** Custom hooks (useApi, useLocalStorage, useDebounce)

### Backend

- **Framework:** Serverless Framework on AWS Lambda (Node.js 20.x)
- **Runtime:** Individual Lambda functions per endpoint (not Express)
- **Authentication:** Clerk JWT with API Gateway v2 native JWT authorizer
- **Authorization:** Custom RBAC middleware (`withRbac`, `withRbacOwn`)
- **User Management:** Clerk API via ClerkUserService (no database for users)
- **File Storage:** S3 with presigned URLs (optional)
- **Message Queue:** SQS for async processing (optional)
- **Search:** OpenSearch for full-text search (optional)
- **AI Integration:** Gemini API (optional)
- **Infrastructure:** Pure serverless - no VPCs or complex networking

### Simplified Architecture

```
User → Vercel (React + Clerk) → API Gateway v2 (Native JWT Auth) → Individual Lambda Functions
                                                                              ↓
                                                                    Clerk API (User Management)
                                                                              ↓
                                                            Optional: S3 + SQS + OpenSearch + Gemini
```

**Key Pattern:** Each API endpoint = One Lambda function (no Express app, pure serverless)

## Cost Estimates (24 hours runtime)

- **Lambda:** ~$0.50 (generous estimate for 24h hackathon)
- **DynamoDB:** ~$0.25 (on-demand pricing)
- **API Gateway:** ~$0.10 (HTTP API v2 is cheaper)
- **S3:** ~$0.05 (minimal storage)
- **OpenSearch:** ~$0.50 (t3.small.search for 24h)
- **Total:** ~$1.40 for entire hackathon

## Development Workflow

### Git Strategy

- **Main Branch:** Protected, no direct pushes
- **Feature Branches:** Short-lived (30-60 min work)
- **Merge Frequency:** Every 45-60 minutes
- **Conflict Resolution:** Designated merge marshal
- **Rebase Strategy:** `git pull --rebase origin main` before new work

### AI IDE Rotation

- **Primary Tools:** Cursor, Windsurf/Cascade, Claude Sonnet/Opus
- **Backup Tools:** GitHub Copilot, Gemini-powered tools
- **Strategy:** Switch IDEs when limits reached, same patterns work everywhere

### Module Development

- **Size:** 30-60 minutes per module maximum
- **Structure:** Vertical slices (UI + API + DB)
- **Dependencies:** Minimal coupling between modules
- **Testing:** Local testing only, no deployment until judging

## Pre-Hackathon Setup

### Actual Repository Structure

```
/
├── .agent/workflows/         # AI workflow configurations
├── backend/                  # Serverless Framework Backend
│   ├── src/
│   │   ├── modules/         # Domain-driven modules
│   │   │   └── users/       # User management module
│   │   │       ├── handlers/    # Lambda handlers
│   │   │       ├── services/    # Business logic (ClerkUserService)
│   │   │       ├── functions/   # Serverless function definitions
│   │   │       └── types.ts     # TypeScript definitions
│   │   ├── shared/          # Shared utilities
│   │   │   ├── auth/        # RBAC middleware
│   │   │   ├── aws/         # AWS service wrappers (S3, DynamoDB, SES, SQS)
│   │   │   └── response.ts  # HTTP response helpers
│   │   └── config/          # RBAC permissions configuration
│   ├── scripts/             # Deployment and utility scripts
│   ├── deploy.sh            # Production deployment script
│   └── serverless.yml       # Serverless configuration
├── client/                   # React Frontend
│   ├── src/
│   │   ├── components/      # React components + shadcn/ui
│   │   │   ├── ui/          # shadcn/ui base components
│   │   │   ├── AdminDashboard.tsx # Full admin interface
│   │   │   └── ProtectedRoute.tsx # Role-based routing
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useApi.ts    # HTTP client with auth
│   │   │   ├── useUsers.ts  # User management hooks
│   │   │   └── useNotification.ts # Toast notifications
│   │   ├── services/        # API client and storage
│   │   └── lib/             # Utilities and constants
│   ├── components.json      # shadcn/ui configuration
│   └── vite.config.ts       # Vite configuration
├── docs/                     # Documentation
├── guidelines/               # Development guidelines
└── README.md
```

### Pre-Built Components

- **Authentication:** Clerk fully integrated with JWT authorizer (no custom auth needed)
- **Authorization:** Complete RBAC system with `withRbac` and `withRbacOwn` middleware
- **Admin Dashboard:** Full-featured admin interface with user management
- **AWS Services:** Lightweight wrappers for Lambda, DynamoDB, S3, SQS, OpenSearch
- **AI Integration:** Gemini API wrapper for text generation and analysis
- **User Management:** Complete CRUD with invitations, role changes, ban/unban
- **Custom Hooks:** useApi, useUsers, useLocalStorage, useDebounce, useAsync
- **UI Components:** shadcn/ui with custom Toast and Notification systems
- **Zero Infrastructure:** No servers, VPCs, or complex networking to manage

### Infrastructure (Pure Serverless)

- **No VPCs:** Direct internet access, no NAT gateways or complex networking
- **No CDK:** Simple Serverless Framework YAML configuration
- **Lambda Functions:** Individual functions per endpoint, fast cold starts
- **DynamoDB:** On-demand billing, no capacity planning needed
- **API Gateway v2:** HTTP API (cheaper than REST API)
- **Custom Domain:** Optional - can use default API Gateway URLs
- **Deployment:** Single `./deploy.sh` command deploys everything

## Local Development

### Environment Setup

```bash
# Frontend (Vite dev server)
cd client
bun install
bun dev  # http://localhost:5173

# Backend (Serverless offline)
cd backend
bun install
bun dev  # API available locally

# Environment files needed:
# client/.env.local - Clerk publishable key
# backend/.env.dev - Clerk secret keys and AWS config
```

### Development Flow

1. Pull latest changes: `git pull --rebase origin main`
2. Create feature branch: `git checkout -b feature/module-name`
3. Develop module (30-60 min max)
4. Test locally end-to-end
5. Create PR for merge marshal review
6. Merge and continue

## Deployment Strategy

### Automated Deployment Script

- **Script:** `./deploy.sh dev` or `./deploy.sh prod`
- **Process:** TypeScript check → AWS role assumption → Serverless deploy → Cloudflare DNS update
- **Duration:** ~3-5 minutes total
- **Features:** Custom domain setup, environment validation, deployment logging
- **Output:** Live API with custom domain (api-dev.yourdomain.com / api.yourdomain.com)

### Pre-Judging Checklist

- [ ] Seed script executed successfully
- [ ] Core user flow tested end-to-end
- [ ] All team members can access admin features
- [ ] Custom domain resolving correctly
- [ ] No console errors in production

## Module Development Guidelines

### Backend Modules

- **Lambda Handlers:** Individual function per endpoint in `modules/domain/handlers/` (e.g., `listUsers.ts`)
- **Function Definitions:** Serverless YAML configs in `modules/domain/functions/` (e.g., `listUsers.yml`)
- **Service Layer:** Business logic in `modules/domain/services/` (e.g., `ClerkUserService`)
- **RBAC Middleware:** Wrap handlers with `withRbac(handler, 'module', 'action')` or `withRbacOwn()`
- **Response Helpers:** Use `successResponse()`, `handleAsyncError()`, `commonErrors.*`
- **Type Safety:** Shared types in `modules/domain/types.ts` and `shared/types.ts`

### Frontend Modules

- **Component Structure:** shadcn/ui base + custom components (AdminDashboard, admin/\* components)
- **Custom Hooks:**
  - `useApi()` - Clerk-authenticated API calls with loading/error states
  - `useAsync()` / `useAsyncCallback()` - Async operation management
  - `useLocalStorage()` - Persistent state management
  - `useDebounce()` - Input debouncing for search
- **API Integration:** `apiClient` singleton with automatic Clerk token injection
- **Role-Based UI:** `ProtectedRoute` component for role-based access control
- **Type Safety:** Shared types in `types/user.ts` matching backend types

### Integration Modules

- **S3 Uploads:** Use presigned URLs, no direct uploads to Lambda (optional)
- **Clerk Integration:** All user management via Clerk API (invitations, roles, ban/unban)
- **WebSocket:** API Gateway WebSocket API with Lambda handlers for connect/disconnect/message
- **Search:** OpenSearch integration for full-text search (optional)
- **AI Features:** Gemini API for text generation, analysis, or chat features
- **Message Queue:** SQS for async processing and background jobs
- **External APIs:** Real integrations only, no mocks
- **Real-time:** WebSocket API Gateway if needed (also serverless)

## AI Assistance Optimization

### Effective Prompts

- "Create a Serverless Framework Lambda handler in TypeScript for [functionality]. Use withRbac middleware for authorization. Return successResponse or handleAsyncError."
- "Create a React component using shadcn/ui for [feature]. Use useApi hook for API calls with loading/error states. Include TypeScript types."
- "Create a Clerk-based user management function that [action]. Use ClerkUserService pattern with proper error handling."
- "Create a Lambda function YAML definition for [endpoint]. Include httpApi event with clerkJwtAuthorizer and proper HTTP method/path."
- "Create custom React hook for [feature] using useCallback and useState. Include loading, error, and data states with TypeScript types."

### LLM-Friendly Patterns

- **Individual Lambda Functions:** One handler file + one YAML config per endpoint (no Express routing)
- **Serverless Framework:** Simple YAML function definitions with httpApi events
- **React + shadcn + TypeScript:** Excellent AI coverage with type safety
- **Clerk Authentication:** Native API Gateway JWT authorizer + Clerk API for user management
- **Middleware Pattern:** Simple wrapper functions (`withRbac`, `withRbacOwn`) for authorization
- **Response Helpers:** Consistent `successResponse()` and `commonErrors.*` patterns

## Risk Mitigation

### Technical Risks

- **Cold Starts:** Minimal with HTTP API v2 and optimized Lambda functions
- **Service Limits:** DynamoDB on-demand, Lambda concurrent executions auto-scale
- **Deployment Issues:** Simple serverless deploy, no complex infrastructure
- **Cost Overruns:** Impossible with serverless - pay only for actual usage
- **Complexity:** Eliminated - no VPCs, subnets, or networking to debug

### Time Management

- **Module Size:** 30-60 minutes maximum
- **Feature Creep:** Stick to core requirements first
- **Integration Time:** Budget extra time for external services
- **Demo Prep:** Reserve final 2 hours for polish

## Success Metrics

### Technical Excellence

- **Pure Serverless:** No servers to manage, infinite auto-scaling
- **Security:** IAM roles, JWT authentication, no exposed infrastructure
- **Modern Stack:** TypeScript, Serverless Framework, managed services
- **Cost Efficiency:** Pay-per-use model, no idle resources

### Feature Completeness

- All required features implemented
- 2-3 impressive bonus features
- Smooth user experience
- Admin functionality working

### Presentation Impact

- Custom domain with HTTPS
- Professional UI with shadcn components
- Real integrations (no mocks)
- Scalable architecture story

## Emergency Procedures

### If Deployment Fails

1. Check deploy.sh logs for specific error
2. Use `./deploy.sh dev --domain-only` for domain issues
3. Fallback to local demo with ngrok tunnel

### If External Service Fails

1. Clerk has 99.9% uptime - unlikely to fail
2. AWS services have built-in retry logic in wrappers
3. All integrations are real - no mocks needed

### If Team Member Blocked

1. Modular architecture allows parallel development
2. Pre-built components reduce implementation time
3. Comprehensive documentation and examples available

---

_This guide represents the distilled strategy from extensive planning and testing. Focus on execution during the hackathon - the infrastructure and patterns are proven._

## Key Implementation Details

### Authentication & Authorization

- **Clerk JWT:** Native API Gateway v2 JWT authorizer
- **RBAC System:** Role-based access with `user` and `admin` roles
- **Middleware:** `withRbac()` for any permissions, `withRbacOwn()` for ownership checks
- **Frontend:** ProtectedRoute component with role validation

### User Management Features

- **Admin Dashboard:** Complete user management interface
- **User Operations:** List, invite, ban/unban, delete, change roles
- **Invitation System:** Send, resend, revoke invitations via Clerk
- **Statistics:** Admin dashboard with user metrics

### AWS Service Integration

- **Lambda:** Individual functions per endpoint (Node.js 20.x runtime)
- **API Gateway v2:** HTTP API with native JWT authorizer (Clerk issuer URL)
- **WebSocket API:** API Gateway WebSocket for real-time features
- **Clerk API:** User management (list, invite, ban, delete, role changes)
- **S3:** File upload/download with presigned URLs (optional)
- **SQS:** Message queuing for async processing (optional)
- **OpenSearch:** Full-text search (optional, adds ~$0.50/day)
- **Gemini API:** AI text generation and analysis capabilities (optional)

### Frontend Architecture

- **Custom Hooks:** Complete set for API calls, storage, async operations
- **shadcn/ui:** Professional UI components with Tailwind CSS
- **Toast System:** User feedback with success/error notifications
- **Type Safety:** Full TypeScript coverage across frontend and backend

### Development Experience

- **Hot Reload:** Vite for frontend, Serverless offline for backend
- **Environment Management:** Separate configs for dev/prod
- **Error Handling:** Comprehensive error boundaries and logging
- **Documentation:** Extensive guides for RBAC, Clerk setup, and hooks

This simplified serverless architecture eliminates infrastructure complexity while providing enterprise-grade scalability and security. Perfect for rapid hackathon development with zero operational overhead.
