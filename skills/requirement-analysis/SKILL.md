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

1. **Read the requirement document** from the `shared/{req-id}/01-requirement/raw/` directory
2. **Encoding validation**:
   - Attempt to read the first 200 characters with UTF-8
   - If garbled characters detected, try GBK/GB2312 and warn the user: "File encoding may be GBK. Consider converting to UTF-8 for optimal parsing."
3. **Document size assessment**:
   - Calculate total character count
   - If > 15 KB: proceed to **fragmented parsing** (Step 3A)
   - If <= 15 KB: proceed to **full parsing** (Step 3B)

#### Step 3A: Fragmented Parsing (for documents > 15 KB)

Large documents must be processed in fragments to avoid context window overflow:

1. **Split by top-level sections** (## headers):
   - Identify all ## sections in the document
   - Assign each section a fragment ID (frag-001, frag-002, ...)
2. **Parse each fragment independently**:
   - For each fragment, extract: key fields, business rules, data sources, role permissions
   - Generate a fragment summary (≤ 500 chars per fragment)
3. **Handle wide tables** (> 8 columns):
   - Convert wide Markdown tables to structured text descriptions
   - Each row becomes: "【{角色}】权限：查询✓ 清空✓ 填写✓ ..."
4. **Merge fragment summaries**:
   - Combine all fragment summaries into a unified document map
   - Identify cross-references between fragments
5. **Proceed to Step 4** with the unified document map

#### Step 3B: Full Parsing (for documents <= 15 KB)

1. Extract text content (support Markdown natively; for Word/PDF, use available parsing tools)
2. Identify requirement type: [New / Iteration]
3. Proceed directly to Step 4

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

## Non-Functional Requirements Checklist（新增）
Scan the document for the following and check if applicable:
- [ ] **Data Audit / Logging**: "留痕", "审计", "操作日志", "记录所有操作"
- [ ] **Attachment Management**: "附件", "上传", "文件", "下载" (if checked, note: size limit, type validation, virus scan)
- [ ] **Data Archival**: "归档", "持久化", "存储", "审计追溯"
- [ ] **Performance Requirements**: "并发", "响应时间", "吞吐量"
- [ ] **Security Compliance**: "数据权限", "加密", "脱敏"
- [ ] **Version Reserve**: "预留", "后续版本", "630", "930", "迭代"

## System-Level Modules Checklist（新增）
- [ ] **Permission System**: Number of roles identified: ___. Complexity: High/Medium/Low.
- [ ] **Code Value / Master Data**: Dropdown options, branch codes, dictionary tables identified: ___
- [ ] **External Interfaces**: Number of external data sources (system-displayed fields): ___
- [ ] **Notification Service**: "提醒", "弹窗", "邮件", "短信", "站内信"
- [ ] **Report Generation**: "报告", "表单", "PDF", "Word", "导出"

## Open Questions
- [ ] {question 1}
- [ ] {question 2}

## Understanding Consistency Confirmation
- [ ] Product Manager / Requirement Owner confirms AI understanding is correct
- [ ] All Non-Functional Requirements and System-Level Modules have been reviewed
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

## 2. Data Model & Field Definitions

### 2.1 Data Source Inventory
| Data Source Name | Type | Field Count | Data Origin | Manual Entry |
|-----------------|------|-------------|-------------|--------------|
| {source 1} | System Display / Manual | {count} | {origin table} | Yes/No |

### 2.2 Key Fields Requiring Manual Entry
List ALL fields that require manual input (not system-displayed):
| Field Name | Control Type | Required | Code Values | Validation Rules |
|-----------|-------------|----------|-------------|-----------------|
| {field} | Dropdown/Text/Date | Yes/No | {values} | {rules} |

### 2.3 Data Source Independence Assessment
| Data Source | External System | Interface Complexity | Risk Level |
|------------|----------------|---------------------|-----------|
| {source} | {system name} | High/Medium/Low | {risk} |

## 3. Business Impact
- Affected modules: {affected modules}
- Affected users: {affected users}
- Business process changes: {process changes}

## 4. Permissions and Compliance
- Access permissions: {access permissions}
- Data permissions: {data permissions}
- Compliance requirements (if any): {compliance requirements}

## 5. Classification
- Type: [New / Iteration]
- Priority: [P0/P1/P2/P3]
- Urgency: [Critical/High/Medium/Low]

## 6. Reference Cases
{Industry standard case analysis}

## 7. Brainstorming Notes
{Brainstorming points from AI}

## 8. Dynamic Text Generation Templates (if applicable)

### 8.1 Template Inventory
| Module | Sub-Scene | Template Example | Field Placeholders | Complexity |
|--------|-----------|-----------------|-------------------|-----------|
| {module} | {sub-scene} | {template text} | {count} | High/Medium/Low |

### 8.2 Template Complexity Assessment
- Total templates: {count}
- Conditional branches: {count}
- Field mappings: {count}
- Business-adjustable: Yes/No

## 9. Version Iteration Planning

### 9.1 Current Version Scope (Explicit Exclusions)
- Features NOT included in this version: {list}

### 9.2 Reserved Requirements for Future Versions
| Reserved Feature | Target Version | Current Version Reserves |
|-----------------|---------------|------------------------|
| {feature} | {version} | {data model fields / interface stubs} |

## 10. Risk Assessment
- Technical risks: {technical risks}
- Business risks: {business risks}
- Dependency risks: {dependency risks}
```

### Step 6: Generate Sub-Requirement Breakdown

#### Step 6.1: Pre-Split Checklist — System-Level Modules

Before splitting by business modules, scan the entire requirement for **system-level concerns** that MUST become independent sub-requirements regardless of document length:

| Check Item | Trigger Keywords | If True |
|-----------|------------------|---------|
| **Permission System** | "角色", "权限", "岗位", "RBAC", "菜单", "按钮" | Create `subreq-permission`: permission matrix, role-menu mapping, data-scope rules |
| **Audit Log** | "留痕", "审计", "操作日志", "记录" | Create `subreq-audit`: operation logging, data change tracking |
| **Attachment Management** | "附件", "上传", "文件", "下载" | Create `subreq-attachment`: file upload, size/type validation, virus scan, storage |
| **Code Value / Master Data** | "码值", "下拉框", "选项", "分行", "字典" | Create `subreq-masterdata`: code tables, dropdown options, branch codes |
| **Version Reserve** | "预留", "后续版本", "630", "930", "迭代" | Create `subreq-reserve`: data model extension fields, interface stubs |
| **External Interface** | "系统反显", "取【", "外围系统", "同步" | Count data sources; each independent external system interface deserves assessment |
| **Data Archival** | "归档", "持久化", "存储", "审计追溯" | Create `subreq-archive`: report/form persistence, retention policy |

**Rule**: If ANY check item is true, it MUST appear as a dedicated sub-requirement. Do NOT absorb system-level modules into business sub-requirements.

#### Step 6.2: Splitting Dimension Strategy

Use the following priority order. Never merge items from different dimensions unless they are trivial (< 3 fields and no independent business rules).

**Priority 1 — Independent Data Source** (highest)
- Each external system data source (customer info, contract info, guarantor info, mortgage info, pledge info) should be independently assessed for interface complexity.

**Priority 2 — Independent Business Module**
- Core business functions that have independent field definitions, business rules, or text generation templates.
- Example: "催收/清收模块" and "抵质押物管理模块" are independent even if they appear on the same page.

**Priority 3 — Independent Page / Entry Point**
- Pages with different query conditions, visible fields, or button permissions must NOT be merged.
- **NEVER merge**: 录入列表页 + 查看列表页 (different visible fields)
- **NEVER merge**: 审批列表页 + 审批提交弹窗 (different responsibilities)
- **NEVER merge**: 抵押信息 + 质押信息 (different data sources)

**Priority 4 — System-Level Service**
- Permission, audit, attachment, code-value, archival services.

**Priority 5 — User Role**
- If a feature set is completely different per role (e.g., 清收管户人 vs 审批人 vs 查看人), consider role-based split.

#### Step 6.3: Granularity Rules

```
Document Size (raw)    →    Expected Sub-Requirement Count
-------------------------------------------------------------
< 5 KB                 →    3 - 5
5 - 15 KB              →    5 - 10
15 - 30 KB             →    10 - 15
30 - 50 KB             →    15 - 25
> 50 KB                →    25+ (consider epic-level grouping)

Additional Rules:
- Each sub-requirement description should be < 1.5 KB. If longer, split further.
- Each sub-requirement should map to ≤ 1 independent business module OR 1 independent data source.
- System-level sub-requirements are counted separately and do not reduce business sub-requirement quotas.
```

#### Step 6.4: Composite Module Special Handling

For modules that contain multiple sub-scenes (e.g., "处置进展" containing 7 sub-scenes):

**Split if ANY of the following is true**:
- The sub-scene has > 3 independent fields with business rules
- The sub-scene has its own dynamic text generation template
- The sub-scene has special data rules (e.g., "past data read-only")
- The sub-scene involves a different business process (e.g., "转让进度" has 8 sequential steps)

**Example from 不良资产 tracking**:
- "处置进展" should NOT be one sub-requirement. It should be split into:
  - subreq-XX1: 诉讼进展
  - subreq-XX2: 核销条件
  - subreq-XX3: 转让进度 (8 steps: communication → assessment → approval → listing → signing → accounting → announcement → handover)
  - subreq-XX4: 债委会进展 (10+ fields, past data read-only)
  - subreq-XX5: 破产程序进展 (15+ fields, court/administrator process)
  - subreq-XX6: 下一步计划
  - subreq-XX7: 其他说明

#### Step 6.5: Generate subreq-breakdown.md

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

**Granularity rule**: Each sub-requirement must be independently actionable for the technical-design phase. If a sub-requirement description exceeds 1.5 KB or covers more than one independent business module / data source, it MUST be split further.

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
