# AGENTS.md - belmontrunners.com

## CRITICAL: NEVER Push to `main` Branch

**NEVER push directly to the `main` branch. Always push to new branches and create a PR.**

Pushing to `main` triggers an automatic Firebase deployment to production via GitHub Actions.

## Agent Workflow

When completing tasks, follow these steps:

1. **Run required checks**: Run `npm run lint` (frontend) and `cd functions && npm run build` (functions) before finishing work. Fix any issues.
2. **Commit to a feature branch**: Create a descriptive branch name (e.g., `fix/ical-empty-rows`, `feat/member-dashboard`) and commit your changes. **NEVER commit to `main`.**
3. **Create a PR and push**: Push the branch and create a pull request using `gh pr create`
4. **Monitor CI/CD**: After pushing, monitor GitHub Actions workflows until they pass. See [Monitoring CI/CD After Push](#monitoring-cicd-after-push). Do not consider work complete until CI passes.

## Compound Engineering Workflows

**All major projects and tasks should follow this workflow:**

### For New Development

```
/workflows:plan  ->  /workflows:work  ->  /workflows:review  ->  /workflows:compound
```

1. **`/workflows:plan`** - Start by creating a structured plan
   - Transforms feature descriptions or bug reports into well-structured plans
   - Gathers context from the codebase
   - Creates a plan file in `.claude/plan-<name>.md`

2. **`/workflows:work`** - Execute the plan
   - Takes the plan file and executes it systematically
   - Tracks progress with TodoWrite
   - Runs quality checks before committing
   - Creates PR and monitors CI/CD

3. **`/workflows:review`** - Self-review your changes
   - Run on your own PR before requesting human review
   - Multi-perspective analysis (TypeScript, security, performance, accessibility)
   - Fix any P1/P2 issues before requesting review

4. **`/workflows:compound`** - Document learnings
   - After solving non-trivial problems, document the solution
   - Creates searchable documentation in `docs/solutions/`
   - Knowledge compounds — future similar issues take minutes instead of hours

### For Reviewing Others' Code

```
/workflows:review [PR number or URL]
```

### When to Use Each Workflow

| Scenario | Workflow |
|----------|----------|
| New feature | `/workflows:plan` -> `/workflows:work` -> `/workflows:review` -> `/workflows:compound` |
| Bug fix | `/workflows:plan` (minimal) -> `/workflows:work` -> `/workflows:review` |
| Review a PR | `/workflows:review [PR#]` |
| Self-review before requesting human review | `/workflows:review` (on your own PR) |
| Document a solved problem | `/workflows:compound` |
| Quick task (< 30 min) | Direct implementation -> `/workflows:review` |

### Directory Structure

```
.claude/plan-*.md         # Project plans from /workflows:plan
docs/solutions/           # Solution documentation from /workflows:compound
  ├── firebase-issues/
  ├── build-errors/
  ├── runtime-errors/
  ├── performance-issues/
  ├── typescript-issues/
  ├── ui-bugs/
  └── deployment-issues/
```

## Efficiency Best Practices

**Run independent operations in parallel.** When multiple commands or tool calls don't depend on each other, execute them simultaneously:
- Read multiple files in a single tool call batch
- Run lint and typecheck in parallel where possible

**Use targeted searches instead of reading full files.**
- Use `grep` to find function signatures or patterns
- Use `glob` to find files by pattern
- Only read the specific sections you need

**Minimize round-trips.** Chain related git operations:
```bash
# Good: single command chain
git add file1 file2 && git commit -m "message" && git push -u origin branch
```

## Temp Directories

Use `mktemp -d -t temp.local -p $PWD/.claude/` for temporary files. Files matching `.claude/*.local.*` are gitignored.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite 7
- **UI**: MUI (Material UI) v7, React Bootstrap
- **State**: Redux Toolkit + React Redux
- **Routing**: React Router v7
- **Backend**: Firebase Cloud Functions (Node 22), TypeScript
- **Database/Auth**: Firebase Firestore + Firebase Auth
- **Hosting**: Firebase Hosting
- **Payments**: Stripe (Embedded Checkout)
- **Observability**: LogRocket
- **Package manager**: npm
- **Node**: 22

## Initial Setup

```bash
git clone git@github.com:OronNadiv/belmontrunners.com.git
cd belmontrunners.com
npm install --legacy-peer-deps
```

### Environment Setup

```bash
cp .env.example .env
# Fill in Firebase and other API keys — request from project owner
```

Required env vars (see `.github/workflows/deploy-to-firebase.yaml` for the full list):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_STRIPE_PUBLIC_KEY`

## Common Commands

### Frontend (run from repo root)

```bash
npm start                   # Start Vite dev server
npm run build               # Production build
npm run preview             # Preview production build locally
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues
npm run format              # Fix formatting with Prettier
npm test                    # Run tests once (vitest run)
npm run test:watch          # Run tests in watch mode
npm run deploy:hosting      # Build + deploy to Firebase Hosting
npm run deploy:functions    # Deploy Cloud Functions
```

### Functions (run from `functions/` directory)

```bash
cd functions
npm run build               # ESLint + TypeScript compile (runs both)
npm run lint                # ESLint only
npm run deploy              # Deploy functions via Firebase CLI
npm run logs                # Stream Firebase function logs
npm run serve               # Local emulator
```

## Required Checks Before Finalizing Changes

**Agents MUST run the relevant checks before finalizing any code change:**

```bash
# Frontend changes
npm run lint                # Must pass
npm run build               # Must pass
npm test                    # Must pass

# Functions changes
cd functions && npm run build   # Runs ESLint + TypeScript — must pass
```

## Monitoring CI/CD After Push

**After pushing changes or creating a PR, monitor the CI/CD pipeline.**

The single workflow is `deploy-to-firebase.yaml` which runs on push to `main`. For PRs, you can check status via:

```bash
# List recent workflow runs for current branch
gh run list --branch $(git branch --show-current)

# Watch a specific run
gh run watch

# View logs for a failed run
gh run view <run-id> --log-failed
```

The workflow:
1. `npm install --legacy-peer-deps` (frontend)
2. `npm run build` (Vite frontend build)
3. `cd functions && npm install --legacy-peer-deps`
4. `firebase deploy --only hosting`
5. `firebase deploy --only functions`

## Code Style

### ESLint

Both frontend (`src/`) and functions (`functions/src/`) use `@typescript-eslint` with React plugin. Run `npm run lint` to check, `npm run lint:fix` to auto-fix.

### Prettier

```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true
}
```

Run `npm run format` from repo root to format all files.

### TypeScript

- Avoid `any`, use proper types
- Functions code compiles via `tsc` — no type errors allowed
- Frontend uses Vite's TypeScript support

## Project Structure

```
belmontrunners.com/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-based page components
│   ├── redux/              # Redux Toolkit slices and store
│   ├── firebase/           # Firebase SDK init + helpers
│   └── utils/              # Helper functions
├── functions/
│   └── src/                # Cloud Functions TypeScript source
│       ├── index.ts        # Function entry points
│       ├── generateICal.ts # iCal feed generation
│       ├── stripe.ts       # Stripe checkout integration
│       └── ...
├── public/                 # Static assets
├── firebase.json           # Firebase Hosting rewrites + config
└── .github/
    └── workflows/
        └── deploy-to-firebase.yaml
```

## Redux Patterns

```typescript
// Use Redux Toolkit's createSlice
const slice = createSlice({
  name: 'feature',
  initialState,
  reducers: { /* ... */ },
})

// Typed hooks
const dispatch = useAppDispatch()
const value = useAppSelector(state => state.feature.value)
```

## Testing

Framework: **Vitest** (v4) with globals enabled — `it`, `expect`, `describe` are available without imports.

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode for development
```

Tests live next to the source files they cover: e.g. `membershipUtils.spec.ts` alongside `membershipUtils.ts`.

When adding new utility logic or fixing bugs, add or update a corresponding `.spec.ts` file.

## Security

### Sensitive Data

1. Never commit `.env` files (use `.env.example`)
2. Firebase API keys go in GitHub Actions secrets — never hardcode
3. Stripe keys: use `VITE_STRIPE_PUBLIC_KEY` (public) only in frontend; secret keys are Cloud Function environment config
4. Run `npm audit` periodically

### Common Vulnerabilities

- **XSS**: Sanitize any user-generated HTML
- **Exposed Secrets**: Never log or expose API keys
- **Firebase Rules**: Firestore/Storage security rules are the last line of defense — review on schema changes

## Deployment

### CI/CD

**`.github/workflows/deploy-to-firebase.yaml`**

- Triggers on push to `main`
- Builds frontend with Vite and deploys to Firebase Hosting
- Deploys Cloud Functions

There are no staging or sandbox environments — all merges to `main` go directly to production.

### Manual Deploy

```bash
# Deploy just hosting (after building)
npm run deploy:hosting

# Deploy just functions
npm run deploy:functions

# Deploy everything manually
firebase deploy --force
```

## Git Workflow

### Branch Naming

- `feature/description` or `feat/description`
- `fix/description`
- `hotfix/description`

### Commit Messages

Use conventional commits:

```
feat: Add Google Maps location picker to event form
fix: Filter empty spreadsheet rows from iCal feed
refactor: Extract Stripe checkout into separate module
```

### Pull Requests

1. Keep PRs focused and reasonably sized
2. Include: what changed, why, how to test
3. Ensure lint and build pass
4. Squash merge preferred

## Troubleshooting

| Issue | Solution |
|---|---|
| `npm install` fails | Try `npm install --legacy-peer-deps` |
| Build fails | Check `VITE_*` env vars are set, run `npm run lint` first |
| Functions won't deploy | Run `cd functions && npm run build` to check for TS/lint errors |
| Firebase CLI not found | `npm install -g firebase-tools` |
| iCal feed issues | Check Google Sheets CSV export URL; run `npm run generateICalCMD` locally |
| LogRocket not recording | Verify `VITE_LOGROCKET_APP_ID` env var is set |

## Quick Reference

| Task | Command |
|---|---|
| Start dev server | `npm start` |
| Production build | `npm run build` |
| Lint frontend | `npm run lint` |
| Fix lint issues | `npm run lint:fix` |
| Format code | `npm run format` |
| Build functions | `cd functions && npm run build` |
| Deploy hosting | `npm run deploy:hosting` |
| Deploy functions | `npm run deploy:functions` |
| Run tests | `npm test` |
| Run tests (watch) | `npm run test:watch` |
| **Verify before commit** | `npm run lint && npm run build && npm test` |
