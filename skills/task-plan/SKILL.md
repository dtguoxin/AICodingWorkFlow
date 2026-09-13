---
name: task-plan
description: Generate executable task plans from sub-requirement technical design documents (sub-design.md). Each sub-requirement owner independently generates their task plan based on their own sub-design.md. Breaks down technical implementation into role-specific tasks, defines task dependencies and execution order, and produces plan.md, task-spec.md, and role-{frontend|backend|fullstack}.md. Use when the technical design phase is complete, the user asks for a task plan or execution plan, or when transitioning from design to implementation.
---

# Task Plan

## Purpose

Transform a sub-requirement's technical design into an executable, role-specific task plan with clear dependencies, execution order, and step-by-step implementation guidance.

**Stage 3 is independently executed by each sub-requirement owner** based on their own `sub-design.md`.

## Trigger Scenarios

- User says "generate task plan" or "create execution plan"
- `technical-design` skill has completed and `sub-design.md` is available
- User asks to break a technical design into development tasks
- Transitioning from design to implementation

## Input

- Your own `sub-design.md` from `users/{your-user}/{req-id}/02-technical-design/subreq-{id}/`
- `acceptance-criteria.md` from `users/{your-user}/{req-id}/02-technical-design/`
- Other owners' `sub-design.md` (read-only, for understanding cross-subreq dependencies)
- `subreq-breakdown.md` from `shared/{req-id}/01-requirement/` (for dependency relationships and owner assignments)

## Workflow

### Step 1: Load Project Configuration

Before generating the task plan, load the project-level configuration:

1. **Read `.meta/config/skill-overrides/task-plan.yaml`** (project overrides)
   - Check `max-tasks-per-subreq` — do not exceed this limit
   - Check `require-milestones` — if true, milestones section is mandatory
   - Check `task-granularity` — adjust task size accordingly (small/medium/large)
   - Check `require-dependency-graph` — if true, include dependency graph
   - Check `require-cross-subreq-deps` — if true, track cross-subreq dependencies
   - Check `available-roles` — only include roles present in this project

2. **Read `.meta/tech-stack.json`** (project tech stack)
   - Note frontend/backend frameworks to determine relevant roles
   - Consider tech stack when estimating task complexity

3. **Fallback**: If no project config exists, use defaults from this SKILL.md

### Step 2: Identify Tasks from Design

Analyze your `sub-design.md` to identify implementation tasks:

1. Review the file change list in `sub-design.md`
2. Group changes by role (frontend/backend/fullstack)
3. Identify natural task boundaries (one logical Git Commit per task)

**Granularity rule**: Each task should correspond to one logical, complete Git Commit. Avoid tasks that are too large (hard to review) or too small (high management overhead).

### Step 3: Define Task Dependencies

Determine dependencies between tasks:

- Task B depends on Task A if B cannot start until A is complete
- Frontend tasks often depend on backend API tasks
- Database schema tasks typically precede data layer tasks
- Cross-subreq dependencies: check if your task depends on another owner's work

### Step 4: Prepare Personal Workspace Directory

Before generating task plans, ensure the personal workspace directory exists. The `ai-workspace-init` skill does **not** create personal spaces — they are created on-demand by each stage Skill.

1. Determine the current user's personal workspace path: `users/{git-username}/{yyyy}/{req-id}/`
2. Check if `03-task-plan/` exists under this path
3. If not, create the directory structure:
   ```
   users/{git-username}/{yyyy}/{req-id}/
   └── 03-task-plan/
   ```
4. Report: "Personal workspace prepared at `users/{user}/{req-id}/03-task-plan/`."

### Step 5: Generate Task Plan Overview

Create `users/{your-user}/{req-id}/03-task-plan/plan.md`:

```markdown
# Task Plan

REQ-ID: {req-id}
Sub-requirement: subreq-{id}
Owner: {your-user}

## Task List

| Task ID | Task Name | Role | Priority | Dependencies | Associated Sub-req | Associated Criterion |
|---------|-----------|------|----------|-------------|--------------------|---------------------|
| task-001 | {name} | frontend | P0 | none | subreq-001 | AC-001 |
| task-002 | {name} | backend | P0 | none | subreq-001 | AC-001 |
| task-003 | {name} | frontend | P1 | task-001 | subreq-001 | AC-002 |

## Task Dependency Graph

```
task-001 → task-003
         ↘
task-002 → task-004
```

## Execution Order

1. Phase 1: task-001, task-002 (parallel)
2. Phase 2: task-003 (depends on Phase 1)
3. Phase 3: task-004 (depends on Phase 2)

## Cross-Subreq Dependencies

| My Task | Depends On | Owner | Status |
|---------|-----------|-------|--------|
| task-003 | subreq-002 API | colleague-a | Not started |

## Key Milestones

- Milestone 1: {description} ({task list})
- Milestone 2: {description} ({task list})
```

### Step 6: Generate Task Specifications

For each task, create `users/{your-user}/{req-id}/03-task-plan/task-{id}/task-spec.md`:

```markdown
# Task Specification

## Basic Info
- Task ID: task-{id}
- Task Name: {name}
- Associated Sub-requirement: subreq-{id}
- Role: [frontend/backend/fullstack]
- Priority: [P0/P1/P2]

## Goal
{One-sentence goal}

## Input
- Technical design reference: {sub-design.md section}
- Previous task outputs: {previous task outputs}

## Execution Steps

### Step 1: {step description}
- Target file: {file path}
- Operation type: [Add/Modify/Delete]
- Modification details: {details}

### Step 2: {step description}
...

## Completion Criteria
- [ ] Code implementation complete
- [ ] Local build/compilation passes
- [ ] Follows coding standards

## Associated Acceptance Criteria
- AC-001: {criterion}
```

### Step 7: Generate Role-Specific Execution Documents

For each task, create role-specific guidance:

**Frontend**: `users/{your-user}/{req-id}/03-task-plan/task-{id}/role-frontend.md`
```markdown
# Frontend Execution Document

## Task Context
- Page/Component: {component}
- Interaction flow: {flow}
- APIs involved: {endpoints}

## UI Implementation Points
- Component structure: {structure}
- State management: {state approach}
- Styling: {styling}

## API Integration
- Endpoint: {endpoint}
- Response handling: {handler}
- Error handling: {error handling}

## Notes
- Responsive: {responsive notes}
- Performance: {performance notes}
```

**Backend**: `users/{your-user}/{req-id}/03-task-plan/task-{id}/role-backend.md`
```markdown
# Backend Execution Document

## Task Context
- Module: {module}
- Services involved: {services}
- Database changes: {schema changes}

## API Implementation Points
- Route: {route}
- Parameter validation: {validation rules}
- Business logic: {logic}
- Response format: {response format}

## Data Layer Operations
- New tables/fields: {changes}
- SQL migrations: {migrations}
- Index optimization: {indexes}

## Notes
- Transactions: {transactions}
- Concurrency: {concurrency}
- Logging: {logging}
```

### Step 8: Report Completion

Inform the user:
- Total number of tasks planned
- Execution phases and parallelization opportunities
- Any cross-subreq dependencies that need coordination
- Recommended next step: proceed to `implementation` phase task by task

## Quality Gates

- [ ] `plan.md` contains complete task list, dependency graph, and execution order
- [ ] Each task has an independent `task-spec.md`
- [ ] Tasks are grouped by role with corresponding `role-{role}.md`
- [ ] Task granularity satisfies "one Git Commit" principle
- [ ] All tasks link to at least one acceptance criterion
- [ ] Cross-subreq dependencies are documented

## Example

**User input:**
> Generate task plan for subreq-001

**Skill execution:**
1. Read my `sub-design.md` from `users/alice/REQ-2026-001/02-technical-design/subreq-001/`
2. Read colleague's `sub-design.md` for cross-subreq dependencies
3. Identify 4 tasks: 2 frontend, 2 backend
4. Determine dependencies: frontend tasks depend on backend API tasks
5. Generate `plan.md`, 4 task-spec.md files, 4 role-specific docs
6. Report: "Task plan complete. 4 tasks across 3 phases. task-001 and task-002 can run in parallel. Cross-subreq dependency identified: task-003 depends on subreq-002 API (owner: bob). Proceed to implementation."
