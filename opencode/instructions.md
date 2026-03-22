### Testing Requirements

For every new feature, change, or refactor in this repository, the agent must also generate corresponding tests using Vitest and React Testing Library. No feature is considered complete unless tests are included.

#### General Requirements

- All new components must include component tests.
- All new server actions must include server action tests.
- Any change to existing logic must include updated or new tests.
- Tests must follow best practices:
  - Use React Testing Library for UI tests.
  - Use Vitest for unit and integration tests.
  - Mock Clerk authentication using a shared test setup file.
  - Mock Next.js router using `vi.mock`.
  - Prefer `getByRole`, `getByLabelText`, and `getByText` over `data-testid`.

#### Database Strategy for Tests

The test environment must **never** connect to the production Neon database used by Vercel.

Instead:

1. **Integration tests must use a local Postgres instance running in Docker.**
   - The agent must configure a Docker-based Postgres container for test execution.
   - The test database URL must be configurable via environment variables.
   - Drizzle migrations must run before the test suite.
   - Each test must run inside a transaction that is rolled back after completion.
   - No test may write to or read from the production Neon database.

2. **Optional: SQLite may be used for fast unit tests** when Postgres-specific behavior is not required.

#### CI Requirements

- The agent must ensure the test suite runs in CI.
- CI must start a Postgres service (Docker or Testcontainers).
- CI must run migrations before tests.
- Coverage reporting must be enabled with reasonable thresholds (e.g., 80%).

#### Deliverables for Every Feature

For every request, the agent must output:

1. The feature implementation.
2. The associated tests.
3. Any required updates to test utilities, mocks, or database setup.
4. Documentation updates when relevant.
