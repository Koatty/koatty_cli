/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:42:18
 * @LastEditTime: 2025-02-27 14:02:51
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const ufs = require('../utils/fs');
const log = require('../utils/log');
const string = require('../utils/sting');
const { parseArgs } = require('./args');
const { isKoattyApp, getAppPath } = require('../utils/path');
const fs = require('fs');
const JSON5 = require('json5');
const { TYPEORM_PLUGIN_CONFIG } = require('../command/config');

/**
 * 
 * @param {*} name 
 * @param {*} type 
 * @param {*} opt 
 * @param {*} templatePath 
 * @returns 
 */
function createModel(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }
  const orm = opt && opt.orm ? opt.orm : 'typeorm';
  if (orm === 'typeorm') {
    const sourcePath = path.resolve(templatePath, `model.${orm}.template`);
    args.destMap[sourcePath] = args.destMap[args.sourcePath];
    args.destMap[args.sourcePath] = '';

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
      addTypeormPluginConfig();
      log.log();
      log.warning('to used the koatty_typeorm plugin:');
      log.log();
      log.log('https://github.com/Koatty/koatty_typeorm');
      log.log();
      log.log();
    };
  }
  if (!ufs.isExist(args.sourcePath)) {
    log.error(`Type ${type} is not supported currently.`);
    process.exit(0);
  }

  return args;
}

// 自动追加TypeormPlugin到src/config/plugin.ts
function addTypeormPluginConfig() {
  const configDir = path.resolve(process.cwd(), 'src/config');
  const configFile = path.resolve(configDir, 'plugin.ts');
  if (!ufs.isExist(configFile)) {
    log.warning('未检测到 src/config/plugin.ts，请手动添加 TypeormPlugin 配置。');
    log.warning('建议内容：');
    log.warning('list: [\'TypeormPlugin\']');
    log.warning('config: { TypeormPlugin: ... }');
    return;
  }
  let content = fs.readFileSync(configFile, 'utf-8');
  // 检查 list
  const listMatch = content.match(/list:\s*\[([\s\S]*?)\]/);
  let hasList = false;
  if (listMatch) {
    hasList = /['"]TypeormPlugin['"]/.test(listMatch[1]);
  }
  // 检查 config
  const configMatch = content.match(/config:\s*\{([\s\S]*?)\n\s*\}/);
  let hasConfig = false;
  if (configMatch) {
    hasConfig = /TypeormPlugin/.test(configMatch[1]);
  }
  if (!hasList) {
    log.warning('plugin.ts 的 list 未包含 TypeormPlugin，请手动追加：');
    log.warning('list: [..., \'TypeormPlugin\']');
  }
  if (!hasConfig) {
    log.warning('plugin.ts 的 config 未包含 TypeormPlugin，请手动追加：');
    log.warning('config: { ... , TypeormPlugin: ' + JSON.stringify(TYPEORM_PLUGIN_CONFIG.TypeormPlugin, null, 2) + ' }');
  }
  if (hasList && hasConfig) {
    log.success('plugin.ts 已包含 TypeormPlugin，无需手动追加。');
  }
}

module.exports = { createModel };
