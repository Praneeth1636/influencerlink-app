# Dependency Justifications

## Phase 1.3 testing

- `vitest`: unit test runner that fits the Vite/React toolchain and runs quickly in watch mode.
- `@vitejs/plugin-react`: React transform support for Vitest component tests.
- `jsdom`: browser-like DOM environment for React component tests.
- `@testing-library/react`: user-centered React component testing utilities.
- `@testing-library/jest-dom`: accessible DOM matchers for clearer assertions.
- `@testing-library/user-event`: realistic keyboard and pointer interactions in unit tests.
- `msw`: request mocking for networked client/server boundaries without hardcoded fetch shims.
- `@playwright/test`: critical path browser smoke tests for the Next.js app.
