/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 13:57:19
 * @LastEditTime: 2025-03-10 15:48:36
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const ufs = require('../utils/fs');
const log = require('../utils/log');
const string = require('../utils/sting');
const { getAppPath } = require("../utils/path");

/**
 * 路径参数处理
 * @param {*} name 
 * @param {*} type 
 * @param {*} templatePath 
 * @returns 
 */
module.exports = {
  parseArgs(name, type, templatePath) {
    let destPath = path.resolve(`${getAppPath()}/${type}/`);

    const sourcePath = path.resolve(templatePath, `${type}.template`);
    if (!ufs.isExist(sourcePath)) {
      log.error(`Type ${type} is not supported currently.`);
      return;
    }
    let subModule = '', sourceName = '';
    const subNames = name.split('/');
    if (subNames.length > 1) {
      subModule = subNames[0];
      sourceName = subNames[1];
      destPath = `${destPath}/${subModule.toLowerCase()}`;
    } else {
      sourceName = subNames[0];
    }
    let subFix = ".ts"
    let newName = `${string.toPascal(sourceName)}${string.toPascal(type)}`;
    let camelName = `${sourceName}${string.toPascal(type)}`;
    if (type == "proto") {
      subFix = ".proto"
      newName = `${string.toPascal(sourceName)}`;
      camelName = `${string.toPascal(sourceName)}`;
    }
    const destFile = path.resolve(destPath, `${newName}${subFix}`);

    // replace map
    const replaceMap = {
      '_SUB_PATH': subModule ? '../..' : '..',
      '_NEW': sourceName,
      '_CLASS_NAME': newName,
      '_CAMEL_NAME': camelName
    };

    //if target file is exist, ignore it
    if (ufs.isExist(destFile) && type != "controller") {
      log.error('Module existed' + ' : ' + destFile);
      return;
    }

    const destMap = {
      [sourcePath]: destFile,
    };
    const createMap = {};
    return { sourceName, sourcePath, newName, subModule, destMap, createMap, replaceMap, destPath, destFile };
  }
}