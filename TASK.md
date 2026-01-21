# Koatty CLI MVP 构建计划

本计划旨在分步将 Koatty CLI 升级为支持交互式操作和基础配置能力的 MVP 版本。
所有任务均设计为原子化操作，适合 AI 辅助编程逐个执行。

> **注意**: 本项目目前使用 CommonJS 规范 (`require`)，安装新依赖时请注意版本兼容性（如 `inquirer` 建议使用 v8 版本以支持 CJS）。

## 阶段一：基础架构与依赖 (Infrastructure)

### Task 1: 安装交互式依赖

- **目标**: 为项目添加交互式命令行所需的依赖库。
- **操作**:
  - 运行 `npm install inquirer@8.2.6` (锁定 v8 版本以兼容 CommonJS)。
  - 检查 `package.json` 确认依赖已添加。
- **验证**:
  - 运行 `node -e "require('inquirer')"` 无报错。

### Task 2: 创建交互工具模块

- **目标**: 封装通用的交互提示逻辑，避免代码重复。
- **文件**: 创建 `src/utils/interactive.js`。
- **内容**:
  - 引入 `inquirer`。
  - 导出函数 `promptInput(message, defaultVal)`: 用于获取通用文本输入。
  - 导出函数 `promptSelect(message, choices, defaultVal)`: 用于获取列表选择。
- **验证**:
  - 创建一个临时测试脚本 `test/manual-prompt.js` 调用该模块，运行并确认能正常接收用户输入。

## 阶段二：交互式创建项目 (Interactive Project Creation)

### Task 3: 改造 CLI 入口命令定义 (Project)

- **目标**: 允许 `koatty new` 不带参数运行，从而触发交互模式。
- **文件**: `src/index.js`
- **操作**:
  - 将 `.command('new <projectName>')` 修改为 `.command('new [projectName]')`。
  - 将 `.command('project <projectName>')` 修改为 `.command('project [projectName]')`。
- **验证**:
  - 运行 `bin/koatty new`，确认不再提示 "error: missing required argument 'projectName'"，而是执行（虽然目前可能会报错或无反应，取决于原有逻辑）。

### Task 4: 实现项目创建的交互逻辑

- **目标**: 当缺少参数时，自动询问项目名称和模板类型。
- **文件**: `src/command/create_project.js`
- **操作**:
  - 引入 `src/utils/interactive.js`。
  - 在 `create` 函数开头添加逻辑：
    - 如果 `projectName` 为空，调用 `promptInput` 询问 "Please enter the project name:"。
    - 如果 `options.template` 为默认值或未指定，且用户未显式传入 flag，考虑调用 `promptSelect` 询问 "Select template type" (Project, Plugin, Middleware)。
- **验证**:
  - 运行 `node src/index.js new` (不带参数)，确认会询问项目名称。
  - 输入名称后，确认流程继续执行。

## 阶段三：交互式创建模块 (Interactive Module Creation)

### Task 5: 改造 CLI 入口命令定义 (Controller)

- **目标**: 允许 `koatty controller` 不带参数运行。
- **文件**: `src/index.js`
- **操作**:
  - 将 `.command('controller <controllerName>')` 修改为 `.command('controller [controllerName]')`。
  - 保持其他 options 不变。
- **验证**:
  - 运行 `node src/index.js controller`，确认不再报错缺少参数。

### Task 6: 实现 Controller 的交互逻辑

- **目标**: 当缺少参数时，询问 Controller 名称和类型（HTTP/gRPC/WebSocket）。
- **文件**: `src/command/create_module.js`
- **操作**:
  - 引入 `src/utils/interactive.js`。
  - 找到 `createController` 调用前的逻辑（在 `module.exports` 主函数中）。
  - 如果 `type === 'controller'` 且 `name` 为空：
    - 询问 "Enter controller name"。
    - 询问 "Select controller type" (选项来自 `src/processor/controller` 支持的类型：http, grpc, websocket等)。
    - 将用户选择赋值给 `opt.type`。
- **验证**:
  - 在一个 Koatty 项目根目录下，运行 `koatty controller`，确认会引导输入名称并选择类型。

## 阶段四：配置加载能力 (Configuration)

### Task 7: 创建配置加载器

- **目标**: 支持读取用户自定义配置（如自定义模板源）。
- **文件**: 创建 `src/utils/config_loader.js`。
- **操作**:
  - 实现逻辑读取用户主目录下的 `.koattyrc` (JSON格式)。
  - 如果文件存在，读取并解析；不存在则返回空对象。
  - 导出 `loadConfig()` 函数。
- **验证**:
  - 在 `~/.koattyrc` 写入 `{ "author": "test_user" }`。
  - 写脚本调用 `loadConfig()` 确认能读取到内容。

### Task 8: 集成配置到模板下载

- **目标**: 允许通过配置文件覆盖默认的模板 URL。
- **文件**: `src/utils/template.js`
- **操作**:
  - 引入 `loadConfig`。
  - 修改 `loadAndUpdateTemplate` 函数。
  - 在使用默认 `templateUrl` 之前，检查配置中是否有对应的 URL 覆盖（例如 `config.template_url` 覆盖 `TEMPLATE_URL`）。
- **验证**:
  - 修改 `~/.koattyrc` 指向一个自定义的 Git 仓库。
  - 运行 `koatty new test-custom`，观察日志确认是否尝试从新 URL 下载。

## 阶段五：清理与收尾

### Task 9: 统一错误提示与帮助

- **目标**: 优化当用户取消交互（Ctrl+C）时的表现。
- **文件**: `src/utils/interactive.js`
- **操作**:
  - 在 `prompt` 函数中捕获错误。
  - 如果是强制退出，优雅地 `process.exit(0)` 而不是打印一大堆错误堆栈。
- **验证**:
  - 运行 `koatty new`，在输入名称时按 Ctrl+C，确认退出干净利落。

## 阶段六：Monorepo 集成与本地模版 (Monorepo & Local Templates)

### Task 10: 集成模版文件

- **目标**: 将 3 个远程模版仓库克隆到本地 `templates` 目录，使其成为本项目的一部分。
- **操作**:
  - 在根目录创建 `templates` 文件夹。
  - 克隆 `koatty_template` 到 `templates/project`。
  - 克隆 `koatty_template_cli` 到 `templates/module` (用于生成 Controller/Service 等)。
  - 克隆 `koatty_template_component` 到 `templates/component` (用于生成 Middleware/Plugin)。
  - **关键**: 删除这三个目录下的 `.git` 文件夹，确保它们作为普通文件被提交。
  - 检查 `package.json`，如果存在 `files` 字段，确保添加 `"templates"`；如果不存在则无需修改（默认发布所有文件）。
- **验证**:
  - 运行 `ls -R templates` 确认文件结构存在。

### Task 11: 改造配置支持本地路径

- **目标**: 修改配置使其指向本地目录，而非远程 Git URL。
- **文件**: `src/command/config.js`
- **操作**:
  - 使用 `path.join(__dirname, '../../templates/...')` 定义模版路径。
  - 保留 `TEMPLATE_URL` 等常量作为备用（或者标记为已废弃），新增 `TEMPLATE_PATH` 等常量指向本地。
  - 示例: `TEMPLATE_PATH: path.join(__dirname, '../../templates/project')`。
- **验证**:
  - 创建一个测试脚本打印这些路径，确认解析出的绝对路径是正确的。

### Task 12: 改造模版加载逻辑

- **目标**: 优先使用本地集成模版，无需网络下载。
- **文件**: `src/utils/template.js`
- **操作**:
  - 修改 `loadAndUpdateTemplate` 函数。
  - 逻辑变更：
    1. 接收参数时，判断传入的是 URL 还是本地路径（或优先检查配置中的本地路径）。
    2. 如果是本地路径且存在：直接返回该路径（或将其复制到临时目录，视原有逻辑对源文件的破坏性而定，通常建议直接读取，或者复制到 target）。
    3. 原有的 Git 下载逻辑作为 `Fallback` 或被完全移除（取决于是否还想支持动态更新）。
  - 建议保留：如果本地 `templates` 目录不存在（可能是 npm包安装问题），则回退到 Git 下载。
- **验证**:
  - 断开网络。
  - 运行 `koatty new offline-project`。
  - 确认在无网环境下能成功创建项目。
