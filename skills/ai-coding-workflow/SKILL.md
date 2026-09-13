---
name: ai-coding-workflow
description: Provides workflow guidance and status tracking for the AI Coding process. Reads the workspace index to show requirement status, checks prerequisite artifacts before recommending the next skill to invoke, and generates ready-to-use skill commands. Does not execute skills automatically. Use when you want to see the current state of requirements, check what step comes next, or verify that prerequisite artifacts exist before proceeding.
---

# AI Coding Workflow Guide

## Purpose

Provide workflow guidance and status tracking without automatic execution. This skill helps you:
- See the current status of all requirements in the workspace
- Understand what stage each requirement is at
- Check if prerequisite artifacts exist before invoking a skill
- Get recommended next steps with ready-to-use commands

## Trigger Scenarios

- User says "show workflow status" or "what's next?"
- User wants to check the state of a requirement
- User asks "can I run technical-design now?"
- User wants to see which sub-requirements are complete

## Input

- `.meta/index.json` — requirement registry
- Workspace directory structure

## Workflow

### Step 1: Read Workspace Index

Load `.meta/index.json` to get all registered requirements and their statuses.

### Step 2: Scan Artifact States

For each requirement, check which stage artifacts exist:

| Stage | Check Path | Artifact Indicator |
|-------|-----------|-------------------|
| Stage 1 | `shared/{req-id}/01-requirement/` | `analysis-report.md` exists |
| Stage 2-A | `.meta/architecture/deltas/` | `architecture-delta-{req-id}.md` exists |
| Stage 2-B | `users/{user}/{req-id}/02-technical-design/` | `sub-design.md` exists |
| Stage 3 | `users/{user}/{req-id}/03-task-plan/` | `plan.md` exists |
| Stage 4 | `users/{user}/{req-id}/04-implementation/` | `change-summary.md` exists |
| Stage 5 | `users/{user}/{req-id}/05-testing/` | `test-report.md` exists |
| Stage 6 | `users/{user}/{req-id}/06-review/` | `review-report.md` exists |

### Step 3: Generate Status Board

Present a visual status board:

```
📊 Workspace Status

REQ-2026-003: 用户登录模块重构
├── 阶段一：需求分析              ✅ 已完成
│   └── shared/REQ-2026-003/01-requirement/ 产物齐全
│
├── 阶段二：技术方案
│   ├── subreq-001 (lisi)         ⏳ 进行中 — sub-design.md 已生成
│   ├── subreq-002 (wangwu)       ❌ 未开始
│   └── subreq-003 (zhangsan)     ✅ 已完成
│
├── 阶段三：任务计划              ❌ 未开始
│
├── 阶段四~六：实现/测试/审查      ❌ 未开始
│
👉 建议下一步：
   wangwu 可执行：/technical-design 为 subreq-002 生成技术方案
   或 lisi 可执行：/task-plan 为 subreq-001 生成任务计划
```

### Step 4: Dependency Check (On Demand)

When user asks about a specific skill invocation:

1. Identify the target stage
2. Check if all prerequisite artifacts exist
3. Report missing prerequisites

**Example**: User asks "can I run task-plan for subreq-001?"

```
✅ 前置检查通过

阶段二-B 产物已就绪：
   - users/lisi/2026/REQ-2026-003/02-technical-design/subreq-001/sub-design.md ✅
   - users/lisi/2026/REQ-2026-003/02-technical-design/acceptance-criteria.md ✅

👉 可以执行：/task-plan 为 subreq-001 生成任务计划
```

**Example**: User asks "can I run implementation for task-001?"

```
❌ 前置检查失败

缺少阶段三 产物：
   - users/lisi/2026/REQ-2026-003/03-task-plan/task-001/task-spec.md ❌

请先执行：/task-plan 为 subreq-001 生成任务计划
```

## Commands

### `/ai-coding-workflow status`

Show the full workspace status board for all requirements.

### `/ai-coding-workflow status REQ-2026-003`

Show status for a specific requirement.

### `/ai-coding-workflow status --version v1.2.0`

Show all requirements targeting a specific release version. Queries `index.json` by `target-release` and `releases` fields.

### `/ai-coding-workflow status --milestone "Q3-账号体系升级"`

Show all requirements belonging to a specific milestone.

### `/ai-coding-workflow status --epic EPIC-001`

Show all requirements under a specific epic.

### `/ai-coding-workflow status --priority P0`

Show all P0 requirements.

### `/ai-coding-workflow check /task-plan subreq-001`

Check prerequisites before invoking a specific skill.

### `/ai-coding-workflow next`

Show recommended next steps based on current workspace state.

### `/ai-coding-workflow version-map`

Generate a version-requirement mapping report:

```
📋 Version-Requirement Map

v1.2.0 (target: 2026-10-15)
├── REQ-2026-001: 用户登录模块重构 [P0] [zhangsan] ✅ completed
├── REQ-2026-003: 手机号验证码登录 [P0] [lisi] ⏳ in-progress
└── REQ-2026-005: 第三方登录接入 [P1] [wangwu] ❌ pending

v1.3.0 (target: 2026-11-30)
├── REQ-2026-002: 支付模块重构 [P0] [zhangsan] ⏳ in-progress
└── REQ-2026-004: 订单状态机优化 [P1] [lisi] ❌ pending

Milestone: Q3-账号体系升级
├── REQ-2026-001 ✅
├── REQ-2026-003 ⏳
└── REQ-2026-005 ❌
```

## Quality Gates

- [ ] Index file is readable
- [ ] All requirements in index have valid paths
- [ ] Status indicators match actual artifact presence
- [ ] Recommendations only include skills with satisfied prerequisites
