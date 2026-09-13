---
name: ai-workspace-init
description: Initialize the AI Coding workspace environment for a project. Performs project sensing (tech stack detection, code style harvesting, toolchain validation), generates architecture baseline skeleton, creates dynamic templates, and generates a local README user guide. Use when setting up the ai-workspace directory structure for the first time, or when re-detecting project configurations.
---

# AI Workspace Initialization

## Purpose

Initialize a standardized AI Coding workspace environment with full project awareness:
- **Project sensing**: Auto-detect tech stack, code style, toolchain
- **Architecture baseline**: Generate skeleton baseline if none exists
- **Dynamic templates**: Generate tech-stack-specific artifact templates
- **Local README**: Generate a comprehensive Chinese user guide for team members

**Important**: This skill is purely for **project-level initialization**. It does NOT create requirement workspaces, shared spaces, or personal spaces. Those are created on-demand by `requirement-analysis` when a user provides a requirement document.

## Trigger Scenarios

- User has just copied Skills into the project and runs `/ai-workspace-init` for the first time
- The `ai-workspace/` directory does not exist or is incomplete
- User wants to re-detect tech stack or regenerate configurations (`--re-detect`)
- User says "setup ai workspace" or "initialize project environment"

## Prerequisites

**Pre-condition**: The AI Coding Workflow Skills have been copied into `.qoder/skills/`. Optionally, the distribution package (`ai-coding-workflow.zip`) may have been extracted, providing templates and config skeletons.

No user input is required for basic initialization. The skill will auto-detect everything from the project files.

## Workflow

### Step 1: Environment Self-Check & Repair

When the user invokes `/ai-workspace-init` for the first time, the environment may range from "only Skills copied" to "full distribution package extracted". This step automatically detects the current state and repairs all missing items.

**1.1 Check if ai-workspace exists**

If `ai-workspace/` does not exist at all (user only copied Skills):
1. Create the complete `ai-workspace/` directory structure
2. Search the project for distribution source files (e.g., `ai-coding-workflow/ai-workspace/.meta/templates/`, or templates embedded in Skill directories)
3. If source files found: copy templates and configs into place
4. If source files NOT found: create default skeleton templates and configs from built-in knowledge

If `ai-workspace/` exists but is incomplete (user extracted distribution package):
1. Identify missing directories and files
2. Create missing directories
3. Copy or regenerate missing templates and configs

Required directory structure:
```
ai-workspace/
├── .meta/
│   ├── index.json
│   ├── tech-stack.json              # [generated] detected tech stack
│   ├── coding-standard.md           # [generated] code style summary
│   ├── toolchain.json               # [generated] available commands
│   ├── config/
│   │   ├── project-config.yaml      # project-level overrides
│   │   └── skill-overrides/         # per-skill configuration
│   │       ├── requirement-analysis.yaml
│   │       ├── technical-design.yaml
│   │       ├── task-plan.yaml
│   │       ├── implementation.yaml
│   │       ├── testing.yaml
│   │       └── code-review.yaml
│   ├── architecture/
│   │   ├── architecture-baseline.md
│   │   ├── architecture-baseline-history/
│   │   └── deltas/
│   └── templates/
│       ├── base/                    # generic baseline templates
│       ├── adapters/                # tech-stack adapter fragments
│       └── generated/               # [generated] project-specific templates
├── shared/                          # requirement workspaces created on-demand
├── users/                           # personal workspaces created on-demand
└── archive/                         # archived requirements
```

**1.2 Check template completeness**

- If `.meta/templates/base/` is empty or missing files:
  - Copy from distribution source if available
  - Otherwise, create default baseline templates from built-in knowledge
- If `.meta/templates/adapters/` is empty or missing files:
  - Copy from distribution source if available
  - Otherwise, create default adapter fragments from built-in knowledge

**1.3 Check configuration skeleton completeness**

- If `.meta/config/project-config.yaml` does not exist:
  - Copy from distribution source if available
  - Otherwise, create default skeleton from built-in knowledge
- If `.meta/config/skill-overrides/` is missing any `.yaml` files:
  - Copy from distribution source if available
  - Otherwise, create missing files from built-in knowledge

**1.4 Check index.json**

If `.meta/index.json` does not exist, create the default skeleton:

```json
{
  "version": "2.0",
  "schema": {
    "description": "AI Coding Workspace Requirement Index",
    "last-updated": "{timestamp}"
  },
  "entries": []
}
```

**1.5 Check Skills availability**

Verify `.qoder/skills/` contains all core Skill directories:
- `ai-workspace-init`
- `requirement-analysis`
- `technical-design`
- `task-plan`
- `implementation`
- `testing`
- `code-review`

If any are missing, report to the user that they need to copy the missing Skills.

**1.6 Report self-check results**

Inform the user of the repair actions taken:
```
🔧 环境自检完成：
   - 目录结构：✅
   - 基础模板：✅ (6 个文件)
   - 适配片段：✅ (8 个文件)
   - 配置骨架：✅ (7 个文件)
   - index.json：✅ 已初始化
   - Skill 完整性：✅ (7/7)
```

### Step 2: Detect Tech Stack

If `.meta/tech-stack.json` does not exist or user requests re-detection:

1. **Read manifest files**: `package.json`, `pyproject.toml`, `go.mod`, `pom.xml`
2. **Scan config files**: `vite.config.*`, `next.config.*`, `tsconfig.json`, `turbo.json`, etc.
3. **Detect the following dimensions**:

| Dimension | Detection Source | Example Values |
|-----------|-----------------|---------------|
| Frontend framework | package.json dependencies | React, Vue, Angular, Svelte |
| Backend framework | package.json / pyproject.toml / go.mod | NestJS, Express, FastAPI, Gin, Django |
| Build tool | config files / package.json scripts | Vite, Webpack, Rollup |
| Package manager | lock files | npm, yarn, pnpm, poetry |
| Type system | tsconfig.json / dependencies | TypeScript, Flow, JavaScript |
| UI library | package.json dependencies | Ant Design, Element Plus, Material UI, Tailwind |
| State management | package.json dependencies | Zustand, Redux, Pinia, Vuex |
| ORM/Database | package.json / schema files | Prisma, TypeORM, SQLAlchemy, GORM |
| Testing framework | package.json devDependencies | Vitest, Jest, pytest, go test |
| Monorepo tool | config files | Turborepo, Nx, Lerna |

4. **Generate `.meta/tech-stack.json`**:

```json
{
  "detected-at": "2026-09-13",
  "frontend": {
    "framework": "React",
    "version": "18.x",
    "ui-library": "Ant Design",
    "state-management": "Zustand",
    "build-tool": "Vite",
    "type-system": "TypeScript"
  },
  "backend": {
    "framework": "NestJS",
    "version": "10.x",
    "orm": "Prisma",
    "database": "PostgreSQL"
  },
  "monorepo": {
    "tool": "Turborepo",
    "workspaces": ["apps/web", "apps/api", "packages/ui"]
  },
  "testing": {
    "framework": "Vitest",
    "e2e": "Playwright"
  },
  "package-manager": "pnpm"
}
```

5. **Report detection summary** to user for confirmation.

### Step 3: Harvest Code Style Configuration

If `.meta/coding-standard.md` does not exist:

1. **Read config files**:
   - `.eslintrc*` / `eslint.config.*` → parse rule summary
   - `.prettierrc*` / `prettier.config.*` → parse formatting config
   - `tsconfig.json` → strict mode, path aliases
   - `.editorconfig` → indentation, line endings
   - `pyproject.toml` / `setup.cfg` → Python formatting config

2. **Generate `.meta/coding-standard.md`**:

```markdown
# 项目代码规范摘要（自动生成）

## 来源配置
- ESLint: `.eslintrc.js`
- Prettier: `.prettierrc`
- TypeScript: `tsconfig.json`

## 关键规则
| 规则 | 配置 | 示例 |
|------|------|------|
| 引号 | single | `import React from 'react'` |
| 分号 | 不使用 | `const x = 1` |
| 缩进 | 2 空格 | - |
| 行宽 | 100 字符 | - |
| 命名规范 | camelCase 变量 / PascalCase 组件 | `userName`, `LoginForm` |
| 路径别名 | `@/` -> `src/` | `import Button from '@/components/Button'` |
| 严格模式 | 已启用 | `strict: true` |

## 注释语言
中文（团队约定）
```

### Step 4: Validate Toolchain

If `.meta/toolchain.json` does not exist:

1. **Check package.json scripts** for lint / type-check / format / test commands
2. **Check if test framework is installed** (exists in node_modules or pyproject.toml)
3. **Check if Git is initialized**

4. **Generate `.meta/toolchain.json`**:

```json
{
  "lint-command": "eslint src/",
  "type-check-command": "tsc --noEmit",
  "format-command": "prettier --check src/",
  "test-command": "vitest run",
  "git-initialized": true
}
```

### Step 5: Generate Architecture Baseline Skeleton

If `.meta/architecture/architecture-baseline.md` does not exist:

1. **Select skeleton template** based on tech-stack.json:
   - Frontend project → use frontend baseline skeleton
   - Backend project → use backend baseline skeleton
   - Fullstack project → use combined skeleton

2. **Generate skeleton** with detected values injected (framework name, state management tool, etc.)

3. **Set status to DRAFT** and version to v0.1

4. **Inform user** that a baseline skeleton has been generated and requires review by the tech lead.

### Step 6: Generate Tech-Stack-Specific Templates

If `templates/generated/` is empty or tech-stack has changed:

1. **Read base templates** from `templates/base/`
2. **Load adapter fragments** from `templates/adapters/` matching detected tech stack
3. **Combine** base template + adapter fragments into generated templates
4. **Replace placeholders** (e.g., `{{UI_LIBRARY}}`, `{{STATE_MANAGEMENT}}`) with detected values
5. **Write** generated templates to `templates/generated/`

**Template selection rules**:

| Detected Tech | Adapters to Load |
|--------------|-----------------|
| React | `react-components.md` |
| Vue | `vue-components.md` |
| NestJS / Express | `rest-api.md` |
| GraphQL | `graphql-api.md` |
| Prisma | `prisma-orm.md` |
| pytest | `pytest-testing.md` |

### Step 7: Create Project-Level Config Skeleton

If `.meta/config/project-config.yaml` does not exist:

1. **Generate default config**:

```yaml
project:
  name: "{project-name}"
  tech-stack:
    path: ".meta/tech-stack.json"

skill-overrides:
  requirement-analysis:
    document-language: "zh"
    mandatory-sections: []
    require-permissions-analysis: true
    require-owner-assignment: true

  technical-design:
    mandatory-sections: []
    disabled-sections: []

  task-plan:
    max-tasks-per-subreq: 10
    require-milestones: true
    task-granularity: "small"

  implementation:
    comment-language: "zh"
    require-tests: false
    max-function-lines: 50

  testing:
    min-coverage-percentage: 80
    require-edge-cases: true

  code-review:
    custom-checks: []
```

2. **Inform user** that project config has been created and can be customized.

### Step 8: Create Local README Guide (Chinese)

Create `ai-workspace/README.md` — a comprehensive Chinese user guide for team members. This is the primary documentation for using the AI Coding Workflow within this project.

```markdown
# AI Coding Workflow — 项目使用指南

> 本文档由 `/ai-workspace-init` 自动生成于 {timestamp}
> 适用于本项目的 AI 辅助开发工作流

---

## 一、体系介绍

### 1.1 这是什么

AI Coding Workflow 是一套围绕软件全生命周期的 AI 辅助开发规范，将开发流程拆解为 **6 个标准化阶段**：

1. **需求分析** — 解析原始需求，生成结构化分析文档，确认 AI 理解无误
2. **技术方案** — 分两层：全局架构基线确认（可选）+ 子需求详细设计（必做）
3. **任务计划** — 将子需求拆分为可执行的任务，定义依赖和里程碑
4. **技术实现** — 按任务规范编写代码，生成变更摘要供人工确认
5. **测试验证** — 基于验收标准生成测试用例，运行并报告结果
6. **代码审查** — 三轨审查（自动化检查 + AI 审查 + 人工终审）

### 1.2 解决什么问题

- **多人协作不冲突**：通过空间隔离（shared/ 共享 + users/ 个人）确保并行开发无文件冲突
- **AI 理解可追溯**：每个阶段产出标准化文档，AI 的理解经过人工确认后才进入下一阶段
- **架构不漂移**：项目级架构基线作为单一事实来源，所有方案设计引用基线而非重复描述
- **代码质量可控**：变更摘要预览 + 人工确认 + 测试验证 + 代码审查，四层质量保障

### 1.3 核心原则

- **阶段一（需求分析）由需求负责人统一完成**，产物存入共享空间，全员只读
- **阶段二-B 至阶段六由各子需求负责人独立完成**，产物存入各自个人空间
- **关键人工确认点**：需求理解确认 → 代码变更确认 → 审查终审确认

---

## 二、目录结构详解

本项目已初始化的 AI 工作区位于 `ai-workspace/`，其目录结构如下：

```
ai-workspace/
│
├── README.md                          # 本文件（项目使用指南）
│
├── .meta/                             # 项目级元数据与配置（技术负责人维护）
│   ├── index.json                     # 需求索引：记录所有需求的 ID、负责人、状态
│   ├── tech-stack.json                # [AI 自动生成] 探测到的技术栈信息
│   ├── coding-standard.md             # [AI 自动生成] 代码风格摘要
│   ├── toolchain.json                 # [AI 自动生成] 可用命令清单
│   ├── config/                        # 配置层：项目级 Skill 参数覆盖
│   │   ├── project-config.yaml        # 主配置文件
│   │   └── skill-overrides/           # 各 Skill 专属配置
│   │       ├── requirement-analysis.yaml
│   │       ├── technical-design.yaml
│   │       ├── task-plan.yaml
│   │       ├── implementation.yaml
│   │       ├── testing.yaml
│   │       └── code-review.yaml
│   ├── architecture/                  # 架构基线（项目级单一事实来源）
│   │   ├── architecture-baseline.md   # 当前生效的架构基线
│   │   ├── architecture-baseline-history/  # 历史版本归档
│   │   └── deltas/                    # 架构差异文档（演进期产出）
│   └── templates/                     # 产物模板
│       ├── base/                      # 通用基线模板（6 个，与技术栈无关）
│       ├── adapters/                  # 技术栈适配片段（8 个）
│       └── generated/                 # [AI 自动生成] 项目专属组合模板
│
├── shared/                            # 需求级共享空间（阶段一产物，全员只读）
│   └── {req-id}/                      # 如：REQ-2026-001
│       └── 01-requirement/            # 阶段一：需求分析产物
│           ├── raw/                   # 原始需求文档
│           ├── understanding-confirmation.md   # AI 理解确认（需人工确认）
│           ├── analysis-report.md              # 需求分析报告
│           ├── subreq-breakdown.md             # 子需求分解（含负责人分配）
│           └── common-modules.md               # 公共/可复用模块识别
│
├── users/                             # 个人任务级空间（阶段二至六，按人隔离）
│   └── {git-username}/                # 如：zhangsan
│       └── {yyyy}/                    # 如：2026
│           └── {req-id}/              # 如：REQ-2026-001
│               ├── 02-technical-design/    # 阶段二-B：子需求详细设计
│               │   └── subreq-{id}/
│               │       └── sub-design.md
│               ├── 03-task-plan/           # 阶段三：任务计划
│               │   ├── plan.md
│               │   └── task-{id}/
│               │       ├── task-spec.md
│               │       └── role-{frontend|backend}.md
│               ├── 04-implementation/      # 阶段四：技术实现
│               │   └── task-{id}/
│               │       ├── change-summary.md    # 变更摘要（需人工确认后写代码）
│               │       ├── affected-files.md
│               │       └── diff/
│               ├── 05-testing/             # 阶段五：测试验证
│               │   └── task-{id}/
│               │       ├── test-cases.md
│               │       ├── test-code/
│               │       └── test-report.md
│               └── 06-review/              # 阶段六：代码审查
│                   └── task-{id}/
│                       ├── review-report.md
│                       └── review-checklist.md
│
└── archive/                           # 归档区（已完成的需求移入此处）
    └── {yyyy}/
        └── {req-id}/
```

### 空间类型对比

| 空间 | 路径 | 作用域 | 谁可以写 |
|------|------|--------|---------|
| 元数据层 | `.meta/` | 项目级，所有需求共用 | 技术负责人 |
| 共享层 | `shared/{req-id}/` | 需求级，同一需求全员共享 | 仅需求负责人 |
| 个人层 | `users/{user}/{req-id}/` | 任务级，按子需求负责人隔离 | 仅本人 |
| 归档层 | `archive/{req-id}/` | 需求级，已完成的旧需求 | 技术负责人 |

---

## 三、关键文件用途说明

### 项目级文件（`.meta/`）

| 文件 | 用途 | 谁维护 | 是否需人工审核 |
|------|------|--------|---------------|
| `index.json` | 所有需求的注册表，记录 req-id、负责人、状态、空间路径 | AI 自动读写 | 需求负责人确认 |
| `tech-stack.json` | 探测到的技术栈（前端框架、后端框架、ORM、测试框架等） | AI 自动探测 | 人工验证准确性 |
| `coding-standard.md` | 代码风格摘要（缩进、引号、命名规范等） | AI 自动采集 | 人工验证准确性 |
| `toolchain.json` | 可用命令清单（lint、test、type-check 等） | AI 自动验证 | 人工验证准确性 |
| `project-config.yaml` | 项目级配置覆盖，控制各 Skill 默认行为 | 技术负责人 | 按需调整 |
| `skill-overrides/*.yaml` | 各 Skill 专属配置（如需求分析必填章节、任务最大数等） | 技术负责人 | 按需调整 |
| `architecture-baseline.md` | 项目架构单一事实来源（模块边界、接口契约、数据流等） | 技术负责人 | **必须审核定稿** |

### 阶段一产物（`shared/{req-id}/01-requirement/`）

| 文件 | 用途 | 谁维护 | 是否需人工确认 |
|------|------|--------|---------------|
| `raw/requirement.md` | 原始需求文档（用户粘贴或上传） | 需求负责人 | — |
| `understanding-confirmation.md` | AI 对需求的理解摘要 + 待确认问题 | AI 生成 | **必须先确认** |
| `analysis-report.md` | 业务影响、权限分析、风险评估、需求分类 | AI 生成 | 需求负责人审核 |
| `subreq-breakdown.md` | 子需求拆分 + 依赖关系 + **负责人分配** | AI 生成 | 需求负责人审核 |
| `common-modules.md` | 可复用模块识别，避免重复开发 | AI 生成 | 需求负责人审核 |

### 阶段二至六产物（`users/{user}/{req-id}/`）

| 文件 | 用途 | 谁维护 | 是否需人工确认 |
|------|------|--------|---------------|
| `sub-design.md` | 子需求详细设计（引用架构基线，聚焦实现） | AI 生成 | 子需求负责人审核 |
| `plan.md` | 任务总计划（含依赖图、里程碑） | AI 生成 | 子需求负责人审核 |
| `task-spec.md` | 单个任务的详细规格说明 | AI 生成 | 子需求负责人审核 |
| `change-summary.md` | 代码变更摘要（含 diff 预览） | AI 生成 | **必须确认后才写代码** |
| `test-cases.md` | 测试用例（基于验收标准） | AI 生成 | 子需求负责人审核 |
| `test-report.md` | 测试执行结果（通过/失败统计） | AI 生成 | 子需求负责人确认 |
| `review-report.md` | 代码审查报告（评分 + 问题清单） | AI 生成 | 子需求负责人确认 |

---

## 四、完整使用流程

### 第一步：项目初始化（只需执行一次）

当你将 Skill 复制到项目后，在 Qoder 中执行：

```
/ai-workspace-init
```

AI 会自动完成：
1. ✅ 环境自检：创建 `ai-workspace/` 完整目录结构
2. ✅ 技术栈探测：读取 `package.json` 等，生成 `tech-stack.json`
3. ✅ 代码风格采集：读取 ESLint/Prettier，生成 `coding-standard.md`
4. ✅ 工具链验证：检查可用命令，生成 `toolchain.json`
5. ✅ 架构基线骨架：基于探测到的技术栈生成基线初稿
6. ✅ 动态模板生成：组合基础模板 + 适配片段，生成项目专属模板
7. ✅ 配置骨架生成：创建 `project-config.yaml` 和 `skill-overrides/`
8. ✅ 生成本地指南：创建本文档 `ai-workspace/README.md`

**你需要做的**：
- 验证 `tech-stack.json` 中的技术栈是否正确
- 验证 `coding-standard.md` 中的代码风格是否符合团队约定
- **审核 `architecture-baseline.md` 骨架**，补充实际项目信息，确认后标记为 FROZEN

---

### 第二步：开始新需求（按需执行）

项目初始化完成后，每当你有新需求，直接在对话中粘贴需求文档或上传文件，然后执行：

```
/requirement-analysis
```

AI 会自动完成：
1. ✅ 自动生成需求 ID（如 `REQ-2026-001`）
2. ✅ 创建需求目录 `shared/REQ-2026-001/01-requirement/raw/`
3. ✅ 将需求文档保存到 `raw/` 目录
4. ✅ 在 `index.json` 中注册该需求
5. ✅ 解析需求，生成 `understanding-confirmation.md`

**关键人工确认点**：
- AI 生成 `understanding-confirmation.md` 后，**你必须确认 AI 的理解是否正确**，确认后才继续生成后续分析报告

确认理解无误后，AI 继续生成：
- `analysis-report.md` — 需求分析报告
- `subreq-breakdown.md` — 子需求分解（含负责人分配）
- `common-modules.md` — 公共模块识别

**你需要做的**：
- 审核 `subreq-breakdown.md` 中的子需求拆分和负责人分配是否合理
- 确认后，通知各子需求负责人开始各自的技术方案设计

---

### 第三步：子需求技术方案（各负责人独立执行）

每个子需求负责人基于 `shared/{req-id}/01-requirement/subreq-breakdown.md` 中分配给自己的子需求，执行：

```
/technical-design 为 subreq-001 生成技术方案
```

AI 生成 `sub-design.md`，其中必须引用 `.meta/architecture/architecture-baseline.md`，禁止重复描述基线中已有的内容。

**输出位置**：`users/{your-name}/2026/{req-id}/02-technical-design/subreq-001/sub-design.md`

---

### 第四步：任务计划（各负责人独立执行）

子需求负责人基于自己的 `sub-design.md`，执行：

```
/task-plan 为 subreq-001 生成任务计划
```

AI 生成 `plan.md` 和每个任务的 `task-spec.md`。

**输出位置**：`users/{your-name}/2026/{req-id}/03-task-plan/`

---

### 第五步：技术实现（各负责人独立执行）

子需求负责人基于任务规格，执行：

```
/implementation 实现 task-001
```

AI 生成 `change-summary.md`（含 diff 预览）。

**关键人工确认点**：
- **你必须确认 `change-summary.md` 中的变更内容**，确认后 AI 才会将代码写入实际文件

**输出位置**：`users/{your-name}/2026/{req-id}/04-implementation/task-001/`

---

### 第六步：测试验证（各负责人独立执行）

实现完成后，执行：

```
/testing 为 task-001 编写并运行测试
```

AI 生成 `test-cases.md`、测试代码和 `test-report.md`。

**输出位置**：`users/{your-name}/2026/{req-id}/05-testing/task-001/`

---

### 第七步：代码审查（各负责人独立执行）

测试通过后，执行：

```
/code-review 审查 task-001
```

AI 执行三轨审查（自动化检查 + AI 审查 + 审查清单），生成 `review-report.md`。

**关键人工确认点**：
- **你必须给出最终审批意见**，审批通过后该任务完成

**输出位置**：`users/{your-name}/2026/{req-id}/06-review/task-001/`

---

## 五、协作规则速查

### 谁负责什么

| 角色 | 职责 |
|------|------|
| **需求负责人** | 执行阶段一（需求分析），产出存入 `shared/` |
| **技术负责人** | 维护架构基线、审核架构差异、维护 Skill 和配置 |
| **子需求负责人** | 独立执行阶段二-B 至阶段六，产物存入自己的 `users/` 目录 |

### 空间写入规则

- `shared/{req-id}/`：仅需求负责人可写，其他成员只读
- `users/{your-name}/`：仅本人可写，禁止操作他人目录
- `.meta/`：仅技术负责人可写（基线、配置、模板）

### 关键确认点汇总

1. **需求理解确认**：`understanding-confirmation.md` → 需求负责人确认
2. **代码变更确认**：`change-summary.md` → 子需求负责人确认后写代码
3. **审查终审确认**：`review-report.md` → 子需求负责人最终审批

---

## 六、需要帮助？

- **完整使用指南**：`docs/ai-coding-framework/USER-GUIDE.md`
- **目录结构规范**：`docs/ai-coding-framework/directory-structure-spec.md`
- **各阶段详细规范**：`docs/ai-coding-framework/01-06-*-spec.md`
- **工作流状态查询**：`/ai-coding-workflow status`
```

### Step 9: Report Completion

Inform the user with a comprehensive summary:

```
✅ AI 工作区环境初始化完成

📡 项目探测结果：
   - 前端：React 18 + TypeScript + Vite + Zustand + Ant Design
   - 后端：NestJS 10 + Prisma + PostgreSQL
   - 测试：Vitest + Playwright
   - 包管理器：pnpm

📄 生成的配置文件：
   - .meta/tech-stack.json
   - .meta/coding-standard.md
   - .meta/toolchain.json
   - .meta/config/project-config.yaml
   - .meta/config/skill-overrides/*.yaml（6 个文件）

🏗️ 架构基线：
   - 骨架已生成（状态：DRAFT）→ .meta/architecture/architecture-baseline.md
   - ⚠️ 请技术负责人审核并补充实际项目信息后标记为 FROZEN

📝 模板：
   - 基础模板：templates/base/（6 个文件）
   - 适配片段：templates/adapters/（8 个文件）
   - 项目专属组合模板：templates/generated/（已生成）

📖 本地指南：
   - 已创建 ai-workspace/README.md（中文项目使用指南）

👉 下一步：开始你的第一个需求
   直接在对话中粘贴需求文档，然后调用 /requirement-analysis
   AI 会自动创建需求目录、保存文档、注册索引并开始分析
```

## Quality Gates

### Environment Self-Check
- [ ] `ai-workspace/` directory structure complete (shared/, users/, archive/, .meta/ subdirs)
- [ ] Base templates present in `.meta/templates/base/` (6 files)
- [ ] Adapter fragments present in `.meta/templates/adapters/` (8 files)
- [ ] Config skeletons present in `.meta/config/` (project-config.yaml + 6 skill-overrides)
- [ ] `.meta/index.json` exists and is valid
- [ ] All core Skills present in `.qoder/skills/`

### Project Sensing
- [ ] `.meta/tech-stack.json` generated with detected values
- [ ] `.meta/coding-standard.md` generated from actual config files
- [ ] `.meta/toolchain.json` generated with available commands
- [ ] `.meta/architecture/architecture-baseline.md` skeleton generated (if not exists)
- [ ] `templates/generated/` populated with tech-stack-specific templates
- [ ] `.meta/config/project-config.yaml` exists

### Local README
- [ ] Chinese README guide created at `ai-workspace/README.md`
- [ ] README contains: system introduction, directory structure, file usage guide, complete workflow

## Example

**User input:**
> 我刚把 Skill 复制到项目里，帮我初始化一下环境

**Skill execution:**
1. Environment self-check:
   - Verify directory structure (create missing: shared/, users/, archive/, templates/generated/, architecture/...)
   - Verify templates (base: 6 files, adapters: 8 files)
   - Verify configs (project-config.yaml + 6 skill-overrides)
   - Verify index.json (create default skeleton if missing)
   - Verify Skills (7/7 present)
2. Detect tech stack from package.json (React + NestJS + Prisma)
3. Harvest ESLint/Prettier config → coding-standard.md
4. Validate toolchain → toolchain.json (vitest, eslint, tsc available)
5. Generate architecture baseline skeleton (frontend + backend)
6. Generate React + NestJS specific templates in templates/generated/
7. Ensure project-config.yaml skeleton exists
8. Create comprehensive Chinese README guide at `ai-workspace/README.md`
9. Report comprehensive summary with all detected configurations
