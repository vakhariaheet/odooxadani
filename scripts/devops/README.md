# DevOps CLI Tool

A modern, user-friendly CLI tool for streamlined development workflow with proper git management, module creation, and serverless deployment.

## Features

- 🆕 **Module Management**: Create new modules or work on existing ones
- ✅ **Smart Git Workflow**: Proper branch management with rebase and conflict resolution
- 🚀 **Serverless Deployment**: Full and function-specific deployments
- 🎨 **Great UX**: Interactive menus, progress indicators, and clear feedback
- ⚙️ **Configurable**: Environment-based configuration with sensible defaults

## Installation

```bash
cd scripts/devops
npm install
```

## Usage

### Interactive Mode (Recommended)

```bash
npm run dev
# or after building
npm start
```

### Command Line Interface

#### Module Commands

```bash
# Create new module or work on existing
npm run dev module new
npm run dev m n  # short alias

# Complete module (commit, rebase, push, PR)
npm run dev module complete
npm run dev m c  # short alias

# Pull and rebase current branch
npm run dev module sync
npm run dev m s  # short alias
```

#### Deployment Commands

```bash
# Deploy all functions and resources
npm run dev deploy all
npm run dev d a  # short alias

# Deploy specific function
npm run dev deploy function
npm run dev d f  # short alias
```

#### Configuration

```bash
# Show current configuration
npm run dev config
```

## Configuration

Create a `.env` file in the `scripts/devops` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
# Git Configuration
EPIC_BRANCH=main
DEFAULT_COMMIT_MESSAGE_PREFIX=feat:

# Deployment Configuration
SERVERLESS_STAGE=dev
DEVOPS_AWS_PROFILE=default

# Paths (relative to git root)
BACKEND_PATH=backend
MODULES_PATH=backend/src/modules
```

## Key Improvements

### 1. Better Git Workflow

- ✅ Proper pull before rebase
- ✅ Conflict detection and resolution prompts
- ✅ Stash management for uncommitted changes
- ✅ Force-push with lease for safety

### 2. Enhanced UX

- ✅ Progress indicators with `ora`
- ✅ Colored output with `chalk`
- ✅ Interactive prompts with `inquirer`
- ✅ Proper error handling and recovery

### 3. Robust Architecture

- ✅ TypeScript for type safety
- ✅ Modular command structure
- ✅ Proper dependency management
- ✅ Configuration management

### 4. Pre-deployment Checks

- ✅ Serverless Framework installation
- ✅ AWS credentials validation
- ✅ Environment configuration

## Commands Overview

| Command           | Description                                      | Alias |
| ----------------- | ------------------------------------------------ | ----- |
| `module new`      | Create/select module and checkout feature branch | `m n` |
| `module complete` | Commit, rebase, push, and create PR              | `m c` |
| `deploy all`      | Full serverless deployment                       | `d a` |
| `deploy function` | Deploy specific function                         | `d f` |
| `config`          | Show current configuration                       | -     |

## Workflow Example

1. **Start new feature**:

   ```bash
   npm run dev module new
   ```

   - Handles uncommitted changes
   - Pulls latest from epic branch
   - Creates/checks out feature branch

2. **Develop your feature**:
   - Follow project architecture guidelines
   - Implement handlers, services, types
   - Update permissions if needed

3. **Complete feature**:

   ```bash
   npm run dev module complete
   ```

   - Commits changes with proper message
   - Rebases from epic branch (with pull)
   - Handles merge conflicts
   - Pushes branch
   - Creates Pull Request

4. **Deploy**:

   ```bash
   npm run dev deploy function
   ```

   - Pre-deployment checks
   - Interactive function selection
   - Deploys to configured stage

## Error Handling

The tool includes comprehensive error handling:

- Git operation failures
- Merge conflict detection
- AWS credential issues
- Serverless deployment errors
- Network connectivity problems

## Dependencies

- **commander**: CLI framework
- **inquirer**: Interactive prompts
- **chalk**: Terminal colors
- **ora**: Progress spinners
- **simple-git**: Git operations
- **execa**: Process execution
- **dotenv**: Environment variables

## Building

```bash
npm run build
```

This creates a `dist/` directory with compiled JavaScript that can be run with Node.js directly.
