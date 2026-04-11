# AGENTS.md

## Purpose

Use this file as the operating guide for coding agents working in `E:\User\Documents\Repositories\projects\Telemock`.
Telemock is a Vite + React + TypeScript frontend wrapped by Tauri, with the desktop/backend simulator in Rust under `src-tauri/`.

## Stack Summary

- Package manager: `npm`
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- UI: Radix UI, shadcn-style wrappers, `lucide-react`, `sonner`
- Frontend tests: Vitest, Testing Library, `jsdom`
- Desktop shell: Tauri 2
- Backend/simulator: Rust, `axum`, `tokio`, `rusqlite`, `tower-http`
- PTB helper: `test/test.py`

## Repo Layout

- `src/` - React app source
- `src/pages/` - route-level pages such as `Index.tsx`
- `src/components/mockgram/` - Telegram-style product UI
- `src/components/ui/` - shared shadcn/Radix wrappers
- `src/data/` - mock chats, messages, BotFather logic, shared frontend models
- `src/assets/` - frontend images
- `src/test/` - Vitest tests and setup
- `src/index.css` - global tokens and animation styles
- `src-tauri/src/lib.rs` - main Rust logic and Rust tests
- `src-tauri/src/main.rs` - thin Tauri entrypoint
- `src-tauri/icons/` - generated icons; avoid manual edits unless regenerating icons
- `test/test.py` - local `python-telegram-bot` script for simulator testing

## Rule Files

- No `.cursor/rules/` directory was found.
- No `.cursorrules` file was found.
- No `.github/copilot-instructions.md` file was found.
- There are currently no repo-specific Cursor or Copilot rules to merge.

## Install And Setup

- `npm install`
- `cargo fetch --manifest-path src-tauri/Cargo.toml`
- Optional PTB helper setup: create `test/.venv/` and run `pip install python-telegram-bot`

## Dev Commands

### Frontend

- `npm run dev` - start Vite dev server on port `3000`
- `npm run preview` - preview the production frontend build

### Desktop

- `npm run tauri dev` - run the Tauri app against the local frontend dev server

### PTB Helper

- `python test/test.py` - run the PTB bot against the local Telemock simulator
- `python -m py_compile test/test.py` - syntax-check the PTB helper

## Build, Lint, And Format

- `npm run build` - production frontend build
- `npm run build:dev` - development-mode frontend build
- `npm run tauri build` - production desktop build
- `npm run lint` - run ESLint for the frontend
- `npx prettier --write AGENTS.md src/**/*.{ts,tsx,css}` - format Markdown and frontend source
- `cargo fmt --manifest-path src-tauri/Cargo.toml` - format Rust code

## Test Commands

### Frontend Tests

- `npm run test` - run the full Vitest suite once
- `npm run test -- src/test/example.test.ts` - run one frontend test file via the package script
- `npx vitest` - watch mode
- `npx vitest run` - direct single-run Vitest invocation
- `npx vitest run src/test/example.test.ts` - run one test file
- `npx vitest run src/test/example.test.ts -t "should pass"` - run one named frontend test

### Rust Tests

- `cargo test --manifest-path src-tauri/Cargo.toml` - run all Rust tests
- `cargo test --manifest-path src-tauri/Cargo.toml --lib --no-run` - compile Rust tests without running them
- `cargo test --manifest-path src-tauri/Cargo.toml user_messages_enter_and_leave_the_update_queue -- --exact` - run one exact Rust test
- `cargo test --manifest-path src-tauri/Cargo.toml bot_messages_are_visible_in_the_ui_snapshot -- --exact` - run one exact Rust test

## Preferred Agent Workflow

- Default to `npm`; do not switch to `yarn`, `pnpm`, or `bun`.
- Prefer focused verification over full-suite runs when the task is localized.
- For frontend-only work, usually run `npm run build` and the smallest relevant Vitest command.
- For Rust-only work, usually run `cargo fmt` and a focused `cargo test` command.
- For simulator/PTB integration work, validate both Rust changes and `python -m py_compile test/test.py`.
- Use `npm run tauri dev` when the issue depends on the desktop shell or runtime wiring.
- Do not edit generated output such as `dist/`, `node_modules/`, or Tauri build artifacts.
- If scripts, tooling, tests, or rules change, update this file in the same task.

## Frontend Code Style

### Imports

- Put third-party imports first.
- Use `@/` alias imports for modules under `src/`.
- Use relative imports for sibling files inside the same feature folder.
- Keep import groups compact; add blank lines only when they improve readability.
- Use `import type` when a symbol is only used as a type.

### Formatting

- Follow Prettier formatting for TS, TSX, CSS, and Markdown.
- Use double quotes in TS/TSX files.
- Keep semicolons.
- Let Prettier wrap long JSX props, arrays, and objects.
- Prefer ASCII unless the file already depends on Unicode UI copy.

### Types

- The repo is not fully strict: `noImplicitAny` is false and `strictNullChecks` is false.
- Still add explicit types for exported APIs, props, shared models, and non-obvious state.
- Prefer unions for discriminated UI states.
- Prefer `Record<string, T>` for keyed maps.
- Avoid `any` unless integration constraints truly require it.

### Naming

- Components, interfaces, and type aliases: `PascalCase`
- Functions, variables, hooks, and helpers: `camelCase`
- React component files: usually `PascalCase.tsx`
- Utility/config files: usually lowercase

### React Patterns

- Prefer function components.
- Use named exports for reusable components.
- Use default exports for route/page modules such as `src/pages/Index.tsx`.
- Keep hooks near the top of the component body.
- Use guard clauses for invalid or empty UI states.
- Keep one-off helpers local unless clearly shared.
- Favor small composable components over large mixed-responsibility files.

### Styling

- Use Tailwind utility classes for component styling.
- Reuse tokens from `src/index.css` and `tailwind.config.ts`.
- Use `cn` from `@/lib/utils` for conditional classes.
- Preserve existing shadcn/Radix composition in `src/components/ui/`.
- Keep layout changes aligned with the Telegram-style interface unless a redesign is requested.

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

### Structure And Naming

- Keep `src-tauri/src/main.rs` thin; put core logic in `src-tauri/src/lib.rs`.
- Group related request structs, response structs, handlers, and helpers together.
- Functions and variables: `snake_case`
- Structs and enums: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Error Handling And API Behavior

- Follow `cargo fmt` output exactly.
- Return `Result<_, ApiError>` from fallible request-handling paths.
- Use shared constructors such as `ApiError::bad_request` and `ApiError::internal`.
- Convert lower-level errors with `map_err(...)` instead of panicking.
- Reserve `expect(...)` for tests or unrecoverable startup failures.
- Keep SQL explicit and readable.
- Preserve Telegram-style envelope shapes and error wording when changing the simulator API.
- Reuse existing normalization and serialization helpers before adding new response paths.

### Rust Testing

- Rust tests live at the bottom of `src-tauri/src/lib.rs` under `#[cfg(test)]`.
- Prefer focused tests that cover one queue, state transition, or API behavior.
- Use `AppState::in_memory(...)` where possible for isolated tests.

## Agent Notes

- The worktree may contain unrelated user changes; do not revert work you did not create.
- Stage only files relevant to the task unless the user explicitly asks for everything.
- Check formatting before committing.
- Prefer concise commit messages that explain the purpose of the change.
