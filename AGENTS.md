# AGENTS.md

## Purpose

This repository is a Vite + React + TypeScript frontend wrapped by Tauri, with the desktop/backend logic in Rust under `src-tauri/`.
Use this file as the operating guide for coding agents working in `E:\User\Documents\Repositories\projects\Telemock`.

## Stack Summary

- Package manager: `npm`
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- UI libraries: Radix UI, shadcn-style wrappers, `lucide-react`
- State/data: local React state plus mock data/state machines in `src/data/`
- Frontend tests: Vitest, Testing Library, `@testing-library/jest-dom`, `jsdom`
- Desktop shell: Tauri 2
- Rust backend: `axum`, `tokio`, `rusqlite`, `tower-http`

## Repository Layout

- `src/` - React app source
- `src/pages/` - route-level screens such as `Index.tsx`
- `src/components/mockgram/` - app-specific Telegram-style UI
- `src/components/ui/` - shared shadcn/Radix wrappers
- `src/data/` - mock chats, messages, BotFather logic, shared frontend models
- `src/assets/` - frontend images such as avatars and badges
- `src/test/` - Vitest tests and setup
- `src/index.css` - global tokens, utilities, and animation styles
- `src-tauri/src/lib.rs` - main Rust logic and Rust tests
- `src-tauri/src/main.rs` - thin Tauri entrypoint
- `src-tauri/tauri.conf.json` - desktop config
- `src-tauri/icons/` - generated app icons; avoid hand-editing generated variants unless the task is specifically icon regeneration

## Rules Files

- No `.cursor/rules/` directory was found.
- No `.cursorrules` file was found.
- No `.github/copilot-instructions.md` file was found.
- There are currently no repo-specific Cursor or Copilot rules to merge.

## Install And Setup

- `npm install`
- `cargo fetch --manifest-path src-tauri/Cargo.toml`

## Dev Commands

### Frontend

- `npm run dev` - start Vite dev server on port `3000`
- `npm run preview` - preview the production frontend build

### Desktop

- `npm run tauri dev` - run the Tauri app against the local frontend dev server

## Build Commands

- `npm run build` - production frontend build
- `npm run build:dev` - development-mode frontend build
- `npm run tauri build` - production desktop build

## Lint Commands

- `npm run lint`

## Frontend Test Commands

- `npm run test` - run the full Vitest suite once
- `npm run test -- --runInBand` - avoid unless diagnosing environment issues; default parallel run is preferred
- `npx vitest` - watch mode
- `npx vitest run` - direct single-run Vitest invocation
- `npx vitest run src/test/example.test.ts` - run one test file
- `npx vitest run src/test/example.test.ts -t "should pass"` - run one named frontend test

## Rust Test Commands

- `cargo test --manifest-path src-tauri/Cargo.toml` - run all Rust tests
- `cargo test --manifest-path src-tauri/Cargo.toml user_messages_enter_and_leave_the_update_queue -- --exact` - run one named Rust test
- `cargo test --manifest-path src-tauri/Cargo.toml bot_messages_are_visible_in_the_ui_snapshot -- --exact` - run one named Rust test

## Formatting Commands

- `npx prettier --write AGENTS.md src/**/*.{ts,tsx,css}` - format Markdown and frontend source
- `cargo fmt --manifest-path src-tauri/Cargo.toml` - format Rust code

## Preferred Agent Workflow

- Default to `npm`; do not switch to `yarn`, `pnpm`, or `bun`.
- Prefer focused verification over full-suite runs when the task is localized.
- Use `npx vitest run <file>` for focused frontend verification.
- Use `cargo test --manifest-path src-tauri/Cargo.toml <test_name> -- --exact` for focused Rust verification.
- Use `npm run tauri dev` for desktop-only issues that depend on the shell.
- Do not edit generated output such as `dist/`, `node_modules/`, or Tauri build artifacts.
- If scripts, tooling, tests, or repo rules change, update this file in the same task.

## Frontend Code Style

### Imports

- Put third-party imports first.
- Use `@/` alias imports for modules under `src/`.
- Use relative imports for sibling files inside the same feature folder.
- Keep import blocks compact; add blank lines only when they improve readability.
- Use `import type` when a symbol is only used as a type.

### Formatting

- Follow Prettier formatting for TS, TSX, CSS, and Markdown.
- Use double quotes in TS/TSX files.
- Keep semicolons.
- Let Prettier wrap long props, objects, and arrays.
- Prefer ASCII unless the file already depends on Unicode characters for UI copy.

### React Patterns

- Prefer function components.
- Use named exports for reusable components.
- Use default exports for route/page modules such as `src/App.tsx` and `src/pages/Index.tsx`.
- Define prop interfaces close to the component that uses them.
- Keep hooks at the top of the component body.
- Use guard clauses for empty or invalid UI states.
- Keep one-off helpers local to the file unless they are shared.
- Favor small, composable presentational components over large mixed-responsibility files.

### Types

- The repo is not fully strict (`strict: false`, `noImplicitAny: false`), but new code should still be explicit.
- Add explicit types for exported APIs, props, shared models, and non-obvious state.
- Prefer unions for discriminated state.
- Prefer `Record<string, T>` when modeling keyed maps.
- Avoid `any` unless integration constraints make it truly necessary.

### Naming

- Components, interfaces, and type aliases: `PascalCase`
- Functions, variables, hooks, and helpers: `camelCase`
- React component files: usually `PascalCase.tsx`
- Utility/config files: usually lowercase

### State And Data Flow

- Prefer local state with `useState`, `useCallback`, and `useEffect` for UI interactions.
- Keep reusable mock/state-machine data in `src/data/`.
- Pass behavior down through typed props and callbacks.
- Compute display-only values near the render site unless reused broadly.
- Preserve the contract between frontend mock data and the Rust simulator when touching both.

### Styling

- Use Tailwind utility classes for component styling.
- Reuse tokens from `src/index.css` and `tailwind.config.ts`.
- Use `cn` from `@/lib/utils` for conditional classes.
- Preserve existing shadcn/Radix composition in `src/components/ui/`.
- Keep layout changes aligned with the Telegram-style interface unless a redesign is explicitly requested.

### Error Handling

- Use early returns for invalid states.
- Do not silently swallow errors that affect behavior.
- Surface readable user-facing failures when practical.
- Handle rejected promises explicitly in async browser code.

### Frontend Testing

- Frontend tests live under `src/test/`.
- Shared test setup is in `src/test/setup.ts`.
- Prefer descriptive `describe` and `it` names.
- Add focused tests near the changed behavior rather than broad snapshots.

## Rust Code Style

### Structure

- Keep `src-tauri/src/main.rs` thin; put core logic in `src-tauri/src/lib.rs`.
- Group related request structs, response structs, and helpers together.
- Prefer small helpers for normalization, serialization, and DB access.

### Formatting And Naming

- Follow `cargo fmt` output exactly.
- Functions and variables: `snake_case`
- Structs and enums: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Error Handling

- Return `Result<_, ApiError>` from fallible request-handling paths.
- Use shared constructors such as `ApiError::bad_request` and `ApiError::internal`.
- Convert lower-level errors with `map_err(...)` instead of panicking.
- Reserve `expect(...)` for tests or unrecoverable startup failures.

### Database And API Behavior

- Keep SQL explicit and readable.
- Preserve Telegram-style envelope shapes and error wording when touching the simulator API.
- Reuse existing normalization and serialization helpers before adding new response paths.

### Rust Testing

- Rust tests live at the bottom of `src-tauri/src/lib.rs` under `#[cfg(test)]`.
- Prefer focused tests that cover one queue, state transition, or API behavior.
- Use `AppState::in_memory(...)` where possible for isolated tests.

## Agent Notes

- The worktree may contain unrelated user changes; do not revert work you did not create.
- When asked to commit, stage only the files relevant to the requested task unless the user explicitly asks for everything.
- Check whether touched files need formatting before committing.
- Prefer concise commit messages that explain the purpose of the change.
