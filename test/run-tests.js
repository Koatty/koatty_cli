#!/usr/bin/env node

/*
 * @Description: 测试运行脚本
 * @Usage: 执行所有测试用例的脚本
 * @Author: richen
 * @Date: 2025-06-12
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始运行 Koatty CLI 测试套件...\n');

// 检查测试环境
console.log('📋 检查测试环境...');
const requiredFiles = [
  'package.json',
  'src/index.js',
  'src/command/create_project.js',
  'src/command/create_module.js'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ 缺少必要文件:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

console.log('✅ 测试环境检查通过\n');

// 运行测试
const testFiles = [
  'test/cli-functionality.test.js',
  'test/project-creation.test.js', 
  'test/module-creation.test.js',
  'test/websocket-controller.test.js',
  'test/comprehensive.test.js'
];

console.log('🧪 运行测试用例...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testFiles.forEach((testFile, index) => {
  console.log(`📝 运行测试 ${index + 1}/${testFiles.length}: ${testFile}`);
  
  try {
    const result = execSync(`npx jest ${testFile} --verbose`, { 
      encoding: 'utf8',
      timeout: 300000 // 5分钟超时
    });
    
    console.log(`✅ ${testFile} 测试通过`);
    
    // 简单解析测试结果（这是一个基本实现）
    const lines = result.split('\n');
    const testLine = lines.find(line => line.includes('Tests:'));
    if (testLine) {
      const matches = testLine.match(/(\d+) passed/);
      if (matches) {
        const passed = parseInt(matches[1]);
        passedTests += passed;
        totalTests += passed;
      }
    }
    
  } catch (error) {
    console.error(`❌ ${testFile} 测试失败:`);
    console.error(error.message);
    failedTests++;
    
    // 尝试解析失败的测试数量
    const errorOutput = error.stdout || error.message;
    const lines = errorOutput.split('\n');
    const testLine = lines.find(line => line.includes('Tests:'));
    if (testLine) {
      const matches = testLine.match(/(\d+) failed/);
      if (matches) {
        const failed = parseInt(matches[1]);
        totalTests += failed;
      }
    }
  }
  
  console.log(''); // 空行分隔
});

// 输出测试总结
console.log('📊 测试总结:');
console.log(`   总测试数: ${totalTests}`);
console.log(`   通过: ${passedTests}`);
console.log(`   失败: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n🎉 所有测试都通过了！');
  process.exit(0);
} else {
  console.log('\n💥 有测试失败，请检查上面的错误信息');
  process.exit(1);
} 