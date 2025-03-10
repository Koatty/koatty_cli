/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:40:59
 * @LastEditTime: 2025-03-10 20:55:07
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const { parseArgs } = require("./args");
const { grpcProcessor } = require("./grpc-controller");

/**
 * 
 * @param {*} name 
 * @param {*} type 
 * @param {*} opt 
 * @param {*} templatePath 
 * @returns 
 */
function createController(name, type, opt, templatePath) {
  const args = parseArgs(name, type, templatePath);
  if (!args) {
    process.exit(0);
  }

  const protocol = opt.type || 'http';
  if (protocol === "grpc") {
    return grpcProcessor(args, templatePath);
  } else if (protocol === "websocket") {
    const sourcePath = path.resolve(templatePath, `controller_ws.template`);
    args.destMap[sourcePath] = args.destMap[args.sourcePath];
    args.destMap[args.sourcePath] = "";
  }

  if (args.subModule) {
    args.replaceMap['_NEW'] = `/${args.subModule}/${args.sourceName}`;
  } else {
    args.replaceMap['_NEW'] = `/${args.sourceName}`;
  }

  return args;
}

module.exports = {
  createController
};