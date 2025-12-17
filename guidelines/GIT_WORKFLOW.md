# Git Workflow Guidelines

Best practices for version control, branching, and collaboration.

## Branching Strategy

### Branch Types

**Main branches:**

- `main` - Production-ready code
- `test` - QA/testing environment

**Feature branches:**

- `feat/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation updates
- `refactor/refactor-name` - Code refactoring
- `test/test-name` - Test additions/updates
- `chore/task-name` - Maintenance tasks

### Branch Naming

**Use descriptive, kebab-case names:**

```bash
✅ Good
feat/user-invitation-system
fix/websocket-connection-timeout
docs/update-deployment-guide
refactor/extract-user-service
test/add-user-service-tests
chore/update-dependencies

❌ Bad
feature
fix-bug
my-branch
john-work
update
```

**Include ticket number if applicable:**

```bash
feat/PROJ-123-user-invitation
fix/PROJ-456-websocket-timeout
```

## Workflow

### 1. Create Feature Branch

**From your dev stage branch:**

```bash
# Update your dev stage
git checkout dev-heet
git pull origin dev-heet

# Create feature branch
git checkout -b feat/user-invitation-system
```

### 2. Make Changes

**Work on your feature:**

```bash
# Make changes
vim src/modules/users/handlers/inviteUser.ts

# Stage changes
git add src/modules/users/handlers/inviteUser.ts

# Commit with conventional commit message
git commit -m "feat(users): add user invitation endpoint"
```

### 3. Keep Branch Updated

**Regularly sync with base branch:**

```bash
# Fetch latest changes
git fetch origin

# Rebase on base branch
git rebase origin/dev-heet

# Or merge if you prefer
git merge origin/dev-heet
```

### 4. Push Changes

**Push to remote:**

```bash
# First push
git push -u origin feat/user-invitation-system

# Subsequent pushes
git push
```

### 5. Create Pull Request

**PR to test branch:**

1. Go to GitHub/GitLab
2. Create PR from `feat/user-invitation-system` to `test`
3. Fill in PR template
4. Request review
5. Address feedback
6. Merge after approval

### 6. Deploy and Test

**Deploy to test environment:**

```bash
# Checkout test branch
git checkout test
git pull origin test

# Deploy to test stage
cd backend
./deploy.sh test
```

### 7. Merge to Production

**After QA approval:**

1. Create PR from `test` to `main`
2. Get approval
3. Merge to `main`
4. Deploy to production

## Commit Guidelines

### Conventional Commits

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Tests
- `build` - Build system
- `ci` - CI/CD
- `chore` - Maintenance
- `revert` - Revert previous commit

**Scopes:**

- `backend` - Backend changes
- `client` - Frontend changes
- `api` - API changes
- `auth` - Authentication
- `users` - User management
- `websocket` - WebSocket
- `deploy` - Deployment
- `config` - Configuration
- `deps` - Dependencies

### Good Commit Messages

**Feature:**

```bash
feat(users): add user invitation system

- Add invitation creation endpoint
- Add invitation revocation endpoint
- Add email notification service
- Update user service with invitation logic

Closes #123
```

**Bug fix:**

```bash
fix(websocket): resolve connection timeout issue

The WebSocket connection was timing out after 30 seconds due to
missing ping/pong heartbeat. Added heartbeat mechanism to keep
connections alive.

Fixes #456
```

**Documentation:**

```bash
docs(deploy): update multi-stage deployment guide

- Add section on Cloudflare DNS configuration
- Update environment variable examples
- Add troubleshooting section
```

**Refactoring:**

```bash
refactor(users): extract user service to separate module

Moved user-related business logic from handlers to a dedicated
UserService class for better separation of concerns and testability.
```

**Tests:**

```bash
test(api): add integration tests for user endpoints

- Test user creation
- Test user listing with pagination
- Test user role changes
- Test user deletion
```

**Dependencies:**

```bash
chore(deps): update AWS SDK to v3.950.0

Updated AWS SDK packages to latest version for security patches
and performance improvements.
```

### Commit Message Rules

**Subject line:**

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Limit to 72 characters

**Body:**

- Separate from subject with blank line
- Wrap at 72 characters
- Explain what and why, not how
- Use bullet points for multiple changes

**Footer:**

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

### Bad Commit Messages

```bash
❌ Bad - Too vague
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"

❌ Bad - Not conventional
git commit -m "Added new feature"
git commit -m "Fixed the thing"
git commit -m "WIP"

❌ Bad - Too long subject
git commit -m "feat(users): add user invitation system with email notifications and role management and admin approval workflow"

❌ Bad - Multiple unrelated changes
git commit -m "feat(users): add invitation system and fix websocket bug and update docs"
```

## Pull Request Guidelines

### PR Title

**Use conventional commit format:**

```
feat(users): add user invitation system
fix(websocket): resolve connection timeout
docs(deploy): update deployment guide
```

### PR Description

**Use the template:**

```markdown
## Description

Brief description of changes and motivation

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Tested locally
- [ ] Deployed to dev stage: dev-heet
- [ ] All tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots here

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] Dependent changes merged

## Related Issues

Closes #123
Fixes #456
```

### PR Best Practices

**Do's:**

- ✅ Keep PRs small and focused (< 400 lines)
- ✅ Write clear description
- ✅ Add screenshots for UI changes
- ✅ Link related issues
- ✅ Request specific reviewers
- ✅ Respond to feedback promptly
- ✅ Test before requesting review
- ✅ Update documentation

**Don'ts:**

- ❌ Mix unrelated changes
- ❌ Submit without testing
- ❌ Ignore review feedback
- ❌ Force push after review started
- ❌ Merge without approval
- ❌ Leave unresolved comments
- ❌ Skip CI checks

## Code Review

### As a Reviewer

**What to look for:**

- Code correctness and logic
- Code style and consistency
- Test coverage
- Security issues
- Performance concerns
- Documentation
- Breaking changes

**How to review:**

```markdown
✅ Good feedback
"Consider extracting this logic into a separate function for better testability."
"This could cause a race condition. Have you considered using a lock?"
"Great implementation! One suggestion: we could use a constant here instead of a magic number."

❌ Bad feedback
"This is wrong."
"Why did you do it this way?"
"I don't like this."
```

**Review checklist:**

- [ ] Code follows project standards
- [ ] Tests are adequate
- [ ] No security vulnerabilities
- [ ] No performance issues
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] CI checks pass

### As an Author

**Responding to feedback:**

```markdown
✅ Good responses
"Good catch! I'll extract this into a helper function."
"You're right about the race condition. I've added a lock."
"I disagree because... What do you think?"

❌ Bad responses
"It works fine."
"I don't have time to change this."
"Whatever."
```

**After feedback:**

- Address all comments
- Mark resolved comments
- Request re-review
- Don't force push (use regular push to preserve review history)

## Merge Strategies

### Squash and Merge (Recommended)

**When to use:**

- Feature branches with many small commits
- Want clean main branch history

**How it works:**

```bash
# All commits in PR are squashed into one
feat(users): add user invitation system

- Add invitation creation endpoint
- Add invitation revocation endpoint
- Add email notification service
```

### Rebase and Merge

**When to use:**

- Want to preserve individual commits
- Commits are already well-structured

**How it works:**

```bash
# Individual commits are replayed on top of base branch
feat(users): add invitation creation endpoint
feat(users): add invitation revocation endpoint
feat(users): add email notification service
```

### Merge Commit

**When to use:**

- Want to preserve branch history
- Merging long-lived branches

**How it works:**

```bash
# Creates a merge commit
Merge pull request #123 from feat/user-invitation-system
```

## Git Commands Reference

### Basic Commands

```bash
# Check status
git status

# View changes
git diff
git diff --staged

# Stage changes
git add file.ts
git add .

# Commit
git commit -m "feat(users): add feature"

# Push
git push
git push -u origin branch-name

# Pull
git pull
git pull --rebase
```

### Branch Management

```bash
# List branches
git branch
git branch -a  # Include remote branches

# Create branch
git checkout -b feat/new-feature

# Switch branch
git checkout main

# Delete branch
git branch -d feat/old-feature
git push origin --delete feat/old-feature
```

### Syncing

```bash
# Fetch latest
git fetch origin

# Rebase on main
git rebase origin/main

# Merge main into current branch
git merge origin/main

# Pull with rebase
git pull --rebase origin main
```

### Undoing Changes

```bash
# Discard unstaged changes
git checkout -- file.ts
git restore file.ts

# Unstage changes
git reset HEAD file.ts
git restore --staged file.ts

# Amend last commit
git commit --amend

# Revert commit
git revert commit-hash

# Reset to previous commit (dangerous!)
git reset --hard HEAD~1
```

### Stashing

```bash
# Stash changes
git stash
git stash save "WIP: feature work"

# List stashes
git stash list

# Apply stash
git stash apply
git stash pop  # Apply and remove

# Drop stash
git stash drop stash@{0}
```

### History

```bash
# View log
git log
git log --oneline
git log --graph --oneline --all

# View file history
git log -- file.ts

# View commit details
git show commit-hash

# Search commits
git log --grep="user"
git log --author="John"
```

### Cherry-picking

```bash
# Apply specific commit to current branch
git cherry-pick commit-hash

# Cherry-pick multiple commits
git cherry-pick commit1 commit2 commit3
```

### Rebasing

```bash
# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# Rebase on main
git rebase main

# Continue after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

## Conflict Resolution

### When Conflicts Occur

```bash
# During merge or rebase
Auto-merging file.ts
CONFLICT (content): Merge conflict in file.ts
```

### Resolving Conflicts

**1. View conflicted files:**

```bash
git status
```

**2. Open file and resolve:**

```typescript
<<<<<<< HEAD
// Your changes
const value = 'new';
=======
// Their changes
const value = 'old';
>>>>>>> branch-name
```

**3. Choose resolution:**

```typescript
// Keep yours, theirs, or combine
const value = 'new';
```

**4. Mark as resolved:**

```bash
git add file.ts
```

**5. Continue:**

```bash
# For merge
git commit

# For rebase
git rebase --continue
```

### Conflict Prevention

- Pull/rebase frequently
- Keep PRs small
- Communicate with team
- Avoid working on same files

## Best Practices

### Do's

- ✅ Commit often with meaningful messages
- ✅ Pull/rebase before starting work
- ✅ Keep branches up to date
- ✅ Write descriptive commit messages
- ✅ Review your own changes before PR
- ✅ Test before committing
- ✅ Use conventional commits
- ✅ Keep PRs small and focused

### Don'ts

- ❌ Commit directly to main
- ❌ Force push to shared branches
- ❌ Commit secrets or sensitive data
- ❌ Mix unrelated changes
- ❌ Skip commit messages
- ❌ Ignore merge conflicts
- ❌ Leave WIP commits
- ❌ Commit generated files

## Git Hooks

### Pre-commit Hook

**Runs before commit:**

- Linting
- Formatting
- Type checking

```bash
# Bypass if needed (not recommended)
git commit --no-verify -m "message"
```

### Commit-msg Hook

**Validates commit message:**

- Checks conventional commit format
- Enforces message rules

### Pre-push Hook

**Runs before push:**

- Run tests
- Check for secrets

## Troubleshooting

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)

```bash
git reset --hard HEAD~1
```

### Fix Commit Message

```bash
git commit --amend -m "new message"
```

### Recover Deleted Branch

```bash
# Find commit hash
git reflog

# Recreate branch
git checkout -b branch-name commit-hash
```

### Clean Untracked Files

```bash
# Preview
git clean -n

# Remove files
git clean -f

# Remove files and directories
git clean -fd
```

---

For more information, see:

- [Contributing Guide](../CONTRIBUTING.md)
- [Coding Guidelines](./CODING_GUIDELINES.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
