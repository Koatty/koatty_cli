/*
 * @Description: Jest测试配置
 * @Usage: Jest测试框架的配置文件
 * @Author: richen
 * @Date: 2025-06-12
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 根目录
  rootDir: '.',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/**/?(*.)+(spec|test).js'
  ],
  
  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test/output/',
    '/test/temp_*/',
    '/test/template/'
  ],
  
  // 覆盖率收集
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage',
  
  // 测试超时时间（毫秒）
  testTimeout: 300000, // 5分钟
  
  // 设置文件
  setupFilesAfterEnv: [],
  
  // 全局变量
  globals: {
    'NODE_ENV': 'test'
  },
  
  // 详细输出
  verbose: true,
  
  // 静默模式
  silent: false,
  
  // 错误时停止
  bail: false,
  
  // 最大并发数
  maxConcurrency: 5,
  
  // 强制退出
  forceExit: true,
  
  // 检测打开的句柄
  detectOpenHandles: true,
  
  // 模块文件扩展名
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  
  // 报告器
  reporters: [
    'default'
  ]
}; 