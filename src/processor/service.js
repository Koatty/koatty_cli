/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:42:40
 * @LastEditTime: 2025-03-10 20:58:38
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const ufs = require('../utils/fs');
const { parseArgs } = require("./args");

/**
 * 
 * @param {*} name 
 * @param {*} type 
 * @param {*} opt 
 * @param {*} templatePath 
 * @returns 
 */
function createService(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }

  let sourcePath = path.resolve(templatePath, `service.template`);
  const serviceName = `${args.newName}.ts`;
  let serviceDest = path.resolve(`${args.destPath}`, serviceName);

  if (opt.interface == true) {
    args.replaceMap['_SUB_PATH'] = args.subModule ? '../../..' : '../..';
    serviceDest = path.resolve(`${args.destPath}/impl`, serviceName);
    sourcePath = path.resolve(templatePath, `service.impl.template`);

    args.destMap[args.sourcePath] = "";
    const tplPath = path.resolve(templatePath, `service.interface.template`);
    const newName = `I${args.newName}.ts`;
    const destPath = path.resolve(args.destPath, newName);
    if (!ufs.isExist(destPath)) {
      args.destMap[tplPath] = destPath;
    }
  }
  if (!ufs.isExist(serviceDest)) {
    args.destMap[sourcePath] = serviceDest;
  }

  return args;
}

module.exports = createService;