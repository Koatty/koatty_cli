/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:42:47
 * @LastEditTime: 2025-02-27 14:03:44
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const { parseArgs } = require('./args');

/**
 * 
 * @param {*} name 
 * @param {*} type 
 * @param {*} opt 
 * @param {*} templatePath 
 * @returns 
 */
function createDefault(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }

  return args;
}

module.exports = { createDefault };