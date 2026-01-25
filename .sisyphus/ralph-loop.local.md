---
active: true
iteration: 1
max_iterations: 20
completion_promise: "DONE"
started_at: "2026-01-25T06:06:37.304Z"
session_id: "ses_42c71e35cffeEUKLcKJL7P9mmB"
---
ulw
@prd.json @progress.txt @AGENTS.md

1. Decide which task to work on next.
   This should be the one YOU decide has the highest priority,
   not necessarily the first in the list.
   
   When choosing the next task, prioritize in this order:
   1. Architectural decisions and core abstractions
   2. Integration points between modules
   3. Unknown unknowns and spike work
   4. Standard features and implementation
   5. Polish, cleanup, and quick wins
   Fail fast on risky work. Save easy wins for later.

2. Check any feedback loops, such as types and tests.
   Before committing, run ALL feedback loops:
   - TypeScript: pnpm run typecheck (must pass with no errors)
   - Tests: pnpm run test (must pass)
   - Lint: pnpm run lint (must pass)
   Do NOT commit if any feedback loop fails. Fix issues first.

3. Keep changes small and focused:
   - One logical change per commit
   - If a task feels too large, break it into subtasks
   - Prefer multiple small commits over one large commit
   - Run feedback loops after each change, not at the end
   Quality over speed. Small steps compound into big progress.

4. Append your progress to the progress.txt file:
   - Task completed and PRD item reference
   - Key decisions made and reasoning
   - Files changed
   - Any blockers or notes for next iteration
   Keep entries concise. Sacrifice grammar for the sake of concision.

5. Make a git commit of that feature.

ONLY WORK ON A SINGLE FEATURE PER ITERATION.

If there are remaining PRD items with passes=false,
continue to the next iteration without signaling completion.

Only output <promise>COMPLETE</promise> when ALL PRD items are complete. ulw
