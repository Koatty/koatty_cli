/*
 * @Description: WebSocket控制器测试
 * @Usage: 测试WebSocket控制器创建功能
 * @Author: richen
 * @Date: 2025-06-12
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('WebSocket Controller Tests', () => {
  const testProjectDir = path.join(__dirname, 'temp_websocket_test');

  beforeEach(() => {
    // 清理并创建测试项目
    if (fs.existsSync(testProjectDir)) {
      execSync(`rm -rf ${testProjectDir}`);
    }
    
    fs.mkdirSync(testProjectDir, { recursive: true });
    fs.mkdirSync(path.join(testProjectDir, 'src', 'controller'), { recursive: true });
    
    // 创建 .koattysrc 文件
    fs.writeFileSync(
      path.join(testProjectDir, '.koattysrc'), 
      JSON.stringify({ projectName: 'test_websocket' })
    );
  });

  afterEach(() => {
    // 清理测试项目
    if (fs.existsSync(testProjectDir)) {
      execSync(`rm -rf ${testProjectDir}`);
    }
  });

  test('应该能创建基本的WebSocket控制器', () => {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(testProjectDir);
      
      // 执行创建命令
      const result = execSync(
        'node ../../src/index.js controller -t websocket TestWebSocket',
        { encoding: 'utf8', timeout: 30000 }
      );
      
      // 检查文件是否创建
      const controllerFile = path.join(testProjectDir, 'src', 'controller', 'TestWebSocketController.ts');
      expect(fs.existsSync(controllerFile)).toBe(true);
      
      // 检查文件内容
      const content = fs.readFileSync(controllerFile, 'utf8');
      expect(content).toContain('@WebSocketController');
      expect(content).toContain('TestWebSocketController');
      expect(content).toContain('/TestWebSocket');
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('应该能创建带子模块的WebSocket控制器', () => {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(testProjectDir);
      
      // 执行创建命令
      execSync(
        'node ../../src/index.js controller -t websocket chat/ChatWebSocket',
        { encoding: 'utf8', timeout: 30000 }
      );
      
      // 检查文件是否在正确的子目录中创建
      const controllerFile = path.join(testProjectDir, 'src', 'controller', 'chat', 'ChatWebSocketController.ts');
      expect(fs.existsSync(controllerFile)).toBe(true);
      
      // 检查文件内容
      const content = fs.readFileSync(controllerFile, 'utf8');
      expect(content).toContain('@WebSocketController');
      expect(content).toContain('ChatWebSocketController');
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('应该正确处理WebSocket控制器的路由路径', () => {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(testProjectDir);
      
      // 创建带子模块的控制器
      execSync(
        'node ../../src/index.js controller -t websocket api/UserWebSocket',
        { encoding: 'utf8', timeout: 30000 }
      );
      
      const controllerFile = path.join(testProjectDir, 'src', 'controller', 'api', 'UserWebSocketController.ts');
      const content = fs.readFileSync(controllerFile, 'utf8');
      
      // 检查路由路径是否正确设置
      expect(content).toContain('/api/UserWebSocket');
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('应该能处理特殊字符的控制器名称', () => {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(testProjectDir);
      
      // 创建带特殊字符的控制器
      execSync(
        'node ../../src/index.js controller -t websocket "Test_WebSocket-123"',
        { encoding: 'utf8', timeout: 30000 }
      );
      
      // 检查是否有文件被创建（文件名会被处理）
      const controllerDir = path.join(testProjectDir, 'src', 'controller');
      const files = fs.readdirSync(controllerDir);
      expect(files.length).toBeGreaterThan(0);
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('应该在非Koatty项目中显示错误', () => {
    const nonKoattyDir = path.join(__dirname, 'temp_non_koatty');
    const originalCwd = process.cwd();
    
    try {
      // 创建一个没有.koattysrc的目录
      if (fs.existsSync(nonKoattyDir)) {
        execSync(`rm -rf ${nonKoattyDir}`);
      }
      fs.mkdirSync(nonKoattyDir);
      
      process.chdir(nonKoattyDir);
      
      // 尝试创建控制器，应该显示错误消息
      const result = execSync(
        'node ../../src/index.js controller -t websocket TestWebSocket',
        { encoding: 'utf8', timeout: 10000 }
      );
      
      // 检查输出是否包含错误消息
      expect(result).toContain('Current project is not a Koatty project');
      expect(result).toContain('Please execute');
      
    } finally {
      // 确保总是恢复原始目录
      process.chdir(originalCwd);
      
      // 清理测试目录
      if (fs.existsSync(nonKoattyDir)) {
        execSync(`rm -rf ${nonKoattyDir}`);
      }
    }
  });
}); 