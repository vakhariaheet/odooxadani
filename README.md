# Hackathon Starter Template

Full-stack serverless application template with authentication, admin dashboard, and real-time features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- AWS Account with credentials configured
- Clerk account (free tier works)

### Setup

1. **Clone and install dependencies:**
```bash
# Backend
cd backend
npm install  # or bun install

# Client
cd ../client
npm install  # or bun install
```

2. **Configure Clerk:**
   - Create account at [clerk.com](https://clerk.com)
   - Get your publishable and secret keys
   - See `client/CLERK_SETUP.md` for detailed setup

3. **Environment variables:**
```bash
# Backend (.env.dev)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_ISSUER_URL=https://your-instance.clerk.accounts.dev
CLERK_AUDIENCE=https://your-frontend-url.com

# Client (.env.local)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

4. **Deploy backend:**
```bash
cd backend
./deploy.sh dev
```

5. **Run frontend:**
```bash
cd client
npm run dev
```

## 📦 What's Included

### ✅ Ready to Use
- **Authentication**: Clerk with JWT, role-based access (user/admin)
- **Admin Dashboard**: User management, invitations, ban/unban, role changes
- **WebSocket**: Real-time bidirectional communication
- **Deployment**: Serverless Framework with custom domains + Cloudflare DNS
- **UI Components**: shadcn/ui with Tailwind CSS
- **Type Safety**: Full TypeScript coverage

### 🔧 Ready to Integrate
- **SES Client**: Email sending wrapper (not connected yet)
- **SQS Client**: Queue processing wrapper (not connected yet)

### 📋 See Full Feature List
Check `FEATURES.md` for complete list of implemented and missing features.

## 🏗️ Project Structure

```
├── backend/
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   │   ├── users/        # User management
│   │   │   ├── websocket/    # WebSocket handlers
│   │   │   └── demo/         # RBAC testing
│   │   └── shared/           # Shared utilities
│   │       ├── auth/         # RBAC middleware
│   │       └── clients/      # AWS service clients
│   ├── deploy.sh             # Deployment script
│   └── serverless.yml        # Infrastructure config
│
└── client/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Route pages
    │   ├── hooks/            # Custom hooks
    │   └── services/         # API clients
    └── vite.config.ts
```

## 🔑 Key Features

### Backend API
- `GET /api/admin/users` - List users
- `POST /api/admin/users/invite` - Invite user
- `PUT /api/admin/users/{id}/role` - Change role
- `POST /api/admin/users/{id}/ban` - Ban user
- `DELETE /api/admin/users/{id}` - Delete user
- WebSocket at `wss://your-domain/dev`

### Frontend Routes
- `/` - Landing page
- `/sign-in` - Sign in
- `/sign-up` - Sign up
- `/dashboard` - User dashboard
- `/admin` - Admin panel (admin only)

## 🛠️ Tech Stack

**Backend:** AWS Lambda, API Gateway, DynamoDB, Clerk, TypeScript  
**Frontend:** React 19, TypeScript, Vite, TanStack Query, Tailwind CSS  
**DevOps:** Serverless Framework, CloudFormation, Cloudflare DNS

## 📚 Documentation

- `backend/README.md` - Backend setup and API docs
- `client/CLERK_SETUP.md` - Clerk authentication setup
- `FEATURES.md` - Complete feature list
- `hackathon-guide.md` - Hackathon-specific guide

## 🤝 Contributing

This is a hackathon template. Fork it, customize it, build something awesome!

## 📄 License

MIT
