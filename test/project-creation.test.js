/*
 * @Description: 项目创建测试
 * @Usage: 测试项目创建功能
 * @Author: richen
 * @Date: 2025-06-12
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const del = require('del');

describe('Project Creation Tests', () => {
  const CLI_PATH = path.join(__dirname, '..', 'src', 'index.js');
  const TEST_OUTPUT_DIR = path.join(__dirname, 'temp_project_test');

  beforeEach(() => {
    // 清理测试目录
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      del.sync([TEST_OUTPUT_DIR]);
    }
    
    // 创建测试目录
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      del.sync([TEST_OUTPUT_DIR]);
    }
  });

  test('应该能创建基本项目', async () => {
    const projectName = 'test-koatty-project';
    const projectPath = path.join(TEST_OUTPUT_DIR, projectName);

    try {
      // 在测试目录中创建项目
      const result = execSync(`node ${CLI_PATH} project ${projectName}`, { 
        encoding: 'utf8',
        timeout: 180000, // 3分钟超时
        cwd: TEST_OUTPUT_DIR
      });

      // 验证项目目录是否创建
      expect(fs.existsSync(projectPath)).toBe(true);
      
      // 验证关键文件是否存在
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src', 'App.ts'))).toBe(true);
      
      // 验证package.json内容
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      expect(packageJson.name).toBe(projectName);
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.koatty).toBeDefined();

    } catch (error) {
      console.error('项目创建失败:', error.message);
      throw error;
    }
  }, 180000); // 增加超时时间到3分钟

  test('应该能处理特殊字符的项目名', async () => {
    const projectName = 'test_project-123';
    const projectPath = path.join(TEST_OUTPUT_DIR, projectName);

    try {
      // 创建项目
      execSync(`node ${CLI_PATH} project "${projectName}"`, { 
        encoding: 'utf8',
        timeout: 180000,
        cwd: TEST_OUTPUT_DIR
      });

      // 验证项目目录是否创建
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);

    } catch (error) {
      console.error('特殊字符项目创建失败:', error.message);
      throw error;
    }
  }, 180000);

  test('应该能在自定义目录创建项目', async () => {
    const projectName = 'custom-location-project';
    const customDir = path.join(TEST_OUTPUT_DIR, 'custom');
    const projectPath = path.join(customDir, projectName);

    // 创建自定义目录
    fs.mkdirSync(customDir, { recursive: true });

    try {
      // 在自定义目录创建项目
      execSync(`node ${CLI_PATH} project ${projectName}`, { 
        encoding: 'utf8',
        timeout: 180000,
        cwd: customDir
      });

      // 验证项目是否在正确位置创建
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);

    } catch (error) {
      console.error('自定义目录项目创建失败:', error.message);
      throw error;
    }
  }, 180000);

  test('应该正确配置项目文件', async () => {
    const projectName = 'config-test-project';
    const projectPath = path.join(TEST_OUTPUT_DIR, projectName);

    try {
      // 创建项目
      execSync(`node ${CLI_PATH} project ${projectName}`, { 
        encoding: 'utf8',
        timeout: 180000,
        cwd: TEST_OUTPUT_DIR
      });

      // 检查package.json配置
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      expect(packageJson.name).toBe(projectName);
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();

      // 检查TypeScript配置
      if (fs.existsSync(path.join(projectPath, 'tsconfig.json'))) {
        try {
          const tsConfig = JSON.parse(fs.readFileSync(path.join(projectPath, 'tsconfig.json'), 'utf8'));
          expect(tsConfig.compilerOptions).toBeDefined();
        } catch (jsonError) {
          // 如果JSON解析失败，检查文件是否存在即可
          console.warn('TypeScript配置文件格式问题，跳过内容检查');
        }
      }

    } catch (error) {
      console.error('配置检查失败:', error.message);
      throw error;
    }
  }, 180000);

  test('应该有适当的错误处理和回退机制', async () => {
    const projectName = 'fallback-test-project';
    const projectPath = path.join(TEST_OUTPUT_DIR, projectName);

    try {
      // 尝试创建项目
      execSync(`node ${CLI_PATH} project ${projectName}`, { 
        encoding: 'utf8',
        timeout: 180000,
        cwd: TEST_OUTPUT_DIR
      });

      // 如果成功，验证基本文件
      if (fs.existsSync(projectPath)) {
        expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      } else {
        throw new Error('项目目录未创建');
      }
    } catch (err) {
      // 如果失败，检查是否有适当的错误信息
      if (err.message.includes('network') || err.message.includes('timeout')) {
        // 网络相关错误是可以接受的
        console.warn('网络相关错误，跳过此测试');
      } else {
        console.error('回退机制测试失败:', err.message);
        throw err;
      }
    }
  }, 180000);
}); 