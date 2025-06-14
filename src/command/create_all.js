/*
 * @Description: 智能批量生成 entity、model、service、controller、dto
 * @Usage: kt module <name> [-t 协议]
 * @Author: AI
 */
const path = require('path');
const log = require('../utils/log');
const ufs = require('../utils/fs');
const { writeAndFormatFile } = require('../utils/format');
const { LOGO, CLI_TEMPLATE_URL, CLI_TEMPLATE_NAME, CLI_TEMPLATE_URL_GITEE } = require('./config');
const template = require('../utils/template');
const { processVer } = require('../utils/version');
const { isKoattyApp } = require('../utils/path');
const { createController } = require('../processor/controller/http');
const { createModel } = require('../processor/model');
const { createService } = require('../processor/service');
const { createDefault } = require('../processor/default');
const fs = require('fs');

/**
 * 智能批量生成 entity、model、service、controller、dto
 * @param {*} name
 * @param {*} opt
 * @returns {Promise<any>}
 */
module.exports = async function (name, opt) {
  log.info('\n Welcome to use Koatty!');
  log.info(LOGO);
  log.info('Start create module...');

  if (!isKoattyApp('./')) {
    log.error('Current project is not a Koatty project.');
    log.error(`Please execute "kt module ${name}" after enter Koatty project root directory.`);
    return;
  }

  // 加载模板
  const templateGit = processVer(CLI_TEMPLATE_URL);
  let templatePath = await template.loadAndUpdateTemplate(templateGit, CLI_TEMPLATE_NAME, '', CLI_TEMPLATE_URL_GITEE);
  if (!templatePath || !ufs.isExist(templatePath)) {
    log.error(`Create module fail, can't find template [${templateGit}], please check network!`);
    return;
  }
  templatePath = path.resolve(templatePath, 'src');

  // 0. grpc协议下，先生成proto文件（已存在则跳过）
  const ctlType = opt && opt.type ? opt.type : 'http';
  if (ctlType === 'grpc') {
    const protoFile = path.resolve(process.cwd(), 'proto', `${name.charAt(0).toUpperCase() + name.slice(1)}.proto`);
    if (!ufs.isExist(protoFile)) {
      const protoArgs = createDefault(name, 'proto', {}, templatePath);
      if (protoArgs) {
        await batchGenerate(protoArgs);
      }
    } else {
      log.info(`Proto file already exists: ${protoFile}, skip generation.`);
    }
  }
  // 0. graphql协议下，先生成schema文件（已存在则跳过）
  if (ctlType === 'graphql') {
    const schemaFile = path.resolve(process.cwd(), 'schema', `${name.charAt(0).toUpperCase() + name.slice(1)}.graphql`);
    if (!ufs.isExist(schemaFile)) {
      const schemaArgs = createDefault(name, 'schema', {}, templatePath);
      if (schemaArgs) {
        await batchGenerate(schemaArgs);
      }
    } else {
      log.info(`GraphQL schema file already exists: ${schemaFile}, skip generation.`);
    }
  }

  // 1. 生成 model（含 entity）
  const modelArgs = createModel(name, 'model', { orm: 'typeorm' }, templatePath);
  await batchGenerate(modelArgs);

  // 2. 生成 service
  const serviceArgs = createService(name, 'service', {}, templatePath);
  await batchGenerate(serviceArgs);

  // 3. 生成 controller（支持多协议）
  const ctlArgs = createController(name, 'controller', { type: ctlType }, templatePath);
  await batchGenerate(ctlArgs);

  // 4. 生成 dto（如有）
  // 目前 dto 主要由 controller 的协议处理器自动生成（如 grpc、graphql），如需单独生成可扩展

  log.success(`Create module [${name}] success!`);
};

/**
 * 批量生成文件
 */
async function batchGenerate(args) {
  const { destMap, createMap, replaceMap, callBack } = args;
  const targetDir = [];
  for (const key in destMap) {
    if (Object.hasOwnProperty.call(destMap, key)) {
      const element = destMap[key];
      if (element) {
        targetDir.push(path.dirname(element));
        await ufs.copyFile(key, element);
      }
    }
  }
  for (const key in createMap) {
    if (Object.hasOwnProperty.call(createMap, key)) {
      const element = createMap[key];
      if (element) {
        let dir = path.dirname(key);
        if (!ufs.isExist(dir)) {
          await ufs.mkDir(dir);
        }
        targetDir.push(dir);
        await writeAndFormatFile(key, element);
      }
    }
  }
  for (let key in replaceMap) {
    require('replace')({
      regex: key,
      replacement: replaceMap[key],
      paths: targetDir,
      recursive: true,
      silent: true,
    });
  }
  callBack && callBack();
} 