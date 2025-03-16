/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:42:18
 * @LastEditTime: 2025-03-10 20:58:04
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const ufs = require('../utils/fs');
const log = require('../utils/log');
const string = require('../utils/sting');
const { parseArgs } = require("./args");
const { getAppPath } = require("../utils/path");

/**
 * Create model files based on template.
 * 
 * @param {string} name - The model name
 * @param {string} type - The model type
 * @param {object} opt - Options for model creation, including orm type
 * @param {string} templatePath - Path to template files
 * @returns {object} args - Object containing destination paths and replacement mappings
 * 
 * @description
 * Creates model files from templates with proper naming and paths.
 * For typeorm, generates model, entity and plugin files.
 * Provides guidance for plugin configuration.
 */
function createModel(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }
  const orm = opt.orm || 'typeorm';
  if (orm === 'typeorm') {
    const sourcePath = path.resolve(templatePath, `model.${orm}.template`);
    args.destMap[sourcePath] = args.destMap[args.sourcePath];
    args.destMap[args.sourcePath] = "";

    const entityPath = path.resolve(templatePath, `entity.${orm}.template`);
    const entityName = `${string.toPascal(args.sourceName)}Entity`;
    const entityFile = `${entityName}.ts`;
    const entityDest = path.resolve(`${args.destPath}/entity`, entityFile);
    if (!ufs.isExist(entityDest)) {
      args.destMap[entityPath] = entityDest;
    }
    args.replaceMap['_ENTITY_NAME'] = entityName;

    const pluginPath = path.resolve(templatePath, `plugin.${orm}.template`);
    const pluginName = `${string.toPascal(orm)}Plugin`;
    const pluginFile = `${pluginName}.ts`;
    const destPath = path.resolve(`${getAppPath()}/plugin/${pluginFile}`);
    if (!ufs.isExist(destPath)) {
      args.destMap[pluginPath] = destPath;
    }

    args.callBack = function () {
      log.log();
      log.warning('to used the koatty_typeorm plugin:');
      log.log();
      log.log('https://github.com/Koatty/koatty_typeorm');
      log.log();
      log.log('please modify /app/config/plugin.ts file:');
      log.log();
      log.log(`list: [..., "TypeormPlugin"]`);
      log.log('config: { //插件配置 ');
      log.log(`   "TypeormPlugin":{ //todo }`);
      log.log('}');
      log.log();
    };
  }
  if (!ufs.isExist(args.sourcePath)) {
    log.error(`Type ${type} is not supported currently.`);
    process.exit(0);
  }

  return args;
}

module.exports = { createModel };