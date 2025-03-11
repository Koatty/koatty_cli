/*
 * @Description: 创建项目命令测试
 * @Author: richen
 * @Date: 2025-03-11
 */

const path = require('path');
const replace = require('replace');
const string = require('../src/utils/sting');
const log = require('../src/utils/log');
const ufs = require('../src/utils/fs');
const { TEMPLATE_URL } = require('../src/command/config');
const { writeAndFormatFile } = require('../src/utils/format');
const template = require('../src/utils/template');
const { processVer } = require('../src/utils/version');

// 模拟依赖模块
jest.mock('../src/utils/log');
jest.mock('../src/utils/fs');
jest.mock('../src/utils/template');
jest.mock('../src/utils/version');
jest.mock('replace');
jest.mock('isomorphic-git');
jest.mock('isomorphic-git/http/node');
jest.mock('prettier', () => ({
  resolveConfig: jest.fn().mockResolvedValue({}),
  format: jest.fn().mockImplementation((code) => Promise.resolve(code))
}));

// 手动模拟format.js
jest.mock('../src/utils/format', () => ({
  writeAndFormatFile: jest.fn().mockResolvedValue(undefined)
}));

// 在模拟依赖后导入被测试模块
const createProject = require('../src/command/create_project');

describe('create_project 命令测试', () => {
  // 每个测试前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('当项目目录已存在时应该返回错误', async () => {
    // 模拟项目目录已存在
    ufs.isExist.mockReturnValue(true);

    // 执行创建项目命令
    await createProject('existing-project', {});

    // 验证日志输出
    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('has existed')
    );

    // 验证没有继续执行后续操作
    expect(template.loadAndUpdateTemplate).not.toHaveBeenCalled();
  });

  test('当模板类型不支持时应该返回错误', async () => {
    // 模拟项目目录不存在
    ufs.isExist.mockReturnValue(false);

    // 执行创建项目命令，使用不支持的模板类型
    await createProject('test-project', { template: 'unsupported' });

    // 验证日志输出
    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('Can\'t find template')
    );

    // 验证没有继续执行后续操作
    expect(template.loadAndUpdateTemplate).not.toHaveBeenCalled();
  });

  test('当无法加载模板时应该返回错误', async () => {
    // 模拟项目目录不存在
    ufs.isExist.mockReturnValue(false);

    // 模拟处理版本
    processVer.mockReturnValue(TEMPLATE_URL);

    // 模拟模板加载失败
    template.loadAndUpdateTemplate.mockResolvedValue(null);

    // 执行创建项目命令
    await createProject('test-project', {});

    // 验证日志输出
    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining('can\'t find template')
    );

    // 验证没有继续执行后续操作
    expect(template.copyTemplate).not.toHaveBeenCalled();
  });

  test('成功创建普通项目', async () => {
    // 模拟项目目录不存在
    ufs.isExist.mockReturnValue(false);

    // 模拟处理版本
    processVer.mockReturnValue(TEMPLATE_URL);

    // 模拟模板加载成功
    const templateDir = '/tmp/koatty_template';
    template.loadAndUpdateTemplate.mockResolvedValue(templateDir);

    // 模拟项目名称转换
    const projectName = 'test-project';
    const pascalName = 'TestProject';
    jest.spyOn(string, 'toPascal').mockReturnValue(pascalName);

    // 执行创建项目命令
    await createProject(projectName, { template: 'project' });

    // 验证模板加载
    expect(template.loadAndUpdateTemplate).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );

    // 验证模板复制
    const projectDir = path.resolve('./', projectName);
    expect(template.copyTemplate).toHaveBeenCalledWith(
      templateDir,
      projectDir
    );

    // 验证替换操作
    expect(replace).toHaveBeenCalledWith(
      expect.objectContaining({
        regex: '_PROJECT_NAME',
        replacement: projectName,
        paths: [projectDir],
        recursive: true,
        silent: true,
      })
    );

    expect(replace).toHaveBeenCalledWith(
      expect.objectContaining({
        regex: '_CLASS_NAME',
        replacement: pascalName,
        paths: [projectDir],
        recursive: true,
        silent: true,
      })
    );

    // 验证配置文件创建
    expect(writeAndFormatFile).toHaveBeenCalledWith(
      `${projectDir}/.koattysrc`,
      expect.any(String)
    );

    // 验证删除.git目录
    expect(ufs.rmDir).toHaveBeenCalledWith(`${projectDir}/.git`);

    // 验证成功日志输出
    expect(log.success).toHaveBeenCalledWith(
      expect.stringContaining(`Create project [${projectName}] success!`)
    );
  });

  test('成功创建中间件项目', async () => {
    // 模拟项目目录不存在
    ufs.isExist.mockReturnValue(false);

    // 模拟处理版本
    processVer.mockReturnValue('https://github.com/Koatty/koatty_template_component.git#main');

    // 模拟模板加载成功
    const templateDir = '/tmp/koatty_template_component';
    template.loadAndUpdateTemplate.mockResolvedValue(templateDir);

    // 执行创建项目命令
    const projectName = 'test-middleware';
    const projectDir = path.resolve('./', projectName);
    await createProject(projectName, { template: 'middleware' });

    // 验证模板加载
    expect(template.loadAndUpdateTemplate).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );

    // 验证模板复制
    expect(template.copyTemplate).toHaveBeenCalledWith(
      templateDir,
      projectDir
    );

    // 验证中间件特殊处理
    expect(ufs.moveFile).toHaveBeenCalledWith(
      `${projectDir}/src/middleware.ts`,
      `${projectDir}/index.ts`
    );
    expect(ufs.rmDir).toHaveBeenCalledWith(`${projectDir}/src`);
    expect(ufs.moveFile).toHaveBeenCalledWith(
      `${projectDir}/index.ts`,
      `${projectDir}/src/index.ts`
    );

    // 验证配置文件创建
    expect(writeAndFormatFile).toHaveBeenCalledWith(
      `${projectDir}/.koattysrc`,
      expect.any(String)
    );

    // 验证删除.git目录
    expect(ufs.rmDir).toHaveBeenCalledWith(`${projectDir}/.git`);

    // 验证成功日志输出
    expect(log.success).toHaveBeenCalledWith(
      expect.stringContaining(`Create project [${projectName}] success!`)
    );
  });

  test('成功创建插件项目', async () => {
    // 模拟项目目录不存在
    ufs.isExist.mockReturnValue(false);

    // 模拟处理版本
    processVer.mockReturnValue('https://github.com/Koatty/koatty_template_component.git#main');

    // 模拟模板加载成功
    const templateDir = '/tmp/koatty_template_component';
    template.loadAndUpdateTemplate.mockResolvedValue(templateDir);

    // 执行创建项目命令
    const projectName = 'test-plugin';
    const projectDir = path.resolve('./', projectName);
    await createProject(projectName, { template: 'plugin' });

    // 验证模板加载
    expect(template.loadAndUpdateTemplate).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );

    // 验证模板复制
    expect(template.copyTemplate).toHaveBeenCalledWith(
      templateDir,
      projectDir
    );

    // 验证插件特殊处理
    expect(ufs.moveFile).toHaveBeenCalledWith(
      `${projectDir}/src/plugin.ts`,
      `${projectDir}/index.ts`
    );
    expect(ufs.rmDir).toHaveBeenCalledWith(`${projectDir}/src`);
    expect(ufs.moveFile).toHaveBeenCalledWith(
      `${projectDir}/index.ts`,
      `${projectDir}/src/index.ts`
    );

    // 验证配置文件创建
    expect(writeAndFormatFile).toHaveBeenCalledWith(
      `${projectDir}/.koattysrc`,
      expect.any(String)
    );

    // 验证删除.git目录
    expect(ufs.rmDir).toHaveBeenCalledWith(`${projectDir}/.git`);

    // 验证成功日志输出
    expect(log.success).toHaveBeenCalledWith(
      expect.stringContaining(`Create project [${projectName}] success!`)
    );
  });

  test('创建项目过程中出现错误应该被捕获', async () => {
    // 模拟项目目录不存在
    ufs.isExist.mockReturnValue(false);

    // 模拟处理版本
    processVer.mockReturnValue(TEMPLATE_URL);

    // 模拟模板加载成功
    const templateDir = '/tmp/koatty_template';
    template.loadAndUpdateTemplate.mockResolvedValue(templateDir);

    // 模拟复制模板时出错
    const error = new Error('Copy template failed');
    template.copyTemplate.mockRejectedValue(error);

    // 执行创建项目命令
    await createProject('test-project', {});

    // 验证错误日志输出
    expect(log.error).toHaveBeenCalledWith(error.message);

    // 验证没有继续执行后续操作
    expect(log.success).not.toHaveBeenCalled();
  });
});
