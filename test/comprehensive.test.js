/*
 * @Description: 全面测试脚本
 * @Usage: 测试Koatty CLI的各种功能场景
 * @Author: richen
 * @Date: 2025-06-12
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      timeout: 30000,
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message, stderr: error.stderr };
  }
}

function setupTestProject(projectName) {
  const projectDir = path.join(__dirname, projectName);
  
  // 清理已存在的项目
  if (fs.existsSync(projectDir)) {
    execSync(`rm -rf ${projectDir}`);
  }
  
  // 创建项目目录
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'src', 'controller'), { recursive: true });
  
  // 创建 .koattysrc 文件
  fs.writeFileSync(path.join(projectDir, '.koattysrc'), JSON.stringify({ projectName }));
  
  // 创建基本的 package.json
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
    name: projectName,
    version: '1.0.0',
    dependencies: { koatty: '^3.0.0' }
  }, null, 2));
  
  return projectDir;
}

function cleanupTestProject(projectDir) {
  if (fs.existsSync(projectDir)) {
    execSync(`rm -rf ${projectDir}`);
  }
}

describe('Koatty CLI 综合测试', () => {
  const originalCwd = process.cwd();
  
  afterEach(() => {
    process.chdir(originalCwd);
  });

  // 1. 测试CLI基本功能
  test('CLI帮助信息显示', () => {
    const result = execCommand('node ../src/index.js --help', { cwd: __dirname });
    expect(result.success).toBe(true);
    expect(result.output).toContain('Usage:');
  });

  test('CLI版本信息显示', () => {
    const result = execCommand('node ../src/index.js --version', { cwd: __dirname });
    expect(result.success).toBe(true);
    expect(result.output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  // 2. 测试WebSocket控制器创建
  test('WebSocket控制器创建 - 基本功能', () => {
    const projectDir = setupTestProject('test_websocket_basic');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js controller -t websocket TestWebSocket');
      
      const controllerFile = path.join(projectDir, 'src', 'controller', 'TestWebSocketController.ts');
      const fileExists = fs.existsSync(controllerFile);
      
      if (fileExists) {
        const content = fs.readFileSync(controllerFile, 'utf8');
        const hasWebSocketDecorator = content.includes('@WebSocketController');
        expect(hasWebSocketDecorator).toBe(true);
      } else {
        expect(fileExists).toBe(true);
      }
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  test('WebSocket控制器创建 - 子模块', () => {
    const projectDir = setupTestProject('test_websocket_submodule');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js controller -t websocket chat/ChatWebSocket');
      
      const controllerFile = path.join(projectDir, 'src', 'controller', 'chat', 'ChatWebSocketController.ts');
      expect(fs.existsSync(controllerFile)).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  // 3. 测试其他控制器类型
  test('HTTP控制器创建', () => {
    const projectDir = setupTestProject('test_http_controller');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js controller TestHttp');
      
      const controllerFile = path.join(projectDir, 'src', 'controller', 'TestHttpController.ts');
      expect(fs.existsSync(controllerFile)).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  test('gRPC控制器创建', () => {
    const projectDir = setupTestProject('test_grpc_controller');
    
    try {
      process.chdir(projectDir);
      // 先创建proto文件
      const protoResult = execCommand('node ../../src/index.js proto TestGrpc');
      expect(protoResult.success).toBe(true);
      
      // 再创建gRPC控制器
      const result = execCommand('node ../../src/index.js controller -t grpc TestGrpc');
      expect(result.success).toBe(true);
      
      const controllerFile = path.join(projectDir, 'src', 'controller', 'TestGrpcController.ts');
      expect(fs.existsSync(controllerFile)).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  }, 60000); // 增加超时时间

  // 4. 测试错误处理
  test('非Koatty项目中创建控制器', () => {
    const projectDir = path.join(__dirname, 'test_non_koatty');
    
    try {
      if (fs.existsSync(projectDir)) {
        execSync(`rm -rf ${projectDir}`);
      }
      fs.mkdirSync(projectDir);
      
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js controller TestController');
      
      // 应该失败并显示错误信息
      expect(!result.success || result.output.includes('not a Koatty project')).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  test('无效控制器类型', () => {
    const projectDir = setupTestProject('test_invalid_type');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js controller -t invalid TestController');
      
      // 应该成功（使用默认模板）
      expect(result.success).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  // 5. 测试其他模块创建
  test('中间件创建', () => {
    const projectDir = setupTestProject('test_middleware');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js middleware TestMiddleware');
      
      const middlewareFile = path.join(projectDir, 'src', 'middleware', 'TestMiddlewareMiddleware.ts');
      expect(fs.existsSync(middlewareFile)).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  test('服务创建', () => {
    const projectDir = setupTestProject('test_service');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js service TestService');
      
      const serviceFile = path.join(projectDir, 'src', 'service', 'TestServiceService.ts');
      expect(fs.existsSync(serviceFile)).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  test('模型创建', () => {
    const projectDir = setupTestProject('test_model');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js model TestModel');
      
      const modelFile = path.join(projectDir, 'src', 'model', 'TestModelModel.ts');
      expect(fs.existsSync(modelFile)).toBe(true);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });

  // 6. 测试边界情况
  test('特殊字符处理', () => {
    const projectDir = setupTestProject('test_special_chars');
    
    try {
      process.chdir(projectDir);
      const result = execCommand('node ../../src/index.js controller "Test-Controller_123"');
      
      // 检查是否能正确处理特殊字符
      const files = fs.readdirSync(path.join(projectDir, 'src', 'controller'));
      expect(files.length).toBeGreaterThan(0);
    } finally {
      process.chdir(originalCwd);
      cleanupTestProject(projectDir);
    }
  });
}); 