/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:51:07
 * @LastEditTime: 2025-03-16 11:31:06
 */
const path = require('path');
const replace = require('replace');
const log = require('../utils/log');
const ufs = require('../utils/fs');
const { writeAndFormatFile } = require('../utils/format');
const { LOGO, CLI_TEMPLATE_URL, CLI_TEMPLATE_NAME } = require('./config');
const template = require('../utils/template');
const { processVer } = require('../utils/version');
const { isKoattyApp } = require("../utils/path");
const { createController } = require("../processor/controller");
const { createMiddleware } = require("../processor/middleware");
const { createModel } = require("../processor/model");
const { createPlugin } = require("../processor/model");
const { createService } = require("../processor/service");
const { createDefault } = require("../processor/default");

let templatePath = '';

/**
 * Create a new module in Koatty project.
 * 
 * @param {string} name - The name of the module to create
 * @param {string} type - Module type ('controller', 'middleware', 'model', 'plugin', 'service')
 * @param {Object} opt - Additional options for module creation
 * @returns {Promise<void>}
 * 
 * @description
 * This function creates a new module in a Koatty project based on templates.
 * It validates the project directory, loads templates, and creates the module files.
 * Supports different module types including controllers, middlewares, models,
 * plugins and services.
 * 
 * @throws {Error} If template loading fails or module creation encounters an error
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

