/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:51:07
 * @LastEditTime: 2025-03-10 16:20:32
 */
const path = require('path');
const replace = require('replace');
const string = require('../utils/sting');
const log = require('../utils/log');
const ufs = require('../utils/fs');
const { writeAndFormatFile } = require('../utils/format');
const { LOGO, CLI_TEMPLATE_URL, CLI_TEMPLATE_NAME, CTL_IMPORT, CTL_METHOD } = require('./config');
const template = require('../utils/template');
const { regex } = require('replace/bin/shared-options');
const { processVer } = require('../utils/version');
const { grpcProcessor } = require("../processor/grpc-controller");
const { isKoattyApp, getAppPath } = require("../utils/path");
const { createController } = require("../processor/controller");
const { createMiddleware } = require("../processor/middleware");
const { createModel } = require("../processor/model");
const { createPlugin } = require("../processor/model");
const { createService } = require("../processor/service");
const { createDefault } = require("../processor/default");

let templatePath = '';
/**
 * create module
 *
 * @param {*} name
 * @param {*} type
 * @param {*} opt
 * @returns {Promise<any>}  
 */
module.exports = async function (name, type, opt) {
  log.info('\n Welcome to use Koatty!');
  log.info(LOGO);
  log.info('Start create module...');

  // check is TKoatty project root directory
  if (!isKoattyApp('./')) {
    log.error('Current project is not a Koatty project.');
    log.error(`Please execute "koatty ${type} ${name}Name" after enter Koatty project root directory.`);
    return;
  }

  // process ver
  const templateGit = processVer(CLI_TEMPLATE_URL);
  // template dir
  templatePath = await template.loadAndUpdateTemplate(templateGit, CLI_TEMPLATE_NAME);
  if (!templatePath || !ufs.isExist(templatePath)) {
    log.error(`Create module fail, can't find template [${templateGit}], please check network!`);
    return;
  }
  // add prefix
  templatePath = path.resolve(templatePath, "src");

  let args = {};
  try {
    switch (type) {
      case 'controller':
        args = createController(name, type, opt, templatePath);
        break;
      case 'middleware':
        args = createMiddleware(name, type, opt, templatePath);
        break;
      case 'model':
        args = createModel(name, type, opt, templatePath);
        break;
      case 'plugin':
        args = createPlugin(name, type, opt, templatePath);
        break;
      case 'service':
        args = createService(name, type, opt, templatePath);
        break;
      default:
        args = createDefault(name, type, opt, templatePath);
        break;
    }

    const { newName, destMap, createMap, replaceMap, callBack } = args;

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
      replace({
        regex: key,
        replacement: replaceMap[key],
        paths: targetDir,
        recursive: true,
        silent: true,
      });
    }

    log.log();
    log.success(`Create module [${newName}] success!`);
    log.log();

    callBack && callBack();
  } catch (error) {
    log.error(`Create module error: ${error.message}`);
    return;
  }
};

