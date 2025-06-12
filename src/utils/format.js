/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-03-10 16:16:01
 * @LastEditTime: 2025-03-10 16:17:23
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const { format, resolveConfig } = require('prettier');
const path = require('path');
const fs = require('fs-extra');

async function writeAndFormatFile(filePath, content) {
  try {
    // 第一步：写入原始内容
    await fs.writeFile(filePath, content);

    // 第二步：读取文件内容进行格式化
    const rawCode = await fs.readFile(filePath, 'utf-8');

    // 第三步：获取项目配置（优先使用项目本地prettier配置）
    const config = await resolveConfig(filePath);

    // 第四步：格式化代码
    const formatted = await format(rawCode, {
      ...config,
      filepath: filePath, // 自动识别文件类型
      parser: getParser(filePath) // 自定义类型判断
    });

    // 第五步：回写格式化后的内容
    await fs.writeFile(filePath, formatted);

  } catch (error) {
    console.error(`Formatting failed for ${filePath}:`, error);
    // 格式化失败时不应该阻断流程，保持原始内容
  }
}

// 文件类型判断逻辑
function getParser(filePath) {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);
  
  // 特殊文件名处理
  if (basename === '.koattysrc' || basename.endsWith('.koattysrc')) {
    return 'json';
  }
  
  const map = {
    '.js': 'babel',
    '.ts': 'typescript',
    '.json': 'json',
    '.html': 'html',
    '.css': 'css',
    '.graphql': 'graphql',
    '.proto': 'proto'
  };
  return map[ext] || 'babel';
}

module.exports = { writeAndFormatFile };