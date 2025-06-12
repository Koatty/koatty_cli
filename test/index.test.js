/*
 * @Description: Koatty CLI 主测试套件
 * @Usage: 整合所有测试模块的主测试文件
 * @Author: richen
 * @Date: 2025-06-12
 */

// 导入所有测试模块
require('./cli-functionality.test.js');
require('./project-creation.test.js');
require('./module-creation.test.js');
require('./websocket-controller.test.js');
require('./comprehensive.test.js');

describe('Koatty CLI Test Suite', () => {
  test('测试套件初始化', () => {
    expect(true).toBe(true);
  });

  test('检查Node.js版本', () => {
    const nodeVersion = process.version;
    console.log(`当前Node.js版本: ${nodeVersion}`);
    
    // 检查Node.js版本是否满足要求（假设需要Node.js 14+）
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(14);
  });

  test('检查测试环境', () => {
    const fs = require('fs');
    const path = require('path');
    
    // 检查关键文件是否存在
    const keyFiles = [
      'package.json',
      'src/index.js',
      'src/command/create_project.js',
      'src/command/create_module.js'
    ];
    
    keyFiles.forEach(file => {
      expect(fs.existsSync(file)).toBe(true);
    });
  });
});
