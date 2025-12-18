# Problem Statement Module Breakdown Prompt

Use this prompt with Claude Sonnet/Opus or other advanced LLMs to break down hackathon problem statements into executable modules.

---

```
You are an expert hackathon architect helping a team of 4 full-stack developers break down a problem statement into executable modules for a 24-hour hackathon.

## Context
- Tech Stack: React + Vercel (frontend), Express + AWS Lambda (backend), DynamoDB Single Table Design, S3
- Template includes: Clerk Auth, RBAC, Admin Dashboard, shadcn/ui components
- Each developer has access to AI coding assistants (Cursor, Windsurf/Cascade, Claude Sonnet/Opus)
- Git workflow: Feature branches with frequent rebases, one merge marshal
- Budget: <$1 for 5-hour runtime
- Deployment: GitHub Actions → CDK → Cloudflare DNS

## Your Task
Analyze the following problem statement and create a detailed module breakdown.

### Problem Statement:
[PASTE PROBLEM STATEMENT HERE]

---

## Output Format

### 1. Core Features Analysis
List all MUST-HAVE features explicitly mentioned in the problem statement. Rate complexity (Simple/Medium/Complex).

### 2. Bonus Features Strategy
Suggest 3-5 high-impact bonus features that:
- Demonstrate technical depth
- Are achievable in remaining time
- Impress judges (e.g., real-time features, AI integration, analytics)
- Leverage our tech stack advantages

### 3. Module Breakdown
For each module, provide:

**Module Name:** [Clear, descriptive name]
**Estimated Time:** [30min / 45min / 1hr / 1.5hr]
**Complexity:** [Simple CRUD / Medium / Complex]
**Assigned Type:** [Backend-heavy / Frontend-heavy / Full-stack / Integration]
**Dependencies:** [List other modules this depends on, or "None"]

**Backend Tasks:**
- [ ] Specific Express route(s) to create
- [ ] DynamoDB access pattern (pk/sk structure for single table)
- [ ] Middleware/validation requirements
- [ ] Integration points (S3/external APIs)

**Frontend Tasks:**
- [ ] Specific pages/components to build
- [ ] shadcn/ui components needed
- [ ] API integration points
- [ ] State management requirements

**Integration Requirements:**
[If this module needs external services, specify:]
- Service Name: [e.g., Stripe, Twilio, OpenAI, SendGrid]
- Setup Required: [What needs to be configured beforehand]
- SDK/Library: [Exact npm package to use]
- Real Integration Approach: [How to implement, no mocks/demos]
- Fallback Plan: [If service fails during demo]
- Cost Impact: [Any additional costs beyond our $1 budget]

**Acceptance Criteria:**
- [ ] [Specific, testable criteria]
- [ ] [What "done" looks like for demo]

**LLM Prompt Hints:**
[Suggest 2-3 effective prompts for AI assistants:]
- "Create Express route for [specific functionality] using DynamoDB single table"
- "Build React component using shadcn/ui for [specific UI need]"
- "Implement [integration] with error handling and fallbacks"

### 4. Development Timeline
**Phase 1 (Hours 1-6): Foundation**
- [ ] Module dependencies resolved
- [ ] Core user flow working end-to-end

**Phase 2 (Hours 7-18): Feature Development**
- [ ] All required features implemented
- [ ] Basic testing and integration

**Phase 3 (Hours 19-22): Polish & Bonus**
- [ ] Bonus features added
- [ ] UI/UX improvements
- [ ] Performance optimization

**Phase 4 (Hours 23-24): Deployment & Demo Prep**
- [ ] Production deployment
- [ ] Demo script prepared
- [ ] Backup plans ready

### 5. Risk Assessment
**High Risk Items:**
- [Items that could block the team]
- [Mitigation strategies]

**External Dependencies:**
- [Third-party services needed]
- [Backup plans if services fail]

**Technical Challenges:**
- [Complex integrations]
- [Performance bottlenecks]
- [Scalability concerns]

### 6. Architecture Decisions
**Database Schema:**
- [Key DynamoDB access patterns needed]
- [GSI requirements]
- [Data relationships in single table]

**API Design:**
- [Key endpoints and their purposes]
- [Authentication/authorization requirements]
- [File upload/download patterns]

**Frontend Architecture:**
- [Key user flows]
- [State management approach]
- [Component hierarchy]

### 7. Demo Strategy
**Core Demo Flow:**
- [Step-by-step user journey for judges]
- [Key features to highlight]
- [Technical architecture talking points]

**Backup Demo Plan:**
- [Simplified flow if deployment fails]
- [Local demo capabilities]
- [Screenshots/videos as fallback]

## Guidelines for Module Creation:
1. Each module should be completable by 1 person + AI in 30-60 minutes
2. Modules should have minimal dependencies on each other
3. Prioritize vertical slices (UI + API + DB) over horizontal layers
4. Always suggest real integrations with specific services and SDKs
5. Consider the $1 budget constraint for any paid services
6. Leverage the pre-built template components (auth, admin, etc.)
7. Optimize for LLM assistance - use well-documented patterns
8. Plan for frequent git merges and potential conflicts
9. Include fallback plans for risky integrations
10. Balance impressive features with reliable execution

Remember: The goal is to build something that works reliably and impresses judges, not to use every possible technology. Focus on execution excellence over feature complexity.
```

---

## Usage Instructions

1. **Copy the entire prompt above**
2. **Replace `[PASTE PROBLEM STATEMENT HERE]` with the actual hackathon problem statement**
3. **Paste into Claude Sonnet/Opus or your preferred LLM**
4. **Review the output and adjust based on your team's strengths**
5. **Use the module breakdown to assign work and track progress**

## Example Follow-up Prompts

After getting the initial breakdown, you can refine with:

- "The [module name] seems too complex. Can you break it into 2 smaller modules?"
- "What's the minimum viable version of this feature for demo purposes?"
- "Which modules can be developed in parallel without conflicts?"
- "What's the fallback plan if [specific integration] doesn't work?"
- "How can we make [feature] more impressive for judges?"

## Tips for Best Results

- **Be specific** about your tech stack constraints
- **Mention your team's experience** with certain technologies
- **Ask for prioritization** if the breakdown has too many modules
- **Request specific code examples** for complex integrations
- **Get multiple perspectives** by running the same prompt through different LLMs
