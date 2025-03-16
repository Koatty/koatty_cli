/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:42:12
 * @LastEditTime: 2025-03-10 20:57:46
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const log = require('../utils/log');
const { parseArgs } = require("./args");

/**
 * Create middleware configuration and return parsed arguments
 * @param {string} name - The name of the middleware
 * @param {string} type - The type of middleware
 * @param {object} opt - Options for middleware
 * @param {string} templatePath - Path to middleware template
 * @returns {object} Parsed arguments with callback for middleware configuration
 */
function createMiddleware(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }
  args.callBack = function () {
    log.log();
    log.log('please modify /app/config/middlewate.ts file:');
    log.log();
    log.log(`list: [..., "${args.newName}"] //加载中间件`);
    log.log('config: { //中间件配置 ');
    log.log(`   "${args.newName}":{ //todo }`);
    log.log('}');

    log.log();
  };
  return args;
}

module.exports = {
  createMiddleware
};