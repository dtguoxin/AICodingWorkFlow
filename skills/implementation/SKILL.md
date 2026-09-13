---
name: implementation
description: Execute code implementation according to task specifications. Reads coding standards, performs code modifications following existing project style, generates change-summary.md with diff preview for human review, and only writes changes to actual files after human confirmation. Each sub-requirement owner independently implements their assigned tasks. Use when a task plan is ready, the user asks to implement a specific task, or during the code implementation phase of the AI Coding workflow.
---

# Implementation

## Purpose

Execute code implementation task by task, with a mandatory change preview and human confirmation step before writing to actual code files.

**Stage 4 is independently executed by each sub-requirement owner** for their assigned tasks.

## Trigger Scenarios

- User says "implement task-001" or "start implementation"
- `task-plan` skill has completed and task specifications are available
- User provides a task ID and asks for code implementation
- Transitioning from planning to code execution

## Input

- `task-spec.md` from `users/{your-user}/{req-id}/03-task-plan/task-{id}/`
- `role-{frontend|backend|fullstack}.md` from `users/{your-user}/{req-id}/03-task-plan/task-{id}/`
- Project coding standards (from `.meta/coding-standard.md` or project root)
- Project codebase

## Workflow

### Step 1: Load Project Configuration

Before making any changes, load the project-level configuration in priority order:

1. **Read `.meta/config/skill-overrides/implementation.yaml`** (project overrides)
   - Check `comment-language` (default: zh)
   - Check `require-tests` (default: false)
   - Check `max-function-lines` (default: 50)
   - Check `ignore-patterns`
   - Check `file-header-template`

2. **Read `.meta/coding-standard.md`** (auto-generated style summary)
   - Follow detected rules: quotes, semicolons, indentation, naming conventions
   - Follow path aliases if defined

3. **Read `.meta/toolchain.json`** (available commands)
   - Note lint/type-check/test commands for verification

4. **Fallback**: If no project config exists, infer style from existing codebase

### Step 2: Prepare Personal Workspace Directory

Before generating implementation artifacts, ensure the personal workspace directory exists. The `ai-workspace-init` skill does **not** create personal spaces — they are created on-demand by each stage Skill.

1. Determine the current user's personal workspace path: `users/{git-username}/{yyyy}/{req-id}/`
2. Check if `04-implementation/` exists under this path
3. If not, create the directory structure:
   ```
   users/{git-username}/{yyyy}/{req-id}/
   └── 04-implementation/
       └── task-{id}/
   ```
4. Report: "Personal workspace prepared at `users/{user}/{req-id}/04-implementation/`."

### Step 3: Execute Code Modifications

Follow the `task-spec.md` step by step:

1. Read target files from the codebase
2. Make modifications according to the specification
3. Follow the loaded coding standard rules (not hardcoded conventions)
4. Add necessary comments in the configured comment language
5. If `file-header-template` is configured, prepend it to new files
6. Respect `max-function-lines` constraint — warn if a function exceeds the limit

### Step 4: Generate Change Summary

**Do not write changes to actual files yet.**

Create `users/{your-user}/{req-id}/04-implementation/task-{id}/change-summary.md`:

```markdown
# Change Summary

## Task Info
- Task ID: task-{id}
- Task Name: {name}
- Executed by: {your-user}
- Timestamp: {timestamp}

## Change Overview
- New files: {count}
- Modified files: {count}
- Deleted files: {count}

## File Change Details

### 1. {file path}
- **Operation**: [Add/Modify/Delete]
- **Reason**: {reason}
- **Key Changes**: {key changes}
- **Impact**: {impact}

## Code Diff (Key Sections)

```diff
// File: {path}
+ {added line}
- {removed line}
```

## Self-Checklist
- [ ] Code follows project coding standards
- [ ] Necessary comments added
- [ ] No debug code remaining
- [ ] No sensitive information leaked
- [ ] Architecture baseline compliance verified

## Human Confirmation
- [ ] Change summary reviewed and confirmed correct
- [ ] Agree to write above changes to code files
```

### Step 5: Generate Affected Files List

Create `users/{your-user}/{req-id}/04-implementation/task-{id}/affected-files.md`:

```markdown
# Affected Files List

## New Files
| No. | File Path | Description |
|-----|-----------|-------------|
| 1 | {path} | {description} |

## Modified Files
| No. | File Path | Change Type | Description |
|-----|-----------|-------------|-------------|
| 1 | {path} | Logic change / Refactor / Format | {description} |

## Deleted Files
| No. | File Path | Description |
|-----|-----------|-------------|
| 1 | {path} | {description} |

## Dependency Changes
{package.json, config files, etc.}
```

### Step 6: Human Confirmation

Present the change summary to the user and ask for confirmation:

> Change summary generated. Please review `04-implementation/task-{id}/change-summary.md`.
> 
> Key changes:
> - {N} new files
> - {N} modified files
> - {N} deleted files
>
> After confirming no errors, I will write the changes to actual code files.

**Wait for explicit user confirmation before proceeding.**

### Step 7: Write Changes to Code Files

After user confirmation:

1. Write all modifications to actual code files
2. Verify files are syntactically valid (if language server is available)
3. Update the task status in the workspace

### Step 8: Report Completion

Inform the user:
- List of files written
- Confirmation that changes are now in the codebase
- Recommended next step: proceed to `testing` phase for this task

## Critical Safety Rule

**AI must never write code changes directly to files without generating a change-summary.md and receiving human confirmation first.** This is the core safety mechanism preventing AI from accidentally breaking the codebase.

## Quality Gates

- [ ] `change-summary.md` generated with all changed files and reasons
- [ ] Code diff preview generated showing key changes
- [ ] Human has confirmed the change summary and agreed to write
- [ ] Code follows project coding standards
- [ ] Necessary comments added
- [ ] No debug code or sensitive information leaked

## Example

**User input:**
> Implement task-001

**Skill execution:**
1. Read task-spec.md and role-frontend.md from my workspace
2. Load coding standards
3. Modify files in memory (do not write yet)
4. Generate change-summary.md and affected-files.md
5. Ask user: "Change summary generated. Please confirm before writing to code."
6. After user says "confirm": write changes to actual files
7. Report: "task-001 implementation complete. 2 files modified: src/components/LoginForm.tsx, src/services/auth.ts. Proceed to testing."
