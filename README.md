# AI Coding Workflow Skills

六阶段 AI 辅助开发工作流 Skill 集合，支持一键安装到 Qoder 平台。

## 快速安装

### 安装全部 Skill（推荐）

```bash
npx @codingdev/skills add https://github.com/your-org/ai-coding-workflow
```

### 安装单个 Skill

```bash
npx @codingdev/skills add https://github.com/your-org/ai-coding-workflow --skill requirement-analysis
```

### 安装到当前项目（而非全局）

```bash
npx @codingdev/skills add https://github.com/your-org/ai-coding-workflow --local
```

### 强制覆盖已存在的 Skill

```bash
npx @codingdev/skills add https://github.com/your-org/ai-coding-workflow --force
```

## 查看可用 Skill

```bash
npx @codingdev/skills list https://github.com/your-org/ai-coding-workflow
```

## Skill 列表

| Skill | 阶段 | 说明 |
|-------|------|------|
| ai-workspace-init | 前置 | 项目级工作区初始化 |
| requirement-analysis | 阶段一 | 需求分析与子需求分解 |
| technical-design | 阶段二 | 技术方案设计 |
| task-plan | 阶段三 | 任务计划生成 |
| implementation | 阶段四 | 代码实现 |
| testing | 阶段五 | 测试验证 |
| code-review | 阶段六 | 代码审查 |
| ai-coding-workflow | 全局 | 工作流状态管理 |

## 目录结构

```
ai-coding-workflow/
├── skills-cli/          # CLI 工具包（需发布到 npm）
│   ├── package.json
│   ├── bin/skills.js    # CLI 入口
│   └── lib/             # 核心逻辑
├── skills/              # 8 个 Skill
│   ├── ai-workspace-init/SKILL.md
│   ├── requirement-analysis/SKILL.md
│   ├── technical-design/SKILL.md
│   ├── task-plan/SKILL.md
│   ├── implementation/SKILL.md
│   ├── testing/SKILL.md
│   ├── code-review/SKILL.md
│   └── ai-coding-workflow/SKILL.md
└── skills.json          # Skill 清单
```

## 发布 CLI

```bash
cd skills-cli
npm login
npm publish --access public
```

## 自定义安装源

支持使用本地路径作为安装源：

```bash
npx @codingdev/skills add /path/to/this/repo
```

## 安装后位置

- **全局安装**：`~/.qoder-cn/skills/`
- **本地安装**：`./.qoder/skills/`
