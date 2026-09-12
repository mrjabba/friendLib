# Playwright E2E Testing Plan with Clerk
## Goal
Set up authenticated E2E tests using Playwright + Clerk without compromising security.
## Current State
- Smoke tests exist at `tests/smoke.spec.ts` (basic page-load checks only)
- Unit test mocks at `test/mocks/clerk.ts` (not used by E2E)
- No `@clerk/testing` package installed
## Security Requirements
- Use **dev instance** API keys only (`pk_test_*`, `sk_test_*`)
- Create a **dedicated test user** in Clerk Dashboard with username/password
- Never use production/live keys in tests
- Store test credentials in `.env.local` (add to `.gitignore`)
## Implementation Steps
### 1. Install Dependencies
```bash
pnpm add -D @clerk/testing
2. Create Global Setup File
Create playwright/global.setup.ts:
- Call clerkSetup() to obtain testing token
- Sign in test user programmatically using clerk.signIn()
- Save auth state to playwright/.clerk/user.json
- Use password strategy with test user credentials
3. Update Playwright Config
Modify playwright.config.ts:
- Add globalSetup pointing to ./playwright/global.setup.ts
- Create a "global setup" project that runs first
- Configure authenticated projects to depend on global setup
- Set storageState to use saved auth state file
4. Create Authenticated Tests
Create new test files (e.g., tests/authenticated.spec.ts) that:
- Load stored auth state automatically via project config
- Test protected routes and authenticated flows
Key Clerk Testing Concepts
- Testing Token: Bypasses Clerk's bot detection that blocks automated requests
- storageState: Persists session cookies/localStorage for reuse across tests (faster)
- clerk.signIn(): Programmatic sign-in without UI interaction (supports password, phone_code, email_code)
Environment Variables Needed
Add to .env.local:
CLERK_PUBLISHABLE_KEY=pk_test_xxx...
CLERK_SECRET_KEY=sk_test_xxx...
E2E_CLERK_USER_USERNAME=testuser
E2E_CLERK_USER_PASSWORD=testpassword
Files to Create/Modify
- playwright/global.setup.ts (new)
- playwright.config.ts (modify)
- .env.local (add test credentials)
- tests/authenticated.spec.ts (new - optional)
References
- Clerk Playwright Testing Docs (https://clerk.com/docs/guides/development/testing/playwright/overview)
- Test Authenticated Flows (https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows)
