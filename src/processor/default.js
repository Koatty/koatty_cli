/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:42:47
 * @LastEditTime: 2025-03-12 17:53:35
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const { parseArgs } = require("./args");


/**
 * Create default arguments for template generation
 * @param {string} name - The name of the template to create
 * @param {string} type - The type of template
 * @param {object} opt - Options for template creation
 * @param {string} templatePath - Path to template directory
 * @returns {object|null} Parsed arguments object or null if parsing fails
 */
function createDefault(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }
  return args;
}
module.exports = { createDefault };