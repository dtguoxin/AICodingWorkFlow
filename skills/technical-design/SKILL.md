---
name: technical-design
description: Generate detailed technical design documents for sub-requirements based on requirement analysis artifacts. Stage 2 is split into two layers: (A) global architecture baseline check (optional, triggered when architecture changes) producing architecture-delta.md, and (B) sub-requirement detailed design (required for each iteration) producing sub-design.md. Use when the requirement analysis phase is complete, the user asks for a technical design or solution design, or when transitioning from requirement analysis to implementation planning.
---

# Technical Design

## Purpose

Produce codebase-aware technical design documents for each sub-requirement. Stage 2 is split into two layers:

- **Stage 2-A (Global Architecture Check, Optional)**: Triggered when the requirement affects architecture baseline. Produces `architecture-delta.md`.
- **Stage 2-B (Sub-Requirement Detailed Design, Required)**: Each sub-requirement owner independently produces `sub-design.md` referencing the architecture baseline.

## Trigger Scenarios

- User says "generate technical design" or "design the solution"
- `requirement-analysis` skill has completed and outputs are available
- User provides a sub-requirement ID and asks for its technical design
- Transitioning from requirement analysis to task planning
- User asks to evaluate if a requirement requires architecture baseline changes

## Input

- `analysis-report.md` from `shared/{req-id}/01-requirement/`
- `subreq-breakdown.md` from `shared/{req-id}/01-requirement/`
- `common-modules.md` from `shared/{req-id}/01-requirement/` (optional)
- Architecture baseline: `.meta/architecture/architecture-baseline.md`
- Project codebase (for SearchCodebase)

## Workflow

### Step 1: Load Project Context

Before generating any design, load the project context:

1. **Read `.meta/tech-stack.json`**
   - Note frontend framework, backend framework, ORM, state management, UI library
   - Inject tech stack context into design reasoning

2. **Read `.meta/coding-standard.md`**
   - Note naming conventions, comment language, path aliases
   - Ensure design recommendations align with project style

3. **Read `.meta/architecture/architecture-baseline.md`**
   - Understand module boundaries, interface contracts, data flow rules, public component designs
   - Check baseline status: `DRAFT` / `FROZEN` / `EVOLVING`

4. **Read `.meta/config/skill-overrides/technical-design.yaml`**
   - Check `mandatory-sections` — ensure all are included
   - Check `disabled-sections` — omit these from output
   - Check `require-code-search` — if true, code search is mandatory
   - Check `min-acceptance-criteria`

### Step 2: Determine Architecture Trigger (Stage 2-A Check)

Evaluate if this requirement requires updating the architecture baseline using the checklist:

| Check Item | Trigger? |
|-----------|----------|
| Need to add new core modules? | Yes → trigger Stage 2-A |
| Modify existing interface contracts (params/response format)? | Yes → trigger Stage 2-A |
| Change state management approach? | Yes → trigger Stage 2-A |
| Introduce new cross-module data flow? | Yes → trigger Stage 2-A |
| Only implement within existing module boundaries? | No → skip Stage 2-A |
| Only use existing interfaces and components? | No → skip Stage 2-A |

**If triggered**, proceed to Step 3. **If not triggered**, skip to Step 4.

### Step 3: Generate Architecture Delta (Stage 2-A, Optional)

If the requirement requires architecture baseline changes:

1. Create `.meta/architecture/deltas/{req-id}-architecture-delta.md`:

```markdown
# Architecture Change Delta

REQ-ID: {req-id}
Baseline Version: {current-version}
Status: [DRAFT / UNDER_REVIEW / MERGED / REJECTED]

## Trigger Reason
{Why the baseline needs to change}

## Proposed Changes

### Module Boundary Changes
- {New module or boundary adjustments}

### Interface Contract Changes
- {New or modified interfaces}

### Data Flow Changes
- {New cross-module data flows}

## Impact Assessment
- Affected existing modules: {list}
- Backward compatibility: [Yes / No, migration needed]
- Estimated scope of change: {description}

## Rollback Plan
{How to revert if issues arise}
```

2. Inform the user that an architecture delta has been generated and requires review by the tech lead before proceeding.

3. **Wait for baseline approval** before proceeding to Step 4.

### Step 4: Prepare Personal Workspace Directory

Before generating design documents, ensure the personal workspace directory exists. The `ai-workspace-init` skill does **not** create personal spaces — they are created on-demand by each stage Skill.

1. Determine the current user's personal workspace path: `users/{git-username}/{yyyy}/{req-id}/`
2. Check if `02-technical-design/` exists under this path
3. If not, create the directory structure:
   ```
   users/{git-username}/{yyyy}/{req-id}/
   └── 02-technical-design/
       └── subreq-{id}/
   ```
4. Report: "Personal workspace prepared at `users/{user}/{req-id}/02-technical-design/`."

### Step 5: Generate Sub-Requirement Design (Stage 2-B, Required)

For each sub-requirement assigned to the current user, create `users/{user}/{req-id}/02-technical-design/subreq-{id}/sub-design.md`:

```markdown
# Sub-Requirement Technical Design

## 1. Overview
- Sub-requirement ID: subreq-{id}
- Associated Requirement: REQ-{id}
- Design Goal: {one-sentence goal}

## 2. Architecture Consistency Statement
- [ ] Current design fully conforms to architecture baseline (v{version})
- [ ] Current design deviates from architecture baseline (see Section 7 for details)

**Baseline References**:
- Module boundary: See baseline Section 2.1 "{module name}"
- Interface contract: See baseline Section 3.2 "{interface name}"
- Data flow: See baseline Section 4.1 "{flow name}"
- Public components: See baseline Section 5.3 "{component name}"

## 3. Current State Analysis
{Current code state based on SearchCodebase results}

## 4. Design Details

### 4.1 Core Implementation Approach
{Implementation approach}

### 4.2 Sequence Diagram / Flow Chart (if needed)
{Diagram or step-by-step flow}

### 4.3 Data Model Changes (if any)
{Schema changes}

## 5. File Change List

| Operation | File Path | Description |
|-----------|-----------|-------------|
| Add | {real path} | {reason} |
| Modify | {real path} | {reason} |
| Delete | {real path} | {reason} |

## 6. Interface Design (if any)

### New Interfaces
- Name: {name}
- Method: {GET/POST/PUT/DELETE}
- Parameters: {params}
- Response: {response schema}

### Modified Interfaces
- Name: {name}
- Changes: {changes}

## 7. Deviation from Baseline (if any)

If the design deviates from the architecture baseline, document here:

| Baseline Requirement | Current Design Choice | Reason | Risk |
|---------------------|----------------------|--------|------|
| {baseline rule} | {current choice} | {justification} | {risk} |

> **Note**: If deviations exist, consider whether to trigger the baseline revision process.

## 8. Reusable Methods List

| Method Name | Current Location | Reuse Approach |
|-------------|-----------------|---------------|
| {method} | {file path} | Direct call / Adapted call |

## 9. Risks and Rollback Strategy
- Risk 1: {risk}
  - Mitigation: {mitigation}
  - Rollback: {rollback plan}
```

**Critical Rules for sub-design.md**:
- **DO NOT** repeat baseline architecture content (module boundaries, interface contracts, data flow rules)
- **MUST** reference specific sections of `architecture-baseline.md`
- **MUST** include Architecture Consistency Statement
- **MUST** document any deviations and justify them

### Step 6: Define Acceptance Criteria

Create `users/{user}/{req-id}/02-technical-design/acceptance-criteria.md`:

```markdown
# Test Acceptance Criteria

REQ-ID: {req-id}

## Acceptance Criteria

### AC-001: {criterion description}
- **Associated Sub-requirement**: subreq-001
- **Given**: {precondition}
- **When**: {action}
- **Then**: {expected result}
- **Priority**: [Must / Should / Could]

## Mapping: Acceptance Criteria to Sub-requirements

| Criterion | Sub-requirement | Verification Method |
|-----------|----------------|--------------------|
| AC-001 | subreq-001 | Unit test |
```

### Step 7: Report Completion

Inform the user:
- Whether Stage 2-A was triggered (architecture delta generated?)
- Number of sub-designs generated
- Architecture baseline version referenced
- Number of acceptance criteria defined
- Whether any deviations from baseline were documented
- Recommended next step: proceed to `task-plan` phase

## Quality Gates

- [ ] Architecture baseline was loaded before designing
- [ ] Stage 2-A trigger checklist was evaluated
- [ ] Each sub-requirement has an independent `sub-design.md`
- [ ] `sub-design.md` includes Architecture Consistency Statement
- [ ] `sub-design.md` references real files and methods from SearchCodebase
- [ ] `sub-design.md` does not repeat baseline architecture content
- [ ] File change list clearly specifies add/modify/delete operations
- [ ] `acceptance-criteria.md` contains at least one "Must" level criterion
- [ ] Any deviations from baseline are documented with justification

## Example

**User input:**
> Generate technical design for subreq-001

**Skill execution:**
1. Read `.meta/architecture/architecture-baseline.md` (version: v1.2, status: FROZEN)
2. Evaluate Stage 2-A trigger checklist → no architecture changes required
3. Search codebase for login-related modules
4. Generate `sub-design.md` referencing real files (e.g., `src/services/auth.ts`)
   - Architecture Consistency Statement: confirms design conforms to baseline
   - Baseline references: Module boundary §2.1, Interface contract §3.2
5. Generate `acceptance-criteria.md`
6. Report: "Design complete. Architecture baseline v1.2 referenced. No delta triggered. 4 files to modify, 1 new file to create. 3 acceptance criteria defined. Proceed to task planning."
