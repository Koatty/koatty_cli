/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 11:43:22
 * @LastEditTime: 2025-03-10 15:49:24
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const ufs = require('../utils/fs');
const string = require('../utils/sting');
const { isKoattyApp, getAppPath } = require('../utils/path');
const { parseProto, parseMethods, parseFields, parseValues } = require('koatty_proto');
const { LOGO, CLI_TEMPLATE_URL, CLI_TEMPLATE_NAME, CTL_IMPORT, CTL_METHOD } = require('../command/config');

/**
 * @description: 
 * @param {*} args
 * @return {*}
 */
function grpcProcessor(args, templatePath) {
  parseGrpcArgs(args, templatePath);
  args.destMap = {};
  if (args.subModule) {
    args.replaceMap['_NEW'] = `/${string.toPascal(args.subModule)}/${string.toPascal(args.sourceName)}`;
  } else {
    args.replaceMap['_NEW'] = `/${string.toPascal(args.sourceName)}`;
  }

  return args;
}

/**
 * 处理gRPC控制器
 *
 * @param {*} args
 * @returns {*}  
 */
function parseGrpcArgs(args, templatePath) {
  // 根据控制器名自动寻找proto文件
  const pascalName = string.toPascal(args.sourceName);
  const protoFile = `${getAppPath()}/proto/${pascalName}.proto`;
  if (!ufs.isExist(protoFile)) {
    throw Error(`proto file : ${protoFile} does not exist. Please use the 'koatty proto ${args.sourceName}' command to create.`);
  }
  const source = ufs.readFile(protoFile);
  const res = parseProto(source);
  const methods = parseMethods(res);
  if (!Object.hasOwnProperty.call(methods, pascalName)) {
    throw Error('The proto file does not contain the service' + ' : ' + pascalName);
  }
  const service = methods[pascalName];
  const methodArr = [];
  const dtoArr = [];
  const importArr = [];
  let methodStr = ufs.readFile(path.resolve(templatePath, 'controller_grpc_method.template'));
  let importStr = ufs.readFile(path.resolve(templatePath, 'controller_grpc_import.template'));
  let exCtlContent = '';
  if (ufs.isExist(args.destFile)) {
    exCtlContent = ufs.readFile(args.destFile);
  }
  Object.keys(service).map(key => {
    if (Object.hasOwnProperty.call(service, key)) {
      const it = service[key];
      if (it && !exCtlContent.includes(`${it.name}(`)) {
        let method = methodStr.replace(/_METHOD_NAME/g, it.name);
        let requestType = 'any';
        if (it.requestType != '') {
          requestType = `${it.requestType}Dto`;
          if (!exCtlContent.includes(requestType)) {
            dtoArr.push(requestType);
          }
        }

        let responseType = 'any';
        if (it.responseType != 'any') {
          responseType = `${it.responseType}Dto`;
          if (!exCtlContent.includes(responseType)) {
            dtoArr.push(responseType);
          }
        }

        method = method.replace(/_REQUEST_TYPE/g, requestType);
        method = method.replace(/_RESPONSE_TYPE/g, responseType);
        method = method.replace(/_RESPONSE_RETURN/g, it.responseType == 'any' ? '{}' : `new ${responseType}();`);
        methodArr.push(method);
      }
    }
  });

  for (const it of dtoArr) {
    importArr.push(importStr.replace(/_DTO_NAME/g, it).replace(/_SUB_PATH/g, args.subModule ? '../..' : '..'));
  }

  if (exCtlContent.length == 0) {
    exCtlContent = ufs.readFile(path.resolve(templatePath, 'controller_grpc.template'));
  }

  if (importArr.length > 0) {
    importArr.push(CTL_IMPORT);
    exCtlContent = exCtlContent.replace(new RegExp(CTL_IMPORT, 'g'), importArr.join('\n'));
  }
  if (methodArr.length > 0) {
    methodArr.push(CTL_METHOD);
    exCtlContent = exCtlContent.replace(new RegExp(CTL_METHOD, 'g'), methodArr.join('\n'));
  }

  args.createMap[args.destFile] = exCtlContent;

  const destPath = path.resolve(`${getAppPath()}/dto/`);
  // enum
  const values = parseValues(res);
  const enumContent = ufs.readFile(path.resolve(templatePath, 'enum.template'));
  let enumImports = '';
  Object.keys(values).map(key => {
    if (Object.hasOwnProperty.call(values, key)) {
      const it = values[key];
      if (it) {
        const name = `${destPath}/${it.name}.ts`;
        let props = [...(it.fields || [])];
        enumImports = `${enumImports}import { ${it.name} } from "./${it.name}";\n`;
        if (!ufs.isExist(name)) {
          args.createMap[name] = enumContent.replace(/_CLASS_NAME/g, it.name).replace(/\/\/_FIELDS/g, props.join('\n\n'));
        }
      }
    }
  });
  // request & reply
  const fields = parseFields(res);
  const dtoContent = ufs.readFile(path.resolve(templatePath, 'dto.template'));
  Object.keys(fields).map(key => {
    if (Object.hasOwnProperty.call(fields, key)) {
      const it = fields[key];
      if (it) {
        const name = `${destPath}/${it.name}Dto.ts`;
        let props = [...(it.fields || [])];
        props = props.map(elem => {
          if (elem != '') {
            return `    @IsDefined()\n  ${elem}`;
          }
          return '';
        });
        if (!ufs.isExist(name)) {
          args.createMap[name] = dtoContent.replace(/_CLASS_NAME/g, `${it.name}Dto`)
            .replace(/\/\/_FIELDS/g, props.join('\n\n')
              .replace(/\/\/_ENUM_IMPORT/g, enumImports));
        }
      }
    }
  });

  return args;
}

module.exports = { grpcProcessor, parseGrpcArgs };
