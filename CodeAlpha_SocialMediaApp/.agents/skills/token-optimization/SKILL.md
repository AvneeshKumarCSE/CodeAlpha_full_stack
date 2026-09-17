---
name: token-optimization
description: Guidelines for token budgeting, concise communication, minimal context pollution, and targeted code operations.
---

# Token Optimization & Minimal Context Skill

## Core Principles
1. **Brevity First**: Always be direct and to the point. Avoid lengthy conversational filler, restating user queries, or summarizing already-known facts.
2. **Context Budgeting**: Keep conversation state lean. Do not dump complete file contents when only a small function or block is being discussed or updated.
3. **Targeted Diffs**: Favor surgical edits using precise search/replace or targeted line updates over rewriting whole files.
4. **Command Output Truncation**: When running CLI commands, filter results (e.g. `head -n 20`, `grep`, or flags like `--quiet` / `--silent`) to prevent massive terminal output from flooding the context window.
5. **Batching Operations**: Group related edits or operations logically to minimize back-and-forth roundtrips.
