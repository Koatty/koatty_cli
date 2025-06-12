/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:40:59
 * @LastEditTime: 2025-02-27 14:05:33
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const { parseArgs } = require('./args');
const { grpcProcessor } = require('./grpc-controller');
const { graphqlProcessor } = require('./graphql-controller');
const { websocketProcessor } = require('./websocket-controller');

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

  if (opt && opt.type) {
    switch (opt.type) {
    case 'grpc':
      return grpcProcessor(args, templatePath);
    case 'graphql':
      return graphqlProcessor(args, templatePath);
    case 'websocket':
      return websocketProcessor(args, templatePath);
    default:
      break;
    }
  }

  return args;
}

module.exports = { createController };