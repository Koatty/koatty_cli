/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:42:32
 * @LastEditTime: 2025-02-27 14:00:44
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const log = require('../utils/log');
const { parseArgs } = require('./args');

/**
 * 
 * @param {*} name 
 * @param {*} type 
 * @param {*} opt 
 * @param {*} templatePath 
 * @returns 
 */
function createPlugin(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }
  args.callBack = function () {
    log.log();
    log.log('please modify /app/config/plugin.ts file:');
    log.log();
    log.log(`list: [..., "${args.newName}"] //加载的插件列表,执行顺序按照数组元素顺序`);
    log.log('config: { //插件配置 ');
    log.log(`   "${args.newName}":{ //todo }`);
    log.log('}');

    log.log();
  };
  return args;
}

module.exports = { createPlugin };