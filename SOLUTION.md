# Koatty CLI 优化方案

## 1. 项目现状评估

### 1.1 当前架构

本项目是一个典型的 Node.js CLI 工具，基于 `commander` 处理命令行参数，利用 `isomorphic-git` 拉取远程模板，并通过 `replace` 进行基于正则的文本替换来生成代码。

- **优点**：

  - **模块化设计**：`src/processor` 目录按功能（controller, service, model 等）划分了处理器，结构清晰。
  - **网络容错**：在 `utils/template.js` 中实现了 GitHub 到 Gitee 的自动降级机制，对国内用户友好。
  - **轻量级**：依赖较少，专注于文件生成和模板拷贝。

- **不足**：
  - **交互性弱**：完全依赖命令行参数。如果用户忘记参数（如 `koatty new` 后未跟项目名），通常直接报错退出，缺乏引导式交互。
  - **代码修改脆弱**：使用正则和特定注释标记（如 `//_IMPORT_LIST Important!`）来插入代码。用户一旦误删标记，CLI 功能将失效。
  - **扩展性受限**：模板 URL 硬编码在 `src/command/config.js` 中，不支持用户自定义私有模板源。
  - **缺乏个性化配置**：没有用户级的配置文件（如 `.koattyrc`），无法保存作者信息、首选 ORM 等默认配置。

## 2. 竞品分析 (Benchmarking)

| 特性         | Koatty CLI (当前) | NestJS CLI        | Vue CLI / Create-Vue | 差距分析                                        |
| :----------- | :---------------- | :---------------- | :------------------- | :---------------------------------------------- |
| **交互方式** | 纯命令参数        | 参数 + 交互式询问 | 高度交互式 wizard    | **高**：缺乏 Inquirer.js 类似的交互体验。       |
| **代码生成** | 字符串替换/正则   | AST (抽象语法树)  | EJS/Handlebars 模板  | **中**：正则替换容易出错，AST 更安全智能。      |
| **模板管理** | 硬编码 URL        | 内置 Schematic    | Preset / Plugin 系统 | **高**：无法方便地使用自定义模板。              |
| **Monorepo** | 不支持            | 原生支持          | 支持                 | **中**：随着项目规模扩大，Monorepo 需求会增加。 |
| **配置管理** | 无                | `nest-cli.json`   | `.vuerc`             | **中**：无法持久化用户偏好。                    |

## 3. 优化方案设计

针对上述分析，提出以下分阶段优化方案：

### 3.1 第一阶段：交互体验升级 (UX Improvement)

**目标**：降低新手门槛，提供更友好的 CLI 体验。

1.  **引入交互式问答**：
    - 集成 `inquirer` 或 `enquirer`。
    - 当用户输入缺少必要参数时（如只输入 `koatty new`），自动进入问答模式，询问项目名称、使用的模板类型（project/plugin/middleware）等。
2.  **增强反馈机制**：
    - 使用 `ora` 替换现有的 loading 效果，提供更清晰的进度指示。
    - 在命令执行完成后，提供更详细的下一步操作指引（如 `cd project-name && npm install`）。

### 3.2 第二阶段：配置与扩展性增强 (Configuration & Extensibility)

**目标**：支持个性化定制和私有化部署。

1.  **引入 RC 配置文件**：
    - 支持读取用户目录下的 `.koattyrc` 文件。
    - 允许配置默认的模板源（`registry`）、作者信息（`author`）、包管理器偏好（npm/yarn/pnpm）。
2.  **自定义模板源**：
    - 在 `config.js` 中移除硬编码，改为优先读取配置。
    - 支持命令 `koatty config set template_url <url>`，方便企业用户指向内部 GitLab 仓库。
3.  **模板缓存管理**：
    - 增加 `koatty cache clean` 命令清理本地缓存的模板。
    - 增加 `--offline` 模式，允许在无网络环境下强制使用本地缓存。

### 3.3 第三阶段：核心能力重构 (Core Refactoring)

**目标**：提高代码生成的稳定性和安全性。

1.  **基于 AST 的代码修改**：
    - 对于 TypeScript 文件，引入 `ts-morph` 库。
    - **场景**：在 Controller 注册、Module 导入时，不再依赖 `//_IMPORT_LIST` 注释，而是解析 AST 结构，精准地在 `imports` 数组中添加新模块，彻底解决"误删注释导致功能失效"的问题。
2.  **更强大的模板引擎**：
    - 目前使用简单的文本替换，建议引入 `handlebars` 或 `ejs` 处理更复杂的模板逻辑（如根据用户选择的数据库类型动态生成配置代码）。

### 3.4 第四阶段：工程化完善 (Engineering)

1.  **Monorepo 支持**：
    - 识别项目根目录下的 `lerna.json` 或 `pnpm-workspace.yaml`。
    - 允许在 Monorepo 的特定子包（packages/\*）中生成代码。
2.  **测试覆盖率**：
    - 增加集成测试，模拟 CLI 执行流程，确保生成的项目能成功启动。

## 4. 实施路线图 (Roadmap)

- **Week 1**: 引入 `inquirer`，改造 `src/command/create_project.js` 支持交互式创建。
- **Week 2**: 实现 `.koattyrc` 配置读取，解耦硬编码的模板 URL。
- **Week 3**: POC 验证：使用 `ts-morph` 替代一个简单模块（如 Service）的注册逻辑，评估性能与稳定性。
- **Week 4**: 全面优化 UI 输出，完善文档与帮助信息。
