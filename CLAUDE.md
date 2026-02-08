# CLAUDE.md

## Project Type

Production code. Must be maintainable.

## Quality Expectations

This codebase will outlive you.
Every shortcut you take becomes someone else's burden.
Every hack compounds into technical debt that slows the whole team down.

You are not just writing code. You are shaping the future of this project.
The patterns you establish will be copied.
The corners you cut will be cut again.

Fight entropy. Leave the codebase better than you found it.

## Purpose

This repo builds a macOS Tauri app (migrated from Electron). Agents should follow this guide for commands, code style, and safe edits.

## Quick Commands (pnpm)

- Install: `pnpm install`
- Dev (Tauri + Vite): `pnpm dev`
- Build (Tauri): `pnpm build`
- Dev (Vite only): `pnpm dev:vite`
- Build (Vite only): `pnpm build:vite`
- Preview: `pnpm preview`
- Lint (oxlint): `pnpm lint`
- Format (oxfmt): `pnpm fmt` (NOT `pnpm format`)
- Typecheck: `pnpm typecheck`
- Test (vitest): `pnpm test`

## Single Test (vitest)

- Run one file: `pnpm vitest path/to/file.test.ts`
- Run one test name: `pnpm vitest -t "test name"`
- Watch one file: `pnpm vitest path/to/file.test.ts --watch`
- Run all tests in a folder: `pnpm vitest path/to/tests/`

## Process Boundaries

- Rust backend (`src-tauri/src/`): app lifecycle, windows, OS integration, filesystem, tray menu
- Renderer (`src/renderer/`): UI, state, interaction (React + Vite)
- Shared (`src/shared/`): types and constants shared between layers
- Renderer communicates with Rust via `@tauri-apps/api` (`invoke`, `listen`, `emit`)

## IPC (Tauri Commands & Events)

- Rust → JS: `app.emit("event_name", payload)` + `listen("event_name", callback)`
- JS → Rust: `invoke<T>("command_name", { args })` + `#[tauri::command]` handler
- API abstraction layer: `src/renderer/tauri-api.ts` (`MaengguApi` interface)
- Rust commands are registered in `src-tauri/src/lib.rs` → `invoke_handler`
- Keep command/event names in `snake_case`

## Security

- Tauri capabilities: `src-tauri/capabilities/default.json` (최소 권한 원칙)
- CSP는 `tauri.conf.json` → `app.security.csp`에서 설정
- Never execute arbitrary strings or remote code
- Rust command에서 사용자 입력 검증 필수

## macOS-Only Notes

- Do not add Windows/Linux specific code unless asked
- Test overlay behavior on macOS window manager only

## Code Style (TypeScript)

- Use `strict` TS where possible
- Prefer `type` over `interface` unless extending
- Use `readonly` for immutable data
- Avoid `any`, prefer `unknown` + narrowing
- Prefer `const` over `let`
- Use `as const` for literals

## Naming

- Files: `kebab-case.ts` (follow folder conventions)
- Types: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` for truly global constants
- React components (renderer): `PascalCase`

## Imports

- Use relative imports within same domain
- Use absolute/alias imports for cross-domain (if configured)
- Group imports by:
  1. Tauri / Node built-ins
  2. External libs
  3. Internal modules
  4. Styles/assets
- Keep imports sorted; avoid deep cross-layer imports

## Formatting (oxfmt)

- Always format before commit
- Don't hand-align columns; let formatter handle it
- Keep line length reasonable; wrap long expressions

## Error Handling

- Use `try/catch` around IPC handlers and filesystem
- Return structured error objects to renderer
- Log errors in main process with context
- Don't swallow errors silently

## State/Storage

- Local-only JSON storage for now
- Keep schema versioned if you evolve it
- Validate on load; fallback to defaults

## Renderer Guidelines

- UI should be lightweight; avoid heavy frameworks unless chosen
- Use requestAnimationFrame for animation loops
- Throttle expensive updates (position, collision)
- Keep component state minimal; derive values

## Asset Handling

- Pixel art sprites should be crisp
- Ensure nearest-neighbor scaling
- Store assets under `resources/` or `src/renderer/assets`

## Testing (vitest)

- Write tests for shared logic and state reducers
- Avoid Tauri integration tests unless required
- Keep tests deterministic; mock time where needed

## Linting (oxlint)

- Fix warnings, not just errors
- Avoid unused vars/imports
- Prefer explicit return types for exported functions

## Commit Checklist

Every commit MUST follow this checklist:

1. `pnpm fmt` — format before commit
2. `pnpm lint` — zero warnings
3. `pnpm test` (or `pnpm vitest run`) — all tests pass
4. **Update `prd.json`** if the commit changes feature status (todo → done, new solution notes, etc.)
5. `git add` only files YOU changed — do NOT stage unrelated diffs (e.g. someone else's formatting)
6. Verify staged files with `git diff --cached --stat` before committing

Other hygiene:

- Don't commit generated files
- Avoid committing secrets or `.env`
- Keep commit messages focused on intent

## When Unsure

- Ask before adding new dependencies
- Ask before introducing new architecture patterns
- Ask before changing build scripts

## Agent Workflow

1. Read relevant files before editing
2. Make smallest necessary change
3. Run lint/format/tests when requested
4. Summarize changes and suggest next steps

## Scripts Reference

If `package.json` differs, update this file:

- `dev`: `tauri dev`
- `build`: `tauri build`
- `dev:vite`: `vite`
- `build:vite`: `tsc && vite build`
- `preview`: `vite preview`
- `lint`: `oxlint .`
- `fmt`: `oxfmt`
- `typecheck`: `tsc -p tsconfig.json`
- `test`: `vitest run`

## Git Workflow

- NEVER push directly to main
- Always create a feature branch: `git checkout -b feat/feature-name`
- Make small, focused commits
- Create PR for review before merging
- Merge via PR, not direct push

## Forbidden

- Don't push directly to main (use PR)
- Don't use `rm -rf`; use `trash` instead
- Don't bypass pre-commit hooks unless asked
- Don't edit unrelated files

## Notes

- This guide is for agents; keep it updated as the repo evolves
