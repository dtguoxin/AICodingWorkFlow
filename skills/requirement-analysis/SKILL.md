---
name: requirement-analysis
description: Analyze raw requirement documents and produce structured requirement analysis artifacts. Stage 1 is completed by a single requirement owner and outputs are stored in the shared space for all team members to access. Parses Markdown, Word, or PDF inputs, generates understanding-confirmation.md for human validation, then produces analysis-report.md, subreq-breakdown.md (with owner assignments), and common-modules.md. Use when the user provides a requirement document, asks to analyze requirements, break down requirements into sub-requirements, or start the requirement analysis phase of the AI Coding workflow.
---

# Requirement Analysis

## Purpose

Transform unstructured requirement documents into structured, actionable analysis artifacts stored in the shared space. This skill ensures AI understanding is validated by humans before proceeding to technical design.

**Stage 1 is completed by a single requirement owner** and outputs are stored in `shared/{req-id}/01-requirement/` for all team members to access.

## Trigger Scenarios

- User **pastes or uploads** a requirement document directly in the chat (text, Markdown, Word, PDF)
- User provides a requirement document already placed in `shared/{req-id}/01-requirement/raw/`
- User says "analyze this requirement" or "start requirement analysis"
- User wants to break down a requirement into sub-requirements
- User has run `/ai-workspace-init` to initialize the project environment and now wants to start the first requirement

## Input

The requirement can be provided in **two ways**:

**Option A — Direct Input (Recommended)**: User pastes text or uploads a file directly in the chat. The skill will **auto-provision** the directory structure, persist the document, and register the requirement in `index.json`.

**Option B — File Path**: Raw requirement document(s) already exist in `ai-workspace/shared/{req-id}/01-requirement/raw/`.

Additional context (optional): tech stack, architecture constraints

## Workflow

### Step 1: Load Project Context

Before analyzing requirements, load the project-level configuration:

1. **Read `.meta/config/skill-overrides/requirement-analysis.yaml`** (project overrides)
   - Check `document-language` for generated document language
   - Check `mandatory-sections` — ensure all are included in analysis-report.md
   - Check `require-permissions-analysis` — if true, permissions section is mandatory
   - Check `require-owner-assignment` — if true, every sub-requirement must have an owner

2. **Read `.meta/tech-stack.json`** (project tech stack)
   - Note frontend/backend frameworks for context when analyzing requirements
   - Consider tech stack constraints during feasibility assessment

3. **Fallback**: If no project config exists, use defaults from this SKILL.md

### Step 2: Auto-Provision Raw Document

Determine how the requirement was provided and ensure it is persisted in the shared space.

**Case A: User provided document directly (paste or attachment)**

1. **Generate `req-id`**:
   - Read `.meta/index.json` to find the next sequence number
   - Format: `REQ-{YYYY}-{NNN}` (e.g., `REQ-2026-003`)

2. **Create directory structure**:
   ```
   ai-workspace/shared/{req-id}/
   └── 01-requirement/
       └── raw/
   ```

3. **Persist the document**:
   - If pasted text → save as `shared/{req-id}/01-requirement/raw/requirement.md`
   - If uploaded file → save with original filename in `shared/{req-id}/01-requirement/raw/`

4. **Register in `.meta/index.json`**:
   ```json
   {
     "req-id": "{req-id}",
     "owner": "TBD",
     "year": "{yyyy}",
     "title": "{inferred from document or TBD}",
     "status": "pending",
     "priority": null,
     "milestone": null,
     "target-release": null,
     "releases": [],
     "epic": null,
     "shared-path": "shared/{req-id}",
     "personal-spaces": [],
     "created-at": "{timestamp}",
     "updated-at": "{timestamp}",
     "completed-at": null,
     "archived-at": null,
     "archive-path": null
   }
   ```

5. **Report to user**:
   ```
   ✅ Auto-provisioned workspace for {req-id}
   📄 Document saved to: shared/{req-id}/01-requirement/raw/{filename}
   📝 Requirement registered in index.json (status: pending)
   ```

**Case B: User referenced an existing file path**

1. Verify the file exists at the given path
2. Extract `req-id` from the path
3. If the requirement is not registered in `index.json`, register it with status `pending`
4. Proceed directly to parsing

**Case C: No document provided**

1. Ask the user to provide the requirement document (paste text or upload file)

### Step 3: Parse Raw Document

1. Read the requirement document from the `shared/{req-id}/01-requirement/raw/` directory
2. Extract text content (support Markdown natively; for Word/PDF, use available parsing tools)
3. Identify requirement type: [New / Iteration]

### Step 4: Generate Understanding Confirmation

Create `understanding-confirmation.md` in `shared/{req-id}/01-requirement/`:

```markdown
---
req-id: {req-id}
title: {inferred title}
owner: {owner or TBD}
target-release: TBD
milestone: TBD
epic: null
created-at: {timestamp}
generated-by: requirement-analysis
status: draft
---

# Requirement Understanding Confirmation

## Basic Info
- Requirement Title: {extracted or inferred title}
- Source: {document source}
- Type: [New / Iteration]

## AI Understanding Summary
{3-5 sentences summarizing the core requirement}

## Key Capabilities
1. {key capability 1}
2. {key capability 2}
3. {key capability 3}

## Open Questions
- [ ] {question 1}
- [ ] {question 2}

## Understanding Consistency Confirmation
- [ ] Product Manager / Requirement Owner confirms AI understanding is correct
- [ ] If there are deviations, please add below:
```

**Critical**: Stop here and ask the user to review `understanding-confirmation.md`. Do not proceed to Step 5 until the user confirms understanding is correct.

### Step 5: Generate Detailed Analysis Report

After user confirmation, create `analysis-report.md` in `shared/{req-id}/01-requirement/`:

```markdown
---
req-id: {req-id}
title: {requirement title}
owner: {owner or TBD}
target-release: TBD
milestone: TBD
epic: null
created-at: {timestamp}
generated-by: requirement-analysis
status: confirmed
---

# Requirement Analysis Report

## 1. Overview
{Detailed description of the requirement}

## 2. Business Impact
- Affected modules: {affected modules}
- Affected users: {affected users}
- Business process changes: {process changes}

## 3. Permissions and Compliance
- Access permissions: {access permissions}
- Data permissions: {data permissions}
- Compliance requirements (if any): {compliance requirements}

## 4. Classification
- Type: [New / Iteration]
- Priority: [P0/P1/P2/P3]
- Urgency: [Critical/High/Medium/Low]

## 5. Reference Cases
{Industry standard case analysis}

## 6. Brainstorming Notes
{Brainstorming points from AI}

## 7. Risk Assessment
- Technical risks: {technical risks}
- Business risks: {business risks}
- Dependency risks: {dependency risks}
```

### Step 6: Generate Sub-Requirement Breakdown

Create `subreq-breakdown.md` in `shared/{req-id}/01-requirement/`:

```markdown
---
req-id: {req-id}
title: {requirement title}
owner: {owner or TBD}
target-release: TBD
milestone: TBD
epic: null
created-at: {timestamp}
generated-by: requirement-analysis
status: confirmed
---

# Sub-Requirement Breakdown

## Original Requirement
REQ-ID: {req-id}
Title: {requirement title}

## Sub-Requirement List

### subreq-001: {title}
- **Description**: {description}
- **Priority**: {P0/P1/P2}
- **Dependencies**: none / depends on subreq-XXX
- **Estimated Complexity**: [Simple/Medium/Complex]
- **Associated Requirement Section**: {relevant section}
- **Owner**: {git-username}

### subreq-002: {title}
...

## Sub-Requirement Dependency Graph
```
subreq-001 → subreq-003
subreq-002 → subreq-003
```

## Owner Assignment Summary

| Sub-Requirement | Owner | Role |
|----------------|-------|------|
| subreq-001 | {user} | {frontend/backend/fullstack} |
| subreq-002 | {user} | {frontend/backend/fullstack} |
```

**Granularity rule**: Each sub-requirement must be independently actionable for the technical-design phase.

**Owner assignment**: If the user has not specified owners, leave the Owner field as `TBD` and prompt the user to assign.

### Step 7: Identify Common/Reusable Modules

Create `common-modules.md` in `shared/{req-id}/01-requirement/`:

```markdown
---
req-id: {req-id}
title: {requirement title}
owner: {owner or TBD}
target-release: TBD
milestone: TBD
epic: null
created-at: {timestamp}
generated-by: requirement-analysis
status: confirmed
---

# Common / Reusable Module Identification

## Reusable Modules

### Module 1: {name}
- **Current Location**: {file path}
- **Description**: {description}
- **Reuse Suggestion**: Direct reuse / Minor adaptation / Abstract to common component
- **Involved Sub-requirements**: subreq-001, subreq-002

## Suggested Abstracted Common Modules

### Module A: {name}
- **Usage Scenario**: {scenario}
- **Suggested Abstract Location**: {location}
- **Involved Sub-requirements**: {subreq list}
```

### Step 8: Update Index Status

Update the requirement entry in `.meta/index.json`:

1. **Status**: `pending` → `in-progress`
2. **Owners**: If sub-requirement owners are now known, update the `personal-spaces` entries with their assigned sub-requirements
3. **Metadata fields** (if inferred from analysis):
   - `priority`: Set from `analysis-report.md` classification (P0/P1/P2/P3)
   - `milestone`: Set if user or analysis has identified a milestone
   - `target-release`: Set if user or analysis has identified a target release
   - `epic`: Set if this requirement belongs to a known epic
4. **Timestamps**: Update `updated-at`

### Step 9: Report Completion

Inform the user:
- All generated files and their locations (in the shared space)
- Summary of sub-requirements identified and owner assignments
- Recommended next step:
  - If owners are assigned: each owner proceeds to `technical-design` for their sub-requirement
  - If owners are TBD: assign owners first, then proceed to technical design

## Quality Gates

Before marking complete, verify:
- [ ] `understanding-confirmation.md` was generated and confirmed by user
- [ ] `analysis-report.md` covers business impact, permissions, and requirement classification
- [ ] `subreq-breakdown.md` has independent, well-defined sub-requirements
- [ ] `subreq-breakdown.md` includes owner assignments for each sub-requirement
- [ ] `common-modules.md` identifies at least one reusable or abstractable module
- [ ] All outputs use Markdown format
- [ ] All outputs are stored in the shared space

## Example

### Example A: Direct Input (Auto-Provisioning)

**User input:**
> 【用户粘贴了一段需求描述或上传了 PRD 文件】
> 请分析这个需求：我们需要重构用户登录模块，支持手机号+验证码登录，同时保留原有的账号密码登录方式...

**Skill execution:**
1. Detect direct input → auto-provision workspace
2. Generate `REQ-2026-003` → create `shared/REQ-2026-003/01-requirement/raw/requirement.md`
3. Register in `index.json` (status: pending, owner: TBD)
4. Report: "✅ Auto-provisioned workspace for REQ-2026-003. Document saved."
5. Parse the document
6. Generate `understanding-confirmation.md` in shared space and ask user to confirm
7. After confirmation, generate `analysis-report.md`, `subreq-breakdown.md`, `common-modules.md`
8. Update index status to `in-progress`
9. Report: "Analysis complete for REQ-2026-003. Identified 3 sub-requirements..."

### Example B: Existing File Path

**User input:**
> Please analyze this requirement document: `ai-workspace/shared/REQ-2026-001/01-requirement/raw/login-refactor.docx`

**Skill execution:**
1. Detect file path → verify file exists
2. Parse the Word document
3. Generate `understanding-confirmation.md` in shared space and ask user to confirm
4. After confirmation, generate `analysis-report.md`, `subreq-breakdown.md`, `common-modules.md` in shared space
5. Update index status
6. Report: "Analysis complete. Identified 3 sub-requirements (subreq-001: UI refactor [owner: lisi], subreq-002: API update [owner: wangwu], subreq-003: permission logic [owner: zhangsan]). All artifacts stored in shared space. Each owner can now proceed to technical design in their personal workspace."
