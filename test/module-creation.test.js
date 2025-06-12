/*
 * @Description: 模块创建测试
 * @Usage: 测试各种模块创建功能
 * @Author: richen
 * @Date: 2025-06-12
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const del = require('del');

describe('Module Creation Tests', () => {
  const CLI_PATH = path.join(__dirname, '..', 'src', 'index.js');
  const TEST_OUTPUT_DIR = path.join(__dirname, 'temp_module_test');

  beforeAll(() => {
    // 清理测试输出目录
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
    
    // 创建测试输出目录
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    
    // 创建必要的Koatty项目文件
    fs.writeFileSync(path.join(TEST_OUTPUT_DIR, '.koattysrc'), '{}');
    
    // 创建src目录结构
    const srcDirs = ['controller', 'service', 'middleware', 'model', 'plugin'];
    srcDirs.forEach(dir => {
      fs.mkdirSync(path.join(TEST_OUTPUT_DIR, 'src', dir), { recursive: true });
    });
    
    // 创建基本的package.json
    const packageJson = {
      name: 'test-koatty-app',
      version: '1.0.0',
      dependencies: {
        'koatty': '^1.0.0'
      }
    };
    fs.writeFileSync(path.join(TEST_OUTPUT_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
  });

  beforeEach(() => {
    // 清理并创建测试目录
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      del.sync([TEST_OUTPUT_DIR]);
    }
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    
    // 创建基本的项目结构
    const dirs = [
      'src/controller',
      'src/service',
      'src/middleware',
      'src/model',
      'src/plugin'
    ];
    
    dirs.forEach(dir => {
      fs.mkdirSync(path.join(TEST_OUTPUT_DIR, dir), { recursive: true });
    });
    
    // 创建 .koattysrc 文件
    fs.writeFileSync(
      path.join(TEST_OUTPUT_DIR, '.koattysrc'), 
      JSON.stringify({ projectName: 'test_module' })
    );
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      del.sync([TEST_OUTPUT_DIR]);
    }
  });

  describe('Controller Creation', () => {
    test('应该能创建基本控制器', () => {
      try {
        execSync(`node ${CLI_PATH} controller TestController`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const controllerFile = path.join(TEST_OUTPUT_DIR, 'src', 'controller', 'TestControllerController.ts');
        expect(fs.existsSync(controllerFile)).toBe(true);
        
        const content = fs.readFileSync(controllerFile, 'utf8');
        expect(content).toContain('@Controller');
        expect(content).toContain('TestControllerController');
        
      } catch (error) {
        console.error('控制器创建失败:', error.message);
        throw error;
      }
    });

    test('应该能创建REST控制器', () => {
      try {
        execSync(`node ${CLI_PATH} controller -t rest UserController`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const controllerFile = path.join(TEST_OUTPUT_DIR, 'src', 'controller', 'UserControllerController.ts');
        expect(fs.existsSync(controllerFile)).toBe(true);
        
        const content = fs.readFileSync(controllerFile, 'utf8');
        expect(content).toContain('@Controller');
        expect(content).toContain('UserControllerController');
        
      } catch (error) {
        console.error('REST控制器创建失败:', error.message);
        throw error;
      }
    });

    test('应该能创建WebSocket控制器', () => {
      try {
        execSync(`node ${CLI_PATH} controller -t websocket WSController`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const controllerFile = path.join(TEST_OUTPUT_DIR, 'src', 'controller', 'WSControllerController.ts');
        expect(fs.existsSync(controllerFile)).toBe(true);
        
        const content = fs.readFileSync(controllerFile, 'utf8');
        expect(content).toContain('WSControllerController');
        
      } catch (error) {
        console.error('WebSocket控制器创建失败:', error.message);
        throw error;
      }
    });

    test('应该能创建gRPC控制器', () => {
      try {
        // 先创建proto文件
        execSync(`node ${CLI_PATH} proto GrpcController`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        execSync(`node ${CLI_PATH} controller -t grpc GrpcController`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const controllerFile = path.join(TEST_OUTPUT_DIR, 'src', 'controller', 'GrpcControllerController.ts');
        expect(fs.existsSync(controllerFile)).toBe(true);
        
        const content = fs.readFileSync(controllerFile, 'utf8');
        expect(content).toContain('GrpcControllerController');
        
      } catch (error) {
        console.error('gRPC控制器创建失败:', error.message);
        throw error;
      }
    });
  });

  describe('Service Creation', () => {
    test('应该能创建基本服务', () => {
      try {
        execSync(`node ${CLI_PATH} service TestService`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const serviceFile = path.join(TEST_OUTPUT_DIR, 'src', 'service', 'TestServiceService.ts');
        expect(fs.existsSync(serviceFile)).toBe(true);
        
        const content = fs.readFileSync(serviceFile, 'utf8');
        expect(content).toContain('@Service');
        expect(content).toContain('TestServiceService');
        
      } catch (error) {
        console.error('服务创建失败:', error.message);
        throw error;
      }
    });

    test('应该能创建带子模块的服务', () => {
      try {
        execSync(`node ${CLI_PATH} service user/UserService`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const serviceFile = path.join(TEST_OUTPUT_DIR, 'src', 'service', 'user', 'UserServiceService.ts');
        expect(fs.existsSync(serviceFile)).toBe(true);
        
        const content = fs.readFileSync(serviceFile, 'utf8');
        expect(content).toContain('@Service');
        expect(content).toContain('UserServiceService');
        
      } catch (error) {
        console.error('子模块服务创建失败:', error.message);
        throw error;
      }
    });
  });

  describe('Middleware Creation', () => {
    test('应该能创建中间件', () => {
      try {
        execSync(`node ${CLI_PATH} middleware TestMiddleware`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const middlewareFile = path.join(TEST_OUTPUT_DIR, 'src', 'middleware', 'TestMiddlewareMiddleware.ts');
        expect(fs.existsSync(middlewareFile)).toBe(true);
        
        const content = fs.readFileSync(middlewareFile, 'utf8');
        expect(content).toContain('@Middleware');
        expect(content).toContain('TestMiddlewareMiddleware');
        
      } catch (error) {
        console.error('中间件创建失败:', error.message);
        throw error;
      }
    });
  });

  describe('Model Creation', () => {
    test('应该能创建模型', () => {
      try {
        execSync(`node ${CLI_PATH} model TestModel`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const modelFile = path.join(TEST_OUTPUT_DIR, 'src', 'model', 'TestModelModel.ts');
        expect(fs.existsSync(modelFile)).toBe(true);
        
        const content = fs.readFileSync(modelFile, 'utf8');
        expect(content).toContain('TestModelModel');
        
      } catch (error) {
        console.error('模型创建失败:', error.message);
        throw error;
      }
    });
  });

  describe('Plugin Creation', () => {
    test('应该能创建插件', () => {
      try {
        execSync(`node ${CLI_PATH} plugin TestPlugin`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        const pluginFile = path.join(TEST_OUTPUT_DIR, 'src', 'plugin', 'TestPluginPlugin.ts');
        expect(fs.existsSync(pluginFile)).toBe(true);
        
        const content = fs.readFileSync(pluginFile, 'utf8');
        expect(content).toContain('TestPluginPlugin');
        
      } catch (error) {
        console.error('插件创建失败:', error.message);
        throw error;
      }
    });
  });

  describe('Error Handling', () => {
    test('应该处理无效的控制器类型（回退到默认行为）', () => {
      try {
        execSync(`node ${CLI_PATH} controller -t invalid InvalidController`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        // 无效类型应该回退到默认控制器创建
        const controllerFile = path.join(TEST_OUTPUT_DIR, 'src', 'controller', 'InvalidControllerController.ts');
        expect(fs.existsSync(controllerFile)).toBe(true);
        
        const content = fs.readFileSync(controllerFile, 'utf8');
        expect(content).toContain('@Controller');
        expect(content).toContain('InvalidControllerController');
        
      } catch (error) {
        console.error('无效控制器类型测试失败:', error.message);
        throw error;
      }
    });

    test('应该处理缺少名称参数', () => {
      try {
        execSync(`node ${CLI_PATH} controller`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });
        
        // 如果没有抛出错误，测试失败
        expect(true).toBe(false);
      } catch (error) {
        // 应该有错误信息
        const errorMessage = error.stderr || error.stdout || error.message;
        expect(errorMessage).toMatch(/required|missing/i);
      }
    });
  });

  describe('File Content Validation', () => {
    test('生成的控制器应该有正确的结构', () => {
      try {
        execSync(`node ${CLI_PATH} controller StructureTest`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });

        const controllerFile = path.join(TEST_OUTPUT_DIR, 'src', 'controller', 'StructureTestController.ts');
        expect(fs.existsSync(controllerFile)).toBe(true);
        
        const content = fs.readFileSync(controllerFile, 'utf8');
        
        // 检查基本结构
        expect(content).toContain('import');
        expect(content).toContain('export');
        expect(content).toContain('class StructureTestController');
        expect(content).toContain('@Controller');
        
      } catch (error) {
        console.error('结构测试失败:', error.message);
        throw error;
      }
    });

    test('生成的服务应该有正确的结构', () => {
      try {
        execSync(`node ${CLI_PATH} service StructureTest`, {
          cwd: TEST_OUTPUT_DIR,
          encoding: 'utf8',
          timeout: 30000
        });

        const serviceFile = path.join(TEST_OUTPUT_DIR, 'src', 'service', 'StructureTestService.ts');
        expect(fs.existsSync(serviceFile)).toBe(true);
        
        const content = fs.readFileSync(serviceFile, 'utf8');
        
        // 检查基本结构
        expect(content).toContain('import');
        expect(content).toContain('export');
        expect(content).toContain('class StructureTestService');
        expect(content).toContain('@Service');
        
      } catch (error) {
        console.error('服务结构测试失败:', error.message);
        throw error;
      }
    });
  });
}); 