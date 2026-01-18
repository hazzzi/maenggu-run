# AGENTS.md

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

This repo builds a macOS-only Electron app. Agents should follow this guide for commands, code style, and safe edits.

## Quick Commands (pnpm)

- Install: `pnpm install`
- Dev (electron-vite): `pnpm dev`
- Build: `pnpm build`
- Preview (if configured): `pnpm preview`
- Lint (oxlint): `pnpm lint`
- Format (oxfmt): `pnpm format`
- Test (vitest): `pnpm test`

## Single Test (vitest)

- Run one file: `pnpm vitest path/to/file.test.ts`
- Run one test name: `pnpm vitest -t "test name"`
- Watch one file: `pnpm vitest path/to/file.test.ts --watch`
- Run all tests in a folder: `pnpm vitest path/to/tests/`

## Electron-Vite Structure (expected)

- `src/main`        Electron main process
- `src/preload`     Preload scripts (contextBridge)
- `src/renderer`    UI (renderer process)
- `src/shared`      Shared types/constants
- `resources/`      Icons, sprites, assets

## Process Boundaries

- Main process: app lifecycle, windows, OS integration, filesystem
- Preload: bridge safe APIs to renderer
- Renderer: UI, state, interaction
- Avoid direct Node APIs in renderer; use preload IPC instead

## IPC

- Prefer typed, explicit IPC channels
- Use request/response naming:
  - `app:getState`, `app:saveState`
- Validate payloads at boundaries
- Keep IPC handlers in `src/main/ipc`

## Security

- Disable `nodeIntegration` in renderer
- Enable `contextIsolation`
- Expose minimal APIs via `contextBridge`
- Never execute arbitrary strings or remote code

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
  1) Node/Electron
  2) External libs
  3) Internal modules
  4) Styles/assets
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
- Avoid Electron integration tests unless required
- Keep tests deterministic; mock time where needed

## Linting (oxlint)

- Fix warnings, not just errors
- Avoid unused vars/imports
- Prefer explicit return types for exported functions

## Commit Hygiene (if asked)

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

## Placeholder Scripts (assumed)

If `package.json` differs, update this file:

- `dev`: `electron-vite dev`
- `build`: `electron-vite build`
- `preview`: `electron-vite preview`
- `lint`: `oxlint .`
- `format`: `oxfmt .`
- `test`: `vitest`

## Forbidden

- Don't use `rm -rf`; use `trash` instead
- Don't bypass pre-commit hooks unless asked
- Don't edit unrelated files

## Notes

- This guide is for agents; keep it updated as the repo evolves
