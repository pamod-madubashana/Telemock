# AGENTS.md
## Purpose
This repository is a Vite + React + TypeScript frontend wrapped by Tauri, with a Rust backend in `src-tauri/`.
Use this file as the working guide for coding agents in `E:\User\Documents\Repositories\projects\Telemock`.

## Repo Layout
- `src/`: React app source.
- `src/components/mockgram/`: app-specific chat UI.
- `src/components/ui/`: shadcn/Radix component wrappers.
- `src/data/`: mock data and BotFather logic.
- `src/test/`: Vitest tests and setup.
- `src-tauri/`: Tauri app, Rust backend, and packaging config.
- `src-tauri/src/lib.rs`: main Rust logic and Rust tests.
- `src-tauri/tauri.conf.json`: desktop window/build config.

## Tooling Summary
- Package manager: `npm` (`package-lock.json` is present).
- Frontend: React 18, TypeScript, Vite, Tailwind CSS.
- UI libraries: Radix UI, shadcn-style components, `lucide-react`.
- Frontend tests: Vitest, Testing Library, `@testing-library/jest-dom`.
- Desktop shell: Tauri 2.
- Rust stack: `axum`, `tokio`, `rusqlite`, `tower-http`.

## Commands
### Install
- `npm install`
- `cargo fetch --manifest-path src-tauri/Cargo.toml`

### Frontend Dev
- `npm run dev` - starts Vite on port `3000`.
- `npm run preview` - previews the production frontend build.

### Desktop Dev
- `npm run tauri dev` - starts the Tauri app against the local Vite server.

### Build
- `npm run build` - production frontend build.
- `npm run build:dev` - development-mode frontend build.
- `npm run tauri build` - production desktop build.

### Lint
- `npm run lint`

### Frontend Tests
- `npm run test` - runs the full Vitest suite once.
- `npx vitest` - watch mode.
- `npx vitest run` - direct single-run Vitest command.
- `npx vitest run src/test/example.test.ts` - run one test file.
- `npx vitest run src/test/example.test.ts -t "should pass"` - run one named test.

### Rust Tests
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `cargo test --manifest-path src-tauri/Cargo.toml user_messages_enter_and_leave_the_update_queue -- --exact`
- `cargo test --manifest-path src-tauri/Cargo.toml bot_messages_are_visible_in_the_ui_snapshot -- --exact`

### Formatting
- `npx prettier --write src/**/*.{ts,tsx,css}` - format React-side source.
- `cargo fmt --manifest-path src-tauri/Cargo.toml` - format Rust code.

## Preferred Agent Workflow
- Default to `npm`, not `yarn`, `pnpm`, or `bun`.
- Use `npx vitest run <file>` for focused frontend verification.
- Use `cargo test --manifest-path src-tauri/Cargo.toml <name> -- --exact` for focused Rust verification.
- Use `npm run tauri dev` for desktop-only bugs.
- Do not edit generated output like `dist/`, `node_modules/`, or Tauri build artifacts.

## Rules Files
- No `.cursor/rules/` directory was found.
- No `.cursorrules` file was found.
- No `.github/copilot-instructions.md` file was found.
- There are currently no repo-specific Cursor or Copilot rules to merge into this file.

## Frontend Code Style
### Imports
- Put third-party imports first.
- Use `@/` alias imports for modules under `src/`.
- Use relative imports for sibling files in the same feature folder.
- Keep import sections compact; add blank lines only when they improve readability.
- Use `import type` when only a type is needed.

### Formatting
- Follow Prettier formatting for TS, TSX, CSS, and Markdown.
- Use double quotes in TS/TSX files.
- Keep semicolons.
- Let Prettier wrap dense JSX props, arrays, and long objects.

### React Patterns
- Prefer function components.
- Use named exports for reusable components.
- Use default exports for route/page modules like `src/App.tsx` and `src/pages/Index.tsx`.
- Define a local props interface close to the component.
- Keep hooks at the top of the component.
- Use guard clauses for empty or invalid UI states.
- Keep one-off render helpers local to the file.

### Types
- The repo is not fully strict (`strict: false`, `noImplicitAny: false`), but new code should still be explicit.
- Add explicit types for exported APIs, props, shared data models, and state with non-obvious shape.
- Prefer union types for discriminated state.
- Prefer `Record<string, T>` when the code models a keyed object map.
- Avoid `any` unless integration constraints make it unavoidable.

### Naming
- Components, interfaces, and type aliases: `PascalCase`.
- Functions, variables, hooks, and helpers: `camelCase`.
- Component files usually use `PascalCase.tsx`.
- Utility and config files usually use lower-case names.

### State and Data Flow
- Prefer local state with `useState`, `useCallback`, and `useEffect` for UI interactions.
- Keep reusable mock or state-machine data in `src/data/`.
- Pass behavior down through typed props and callbacks.
- Compute display-only values close to the render site unless reused widely.

### Styling
- Use Tailwind utility classes for component styling.
- Reuse CSS variables from `src/index.css` and tokens from `tailwind.config.ts`.
- Use `cn` from `@/lib/utils` for conditional classes.
- Preserve existing shadcn/Radix composition in `src/components/ui/`.
- Keep layout changes aligned with the existing Telegram-style interface unless a redesign is requested.

### Error Handling
- Use early returns for invalid states.
- Do not silently swallow errors that affect behavior.
- Surface readable user-facing failures when practical.
- Handle rejected promises explicitly in async browser code.

### Frontend Testing
- Frontend tests live under `src/test/`.
- Shared setup is in `src/test/setup.ts`.
- Prefer descriptive `describe` and `it` names.
- Add targeted tests near the changed behavior rather than broad snapshots.

## Rust Code Style
### Structure
- Keep `src-tauri/src/main.rs` thin; put real logic in `src-tauri/src/lib.rs`.
- Group related request structs, response structs, and helpers together.
- Prefer small helper functions for serialization, normalization, and DB access.

### Formatting and Naming
- Follow `cargo fmt` output exactly.
- Functions and variables: `snake_case`.
- Structs and enums: `PascalCase`.
- Constants: `SCREAMING_SNAKE_CASE`.

### Error Handling
- Return `Result<_, ApiError>` from fallible request-handling paths.
- Use shared constructors like `ApiError::bad_request` and `ApiError::internal`.
- Convert lower-level errors with `map_err(...)` instead of panicking.
- Reserve `expect(...)` for tests or unrecoverable startup failures.

### Database and API Behavior
- Keep SQL explicit and readable.
- Preserve Telegram-style envelope shapes and error wording when touching the simulator API.
- Reuse existing normalization and serialization helpers before introducing new response paths.

### Rust Testing
- Rust tests live at the bottom of `src-tauri/src/lib.rs` under `#[cfg(test)]`.
- Prefer focused tests that cover one queue, state transition, or API behavior.
- Use `AppState::in_memory(...)` when possible for isolated tests.

## Agent Notes
- This repo may have unrelated uncommitted changes; do not revert work you did not create.
- When touching both UI and Rust, keep the contract between the frontend and local simulator consistent.
- If you add scripts, tests, or repo rules, update this file so future agents inherit the new workflow.
