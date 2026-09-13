# AI Coding Workflow

> 六阶段 AI 辅助开发工作流框架 —— 平台无关、团队协作、产物可追溯
>
> 版本：2.0 | 语言：中文

---

## 一、框架概述

AI Coding Workflow 是一套将软件开发生命周期标准化为 **六个连续阶段** 的方法论框架。每个阶段产出结构化的文档与代码产物，支持多人协作、版本追溯和架构一致性治理。

### 1.1 六阶段流程

```
原始需求文档
    │
    ▼
┌─────────────────────────────────────┐
│ 阶段一：需求分析                      │ ← 需求负责人统一完成，产物全员共享
│ 阶段二：技术方案                      │ ← 拆分为「全局架构确认」+「子需求详细设计」
│ 阶段三：任务计划                      │ ← 各子需求负责人独立完成
│ 阶段四：技术实现                      │ ← 变更预览 + 人工确认后写入代码
│ 阶段五：测试验证                      │ ← 基于验收标准生成用例并执行
│ 阶段六：代码审查                      │ ← 自动化检查 + AI 审查 + 人工终审
└─────────────────────────────────────┘
```

### 1.2 核心设计思想：三层空间隔离

| 空间层级 | 路径 | 作用域 | 设计意图 |
|---------|------|--------|---------|
| **项目基线层** | `ai-workspace/.meta/` | 整个项目 | 架构基线、技术栈配置、产物模板 —— 由技术负责人维护 |
| **共享空间层** | `ai-workspace/shared/` | 单个需求 | 阶段一产物 —— 需求负责人产出，全员只读引用 |
| **个人空间层** | `ai-workspace/users/` | 单个任务 | 阶段二至六产物 —— 各负责人独立操作，互不干扰 |

**平台无关性**：本框架不绑定任何特定 IDE、编辑器或 AI 平台。只要支持读取 Markdown 文件、执行目录操作和调用外部命令的环境，均可接入本工作流。

---

## 二、工作流阶段详表

本框架包含 **8 个工作流组件**，对应六阶段流程及支撑模块。

### 2.1 组件总览

| 组件 | 对应阶段 | 核心定位 |
|------|---------|---------|
| `ai-workspace-init` | 前置初始化 | 项目环境感知与基线初始化 |
| `requirement-analysis` | 阶段一 | 需求解析与子需求分解 |
| `technical-design` | 阶段二 | 架构差异评估 + 子需求详细设计 |
| `task-plan` | 阶段三 | 可执行任务计划生成 |
| `implementation` | 阶段四 | 代码实现与变更预览 |
| `testing` | 阶段五 | 测试用例生成与执行 |
| `code-review` | 阶段六 | 三轨代码审查 |
| `ai-coding-workflow` | 全局支撑 | 状态查询与流程导航 |

### 2.2 ai-workspace-init — 项目初始化

| 维度 | 说明 |
|------|------|
| **功能定位** | 为项目建立 AI Coding Workflow 运行环境，包括目录结构、配置骨架、架构基线草案、产物模板 |
| **触发时机** | 项目首次接入本工作流时执行一次；技术栈变更后可重新探测 |
| **输入要求** | 项目现有代码库（用于自动探测技术栈、代码风格、可用命令） |
| **核心输出产物** | 见下表 |
| **消费者** | 所有工作流参与者 |

**输出产物清单**：

| 产物文件 | 格式 | 存放位置 | 说明 |
|---------|------|---------|------|
| `tech-stack.json` | JSON | `ai-workspace/.meta/` | 探测到的技术栈信息 |
| `coding-standard.md` | Markdown | `ai-workspace/.meta/` | 代码风格摘要 |
| `toolchain.json` | JSON | `ai-workspace/.meta/` | 可用命令清单 |
| `architecture-baseline.md` | Markdown | `ai-workspace/.meta/architecture/` | 架构基线骨架（状态：DRAFT） |
| `project-config.yaml` | YAML | `ai-workspace/.meta/config/` | 主配置骨架 |
| `skill-overrides/*.yaml` | YAML | `ai-workspace/.meta/config/skill-overrides/` | 各阶段专属配置覆盖 |
| `templates/generated/*.md` | Markdown | `ai-workspace/.meta/templates/generated/` | 项目专属组合模板 |
| `README.md` | Markdown | `ai-workspace/` | 项目本地使用指南 |

### 2.3 requirement-analysis — 需求分析

| 维度 | 说明 |
|------|------|
| **功能定位** | 解析原始需求文档，确保 AI 理解正确，产出结构化分析文档并拆分为可分配的独立子需求 |
| **触发时机** | 收到需求文档后；支持直接粘贴文本、上传文件或读取已存放的原始文档 |
| **输入要求** | 原始需求文档（Markdown / Word / PDF）；可选项目上下文 |
| **核心输出产物** | 见下表 |
| **消费者** | 全员只读；子需求负责人以此为依据进入阶段二 |

**输出产物清单**（全部存放于 `ai-workspace/shared/{req-id}/01-requirement/`）：

| 产物文件 | 格式 | 说明 | 人工确认要求 |
|---------|------|------|-------------|
| `understanding-confirmation.md` | Markdown | AI 对需求的理解摘要 + 待确认问题 | **必须先确认** |
| `analysis-report.md` | Markdown | 业务影响、权限分析、风险、需求分类 | 确认后生成 |
| `subreq-breakdown.md` | Markdown | 子需求拆分清单 + 依赖关系 + **负责人分配** | 确认后生成 |
| `common-modules.md` | Markdown | 公共/可复用模块识别 | 确认后生成 |

**关键规则**：
- 阶段一产物是唯一存放在 `shared/` 目录下的产物，作为后续所有阶段的权威输入
- `subreq-breakdown.md` 中的 owner 分配决定后续阶段个人空间的创建归属

### 2.4 technical-design — 技术方案

| 维度 | 说明 |
|------|------|
| **功能定位** | 基于需求分析产物和架构基线，生成详细技术方案。拆分为两层：全局架构确认（可选）与子需求详细设计（必做） |
| **触发时机** | 需求分析完成后；各子需求负责人分别独立执行 |
| **输入要求** | `shared/{req-id}/01-requirement/` 中的分析产物；`.meta/architecture/architecture-baseline.md`；项目现有代码库 |
| **核心输出产物** | 见下表 |
| **消费者** | 阶段三（task-plan）读取 sub-design.md 和 acceptance-criteria.md |

**输出产物清单**：

| 产物文件 | 格式 | 存放位置 | 说明 |
|---------|------|---------|------|
| `architecture-delta.md` | Markdown | `ai-workspace/.meta/architecture/deltas/` | 架构变更差异文档（仅当触及基线时产出） |
| `sub-design.md` | Markdown | `ai-workspace/users/{user}/{yyyy}/{req-id}/02-technical-design/subreq-{id}/` | 子需求详细设计（引用基线，聚焦实现） |
| `acceptance-criteria.md` | Markdown | `ai-workspace/users/{user}/{yyyy}/{req-id}/02-technical-design/` | 验收标准汇总（BDD 风格） |

**关键规则**：
- 设计前必须先读取架构基线
- `sub-design.md` 禁止重复描述基线中已定义的内容，必须引用基线章节
- 若设计偏离基线，需记录原因并评估是否触发基线修订流程

### 2.5 task-plan — 任务计划

| 维度 | 说明 |
|------|------|
| **功能定位** | 将子需求技术方案拆分为可执行的具体任务，明确依赖关系、执行顺序和角色分工 |
| **触发时机** | 自己的 `sub-design.md` 完成后 |
| **输入要求** | 自己的 `sub-design.md`；`acceptance-criteria.md`；`shared/{req-id}/01-requirement/subreq-breakdown.md`（依赖关系） |
| **核心输出产物** | 见下表 |
| **消费者** | 阶段四（implementation）按 task-spec.md 执行编码 |

**输出产物清单**（存放于 `ai-workspace/users/{user}/{yyyy}/{req-id}/03-task-plan/`）：

| 产物文件 | 格式 | 说明 |
|---------|------|------|
| `plan.md` | Markdown | 任务总计划（含依赖图、执行顺序、里程碑） |
| `task-{id}/task-spec.md` | Markdown | 单个任务详细规格 |
| `task-{id}/role-frontend.md` | Markdown | 前端工程师执行视角（如适用） |
| `task-{id}/role-backend.md` | Markdown | 后端工程师执行视角（如适用） |
| `task-{id}/role-fullstack.md` | Markdown | 全栈工程师执行视角（如适用） |

### 2.6 implementation — 技术实现

| 维度 | 说明 |
|------|------|
| **功能定位** | 按任务规格执行代码实现，核心安全机制是"变更预览 + 人工确认" |
| **触发时机** | 任务计划完成后，逐个任务执行 |
| **输入要求** | `task-spec.md`；`role-{frontend\|backend}.md`；项目代码规范；项目现有代码库 |
| **核心输出产物** | 见下表 |
| **消费者** | 阶段五（testing）基于变更执行测试；阶段六（code-review）审查变更 |

**输出产物清单**（存放于 `ai-workspace/users/{user}/{yyyy}/{req-id}/04-implementation/task-{id}/`）：

| 产物文件 | 格式 | 说明 | 人工确认要求 |
|---------|------|------|-------------|
| `change-summary.md` | Markdown | 变更摘要 + 代码 diff 预览 | **必须先确认** |
| `affected-files.md` | Markdown | 受影响文件清单 | 确认后写入 |
| `diff/*.patch` | Patch | 变更 diff 预览文件 | 确认后写入 |
| 实际代码文件 | 源码 | 经人工确认后写入项目代码库 | 确认后写入 |

**核心安全机制**：
```
AI 生成变更（内存中）
    ↓
生成 change-summary.md（不写入实际文件）
    ↓
⏸️ 等待人工审阅并确认
    ↓
用户确认后 → 写入实际代码文件
```

### 2.7 testing — 测试验证

| 维度 | 说明 |
|------|------|
| **功能定位** | 基于验收标准生成测试用例，执行测试并输出报告 |
| **触发时机** | 单个任务代码实现完成后 |
| **输入要求** | `acceptance-criteria.md`；`change-summary.md`；实际代码文件；`task-spec.md` |
| **核心输出产物** | 见下表 |
| **消费者** | 阶段六（code-review）参考测试报告进行审查 |

**输出产物清单**（存放于 `ai-workspace/users/{user}/{yyyy}/{req-id}/05-testing/task-{id}/`）：

| 产物文件 | 格式 | 说明 |
|---------|------|------|
| `test-cases.md` | Markdown | 测试用例文档（基于验收标准） |
| `test-code/*.test.*` | 源码 | 生成的测试代码 |
| `test-report.md` | Markdown | 测试执行报告（通过率、失败分析、覆盖率） |

### 2.8 code-review — 代码审查

| 维度 | 说明 |
|------|------|
| **功能定位** | 对实现完成的代码执行三轨审查，确保质量达标 |
| **触发时机** | 测试全部通过后 |
| **输入要求** | `change-summary.md`；`test-report.md`；实际代码文件；审查检查清单 |
| **核心输出产物** | 见下表 |
| **消费者** | 人工进行终审；审查通过后需求状态标记为完成 |

**输出产物清单**（存放于 `ai-workspace/users/{user}/{yyyy}/{req-id}/06-review/task-{id}/`）：

| 产物文件 | 格式 | 说明 |
|---------|------|------|
| `review-report.md` | Markdown | 审查报告（评分 + 阻塞/非阻塞问题清单） |
| `review-checklist.md` | Markdown | 检查清单执行记录 |

**三轨审查机制**：

| 轨道 | 执行者 | 关注点 |
|------|--------|--------|
| 轨道一 | 自动化脚本 | Lint、Type Check、Format |
| 轨道二 | AI | 健壮性、规范性、安全性、性能、架构基线合规性 |
| 轨道三 | 人工 | 业务逻辑正确性、架构合理性 |

**问题分级**：
- **Blocking（阻塞）**：影响功能正确性、安全性或导致崩溃，必须修复
- **Non-blocking（建议）**：影响代码质量但不影响功能，可后续优化

### 2.9 ai-coding-workflow — 工作流状态管理

| 维度 | 说明 |
|------|------|
| **功能定位** | 查询工作区状态、检查前置条件、推荐下一步操作、生成版本-需求映射报告 |
| **触发时机** | 任何时刻；不确定下一步该做什么时 |
| **输入要求** | `ai-workspace/.meta/index.json` |
| **核心输出** | 需求状态概览、前置条件检查结果、推荐下一步、版本-需求映射 |
| **消费者** | 所有工作流参与者 |

---

## 三、产物目录结构说明

### 3.1 完整目录树

```
project-root/                               # 项目根目录
│
├── ai-workspace/                           # AI 工作区根目录
│   ├── README.md                           # 项目本地使用指南
│   │
│   ├── .meta/                              # 项目级元数据与配置
│   │   ├── index.json                      # 需求索引（所有需求的注册表）
│   │   ├── tech-stack.json                 # 探测到的技术栈
│   │   ├── coding-standard.md              # 代码风格摘要
│   │   ├── toolchain.json                  # 可用命令清单
│   │   │
│   │   ├── config/                         # 配置层：项目级覆盖
│   │   │   ├── project-config.yaml         # 主配置文件
│   │   │   └── skill-overrides/            # 各阶段专属覆盖
│   │   │       ├── requirement-analysis.yaml
│   │   │       ├── technical-design.yaml
│   │   │       ├── task-plan.yaml
│   │   │       ├── implementation.yaml
│   │   │       ├── testing.yaml
│   │   │       └── code-review.yaml
│   │   │
│   │   ├── architecture/                   # 架构基线（项目级单一事实来源）
│   │   │   ├── architecture-baseline.md    # 当前生效的架构基线
│   │   │   ├── architecture-baseline-history/  # 历史版本归档
│   │   │   │   ├── architecture-baseline-v1.0.md
│   │   │   │   └── architecture-baseline-v1.1.md
│   │   │   └── deltas/                     # 架构差异文档
│   │   │       └── architecture-delta-{req-id}.md
│   │   │
│   │   └── templates/                      # 产物模板
│   │       ├── base/                       # 通用基线模板
│   │       │   ├── requirement-template.md
│   │       │   ├── technical-design-template.md
│   │       │   ├── task-plan-template.md
│   │       │   ├── change-summary-template.md
│   │       │   ├── test-report-template.md
│   │       │   └── review-checklist-template.md
│   │       ├── adapters/                   # 技术栈适配片段
│   │       │   ├── frontend-baseline-skeleton.md
│   │       │   ├── backend-baseline-skeleton.md
│   │       │   ├── react-components.md
│   │       │   ├── vue-components.md
│   │       │   ├── rest-api.md
│   │       │   ├── graphql-api.md
│   │       │   ├── prisma-orm.md
│   │       │   └── pytest-testing.md
│   │       └── generated/                  # 项目专属组合模板
│   │           └── ...
│   │
│   ├── shared/                             # 共享空间（需求级产物，全员只读）
│   │   └── {req-id}/                       # 如：REQ-2026-001
│   │       └── 01-requirement/             # 阶段一产物
│   │           ├── raw/                    # 原始需求文档存放
│   │           │   ├── requirement.md
│   │           │   └── ...
│   │           ├── understanding-confirmation.md
│   │           ├── analysis-report.md
│   │           ├── subreq-breakdown.md
│   │           └── common-modules.md
│   │
│   ├── users/                              # 个人空间（任务级产物，按 owner 隔离）
│   │   └── {git-username}/                 # 如：zhangsan
│   │       └── {yyyy}/                     # 如：2026
│   │           └── {req-id}/               # 如：REQ-2026-001
│   │               │
│   │               ├── 02-technical-design/    # 阶段二-B
│   │               │   ├── acceptance-criteria.md
│   │               │   └── subreq-{id}/
│   │               │       └── sub-design.md
│   │               │
│   │               ├── 03-task-plan/           # 阶段三
│   │               │   ├── plan.md
│   │               │   └── task-{id}/
│   │               │       ├── task-spec.md
│   │               │       └── role-{frontend|backend|fullstack}.md
│   │               │
│   │               ├── 04-implementation/      # 阶段四
│   │               │   └── task-{id}/
│   │               │       ├── change-summary.md
│   │               │       ├── affected-files.md
│   │               │       └── diff/
│   │               │           └── {file-path}.patch
│   │               │
│   │               ├── 05-testing/             # 阶段五
│   │               │   └── task-{id}/
│   │               │       ├── test-cases.md
│   │               │       ├── test-code/
│   │               │       │   └── *.test.ts
│   │               │       └── test-report.md
│   │               │
│   │               └── 06-review/              # 阶段六
│   │                   └── task-{id}/
│   │                       ├── review-report.md
│   │                       └── review-checklist.md
│   │
│   └── archive/                            # 归档区（已完成需求）
│       └── {yyyy}/
│           └── {req-id}/
│               └── （结构与 users/ 下一致，全部历史产物保留）
│
└── ...                                     # 项目原有代码
```

### 3.2 空间层级设计意图

#### 项目基线层（`.meta/`）

| 目录 | 设计意图 | 读写规则 |
|------|---------|---------|
| `index.json` | 所有需求的中央注册表，支持按版本、里程碑、优先级检索 | AI 自动读写，人工审核 |
| `architecture/` | 项目级架构单一事实来源，所有设计必须引用而非复制 | 技术负责人可写，全员只读 |
| `config/` | 控制各阶段默认行为，统一团队标准 | 技术负责人可写，全员只读 |
| `templates/` | 确保各阶段产物格式一致，支持技术栈适配 | base/adapters 人工维护，generated AI 生成 |

#### 共享空间层（`shared/`）

- **仅存放阶段一产物**，作为后续所有阶段的权威输入
- 同一需求的所有参与者共享只读访问
- 阶段一完成后冻结，任何修改需经需求负责人审批

#### 个人空间层（`users/`）

- 按 `git-username/yyyy/req-id/` 三级隔离
- 阶段二至六的产物按需创建，每个子需求负责人仅操作自己的目录
- 天然避免多人协作时的文件冲突

#### 归档层（`archive/`）

- 需求状态变为 `completed` 且超过保留期后，由技术负责人归档
- 结构与 `users/` 下完全一致，保留全部历史产物用于复盘

### 3.3 产物流转路径

```
阶段一（shared/）
    │
    ├──→ 子需求负责人 A 读取 → 阶段二-A（可选：架构差异）
    │                              ↓
    │                         阶段二-B（users/A/02-...）
    │                              ↓
    │                         阶段三（users/A/03-...）
    │                              ↓
    │                         阶段四（users/A/04-...）
    │                              ↓
    │                         阶段五（users/A/05-...）
    │                              ↓
    │                         阶段六（users/A/06-...）
    │
    ├──→ 子需求负责人 B 读取 → ...（同上，独立流转）
    │
    └──→ 子需求负责人 C 读取 → ...（同上，独立流转）
```

### 3.4 命名规范

| 维度 | 格式 | 示例 |
|------|------|------|
| 需求 ID | `REQ-{YYYY}-{NNN}` | `REQ-2026-001` |
| 子需求 ID | `subreq-{NNN}` | `subreq-001` |
| 任务编号 | `task-{NNN}` | `task-001` |
| 角色标识 | `frontend` / `backend` / `fullstack` | `role-frontend.md` |
| 阶段目录 | `{NN}-{phase-name}` | `01-requirement` |
| 架构差异文档 | `architecture-delta-{req-id}.md` | `architecture-delta-REQ-2026-005.md` |
| 个人空间路径 | `users/{git-username}/{yyyy}/{req-id}/` | `users/zhangsan/2026/REQ-2026-001/` |

---

## 四、协作规则摘要

### 4.1 空间隔离原则

| 空间 | 写入者 | 读取者 | 冲突风险 |
|------|--------|--------|---------|
| `.meta/` | 技术负责人 + AI | 全员 | 低（基线修订走评审流程） |
| `shared/{req-id}/` | 需求负责人 + AI | 全员只读 | 无（阶段一完成后冻结） |
| `users/{user-A}/` | 子需求负责人 A + AI | A 可写，他人无权限 | 无（物理隔离） |
| `users/{user-B}/` | 子需求负责人 B + AI | B 可写，他人无权限 | 无（物理隔离） |

### 4.2 架构基线维护责任

- **技术负责人**是架构基线的唯一维护者
- 基线状态流转：`DRAFT` → `FROZEN` → `EVOLVING` → `REFACTORING`
- 默认状态下基线为 `FROZEN`，所有详细设计必须引用基线而非复制
- 偏离基线需记录原因，重大偏离触发基线修订流程

### 4.3 AI 写入受控机制

本框架在三个关键节点强制要求人工确认，防止 AI 未经审核直接修改代码：

| 节点 | 产物 | 确认内容 | 未确认后果 |
|------|------|---------|-----------|
| 需求理解 | `understanding-confirmation.md` | AI 对需求的理解是否正确 | 不生成后续分析文档 |
| 变更预览 | `change-summary.md` | 代码变更原因和 diff 预览 | 不写入实际代码文件 |
| 代码审查 | `review-report.md` | 审查结果和业务逻辑正确性 | 不标记需求完成 |

### 4.4 Git 管理建议

推荐将 `ai-workspace/` 纳入版本控制，但区分提交策略：

| 路径 | 是否提交 Git | 理由 |
|------|-------------|------|
| `ai-workspace/.meta/` | ✅ 提交 | 配置、模板、架构基线为团队共享资产 |
| `ai-workspace/shared/` | ✅ 提交 | 需求分析产物为团队共享资产 |
| `ai-workspace/users/` | ❌ 忽略 | 个人工作空间，各开发者本地管理 |
| `ai-workspace/archive/` | ❌ 忽略 | 归档区体积大，历史保留本地 |

---

## 五、快速开始示例

以下展示从项目初始化到需求分析完成的完整串联流程。

### 场景设定

- **项目**：电商平台用户登录模块重构
- **需求**：在现有账号密码登录基础上，新增手机号 + 验证码登录方式
- **需求负责人**：zhangsan
- **年度**：2026

### Step 1：项目初始化

执行项目初始化，自动探测技术栈、生成配置骨架和架构基线草案。

**输入**：项目代码库（React 前端 + NestJS 后端）

**输出**：
```
ai-workspace/
├── README.md
└── .meta/
    ├── index.json
    ├── tech-stack.json
    ├── coding-standard.md
    ├── toolchain.json
    ├── config/
    │   ├── project-config.yaml
    │   └── skill-overrides/
    ├── architecture/
    │   └── architecture-baseline.md  ← 状态：DRAFT
    └── templates/
        ├── base/
        ├── adapters/
        └── generated/
```

**技术负责人后续动作**：审核 `architecture-baseline.md`，补充实际项目信息后标记为 `FROZEN`。

### Step 2：需求分析

zhangsan 收到需求文档后，启动阶段一。

**输入**：原始需求文档（粘贴文本或上传文件）

**自动准备**：
- 生成需求 ID：`REQ-2026-001`
- 创建目录：`ai-workspace/shared/REQ-2026-001/01-requirement/`
- 保存原始文档到 `raw/requirement.md`
- 注册索引到 `.meta/index.json`

**阶段 2a：理解确认**

AI 生成 `understanding-confirmation.md`：

```markdown
---
req-id: REQ-2026-001
title: 用户登录模块重构
owner: zhangsan
created-at: 2026-09-12
generated-by: requirement-analysis
status: draft
---

# Requirement Understanding Confirmation

## AI 理解摘要
1. 在现有账号密码登录基础上，新增手机号 + 验证码登录方式
2. 需要改造登录页面 UI、后端登录接口、用户数据模型
3. 验证码有效期 5 分钟，发送频率限制 1 分钟/次

## 待确认问题
- [ ] 手机号登录是否保留密码登录入口？
- [ ] 验证码发送失败时的降级策略？
```

⏸️ **人工介入**：zhangsan 审阅理解摘要，回答待确认问题。

**阶段 2b：详细分析**

zhangsan 确认理解无误后，AI 继续生成：

| 产物文件 | 核心内容 |
|---------|---------|
| `analysis-report.md` | 业务影响：登录模块、用户体系；风险：短信服务商稳定性 |
| `subreq-breakdown.md` | 3 个子需求 + 负责人分配 |
| `common-modules.md` | 识别 2 个可复用模块：验证码输入组件、手机号校验工具 |

**subreq-breakdown.md 中的负责人分配**：

```markdown
## 子需求拆分

| 子需求 ID | 内容 | 负责人 | 依赖 |
|-----------|------|--------|------|
| subreq-001 | 前端登录页面改造（新增验证码输入框、切换逻辑） | lisi | 无 |
| subreq-002 | 后端登录接口改造（新增验证码校验、发送接口） | wangwu | 无 |
| subreq-003 | 用户数据模型扩展（新增手机号字段、验证码记录） | zhangsan | 无 |
```

**索引更新**：`.meta/index.json` 中该需求状态更新为 `in-progress`，`personal-spaces` 录入 lisi、wangwu、zhangsan 的空间路径。

**阶段一完成后的目录状态**：

```
ai-workspace/
├── .meta/
│   └── index.json  ← 已注册 REQ-2026-001
├── shared/
│   └── REQ-2026-001/
│       └── 01-requirement/
│           ├── raw/
│           │   └── requirement.md
│           ├── understanding-confirmation.md
│           ├── analysis-report.md
│           ├── subreq-breakdown.md
│           └── common-modules.md
└── users/
    ├── lisi/
    │   └── 2026/
    │       └── REQ-2026-001/  ← 空间已预留
    ├── wangwu/
    │   └── 2026/
    │       └── REQ-2026-001/  ← 空间已预留
    └── zhangsan/
        └── 2026/
            └── REQ-2026-001/  ← 空间已预留
```

### Step 3：后续阶段入口

阶段一完成后，各子需求负责人独立进入阶段二：

- **lisi** 读取 `shared/REQ-2026-001/01-requirement/` 中的产物，进入阶段二（技术方案）
- **wangwu** 读取同上产物，独立进入阶段二
- **zhangsan** 读取同上产物，独立进入阶段二

三人各自在个人空间中产出 `02-technical-design/subreq-{id}/sub-design.md`，互不干扰。

---

## 附录：index.json 字段参考

`.meta/index.json` 是需求的中央注册表，支持按版本、里程碑、epic 检索。

```json
{
  "version": "2.0",
  "schema": {
    "description": "AI Coding Workspace Requirement Index",
    "last-updated": "2026-09-13"
  },
  "entries": [
    {
      "req-id": "REQ-2026-001",
      "owner": "zhangsan",
      "year": "2026",
      "title": "用户登录模块重构",
      "status": "in-progress",
      "priority": "P0",
      "milestone": "Q3-账号体系升级",
      "target-release": "v1.2.0",
      "releases": ["v1.2.0-beta", "v1.2.0"],
      "epic": null,
      "shared-path": "shared/REQ-2026-001",
      "personal-spaces": [
        "users/zhangsan/2026/REQ-2026-001",
        "users/lisi/2026/REQ-2026-001",
        "users/wangwu/2026/REQ-2026-001"
      ],
      "created-at": "2026-09-12",
      "updated-at": "2026-09-13",
      "completed-at": null,
      "archived-at": null,
      "archive-path": null
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `req-id` | string | 需求唯一标识 |
| `status` | string | `pending` / `in-progress` / `completed` / `archived` |
| `priority` | string | `P0` / `P1` / `P2` / `P3` |
| `milestone` | string | 所属里程碑/专项 |
| `target-release` | string | 目标发布版本 |
| `releases` | string[] | 实际包含该需求的所有版本 |
| `epic` | string / null | 所属史诗需求 ID |
| `shared-path` | string | 共享空间相对路径 |
| `personal-spaces` | string[] | 所有参与者的个人空间路径 |
| `completed-at` | string / null | 完成时间戳 |
| `archived-at` | string / null | 归档时间戳 |
