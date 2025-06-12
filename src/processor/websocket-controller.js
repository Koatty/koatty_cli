/*
 * @Description: WebSocket控制器处理器
 * @Usage: 处理WebSocket控制器创建逻辑
 * @Author: richen
 * @Date: 2025-03-10 16:30:00
 * @LastEditTime: 2025-03-10 16:30:00
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const ufs = require('../utils/fs');
const string = require('../utils/sting');

/**
 * WebSocket处理器
 * @param {*} args 
 * @param {*} templatePath 
 * @returns 
 */
function websocketProcessor(args, templatePath) {
  // 使用WebSocket模板
  const sourcePath = path.resolve(templatePath, 'controller_ws.template');
  if (ufs.isExist(sourcePath)) {
    args.destMap[sourcePath] = args.destMap[args.sourcePath];
    args.destMap[args.sourcePath] = '';
  }
  
  // 设置路由路径
  if (args.subModule) {
    args.replaceMap['_NEW'] = `/${args.subModule}/${args.sourceName}`;
  } else {
    args.replaceMap['_NEW'] = `/${args.sourceName}`;
  }
  
  return args;
}

module.exports = { websocketProcessor };
