/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:51:07
 * @LastEditTime: 2024-01-10 13:59:31
 */
const path = require('path');
const replace = require('replace');
const string = require('../utils/sting');
const log = require('../utils/log');
const ufs = require('../utils/fs');
const { LOGO, CLI_TEMPLATE_URL, CLI_TEMPLATE_NAME, GRPC_IMPORT, GRPC_METHOD } = require('./config');
const template = require('../utils/template');
const { parseProto, parseMethods, parseFields, parseValues } = require('koatty_proto');
const { regex } = require('replace/bin/shared-options');
const { processVer } = require('../utils/version');

const cwd = process.cwd();
let templatePath = '';
// const templatePath = path.dirname(__dirname) + '/template';
/**
 * check app
 * @param  {String}  path []
 * @return {Boolean}             []
 */
const isKoattyApp = function (path) {
  if (ufs.isExist(path + '.koattysrc')) {
    return true;
  }
  return false;
};

/**
 *
 *
 * @returns {*}  
 */
const getAppPath = function () {
  return path.normalize(cwd + '/src/');
}

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
        args = createController(name, type, opt);
        break;
      case 'middleware':
        args = createMiddleware(name, type, opt);
        break;
      case 'model':
        args = createModel(name, type, opt);
        break;
      case 'plugin':
        args = createPlugin(name, type, opt);
        break;
      case 'service':
        args = createService(name, type, opt);
        break;
      default:
        args = createDefault(name, type, opt);
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
          await ufs.writeFile(key, element);
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

/**
 * 路径参数处理
 *
 * @param {*} name
 * @param {*} type
 * @returns {*}  
 */
function parseArgs(name, type) {
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
  return { sourceName, sourcePath, newName, subModule, destMap, replaceMap, destPath, destFile };
}

/**
 * 处理gRPC控制器
 *
 * @param {*} args
 * @returns {*}  
 */
function parseGrpcArgs(args) {
  // 根据控制器名自动寻找proto文件
  const pascalName = string.toPascal(args.sourceName);
  const protoFile = `${getAppPath()}/proto/${pascalName}.proto`
  if (!ufs.isExist(protoFile)) {
    throw Error(`proto file : ${protoFile} does not exist. Please use the 'koatty proto ${args.sourceName}' command to create.`);
  }
  const source = ufs.readFile(protoFile)
  const res = parseProto(source);
  const methods = parseMethods(res);
  if (!Object.hasOwnProperty.call(methods, pascalName)) {
    throw Error('The proto file does not contain the service' + ' : ' + pascalName);
  }
  const service = methods[pascalName];
  const methodArr = [];
  const dtoArr = [];
  const importArr = [];
  let methodStr = ufs.readFile(path.resolve(templatePath, `controller_grpc_method.template`));
  let importStr = ufs.readFile(path.resolve(templatePath, `controller_grpc_import.template`));
  let exCtlContent = "";
  if (ufs.isExist(args.destFile)) {
    exCtlContent = ufs.readFile(args.destFile);
  }
  Object.keys(service).map(key => {
    if (Object.hasOwnProperty.call(service, key)) {
      const it = service[key];
      if (it && !exCtlContent.includes(`${it.name}(`)) {
        let method = methodStr.replace(/_METHOD_NAME/g, it.name);
        let requestType = 'any';
        if (it.requestType != "") {
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
    importArr.push(importStr.replace(/_DTO_NAME/g, it).replace(/_SUB_PATH/g, args.subModule ? '../..' : '..'))
  }

  args.createMap = {};
  if (exCtlContent.length == 0) {
    exCtlContent = ufs.readFile(path.resolve(templatePath, `controller_grpc.template`));
  }

  if (importArr.length > 0) {
    importArr.push(GRPC_IMPORT);
    exCtlContent = exCtlContent.replace(new RegExp(GRPC_IMPORT, "g"), importArr.join("\n"));
  }
  if (methodArr.length > 0) {
    methodArr.push(GRPC_METHOD);
    exCtlContent = exCtlContent.replace(new RegExp(GRPC_METHOD, "g"), methodArr.join("\n"));
  }

  args.createMap[args.destFile] = exCtlContent;

  const destPath = path.resolve(`${getAppPath()}/dto/`);
  // enum
  const values = parseValues(res);
  const enumContent = ufs.readFile(path.resolve(templatePath, `enum.template`));
  let enumImports = "";
  Object.keys(values).map(key => {
    if (Object.hasOwnProperty.call(values, key)) {
      const it = values[key];
      if (it) {
        const name = `${destPath}/${it.name}.ts`;
        let props = [...(it.fields || [])];
        enumImports = `${enumImports}import { ${it.name} } from "./${it.name}";\n`;
        if (!ufs.isExist(name)) {
          args.createMap[name] = enumContent.replace(/_CLASS_NAME/g, it.name).replace(/\/\/_FIELDS/g, props.join("\n\n"));
        }
      }
    }
  });
  // request & reply
  const fields = parseFields(res);
  const dtoContent = ufs.readFile(path.resolve(templatePath, `dto.template`));
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
            .replace(/\/\/_FIELDS/g, props.join("\n\n")
              .replace(/\/\/_ENUM_IMPORT/g, enumImports));
        }
      }
    }
  });



  return args;

}


/**
 *
 *
 * @param {*} name
 * @param {*} type
 * @param {*} opt
 * @returns {*}  
 */
function createController(name, type, opt) {
  const args = parseArgs(name, type);
  if (!args) {
    process.exit(0);
  }

  const protocol = opt.type || 'http';
  if (protocol === "grpc") {
    parseGrpcArgs(args);
    args.destMap = {};
    if (args.subModule) {
      args.replaceMap['_NEW'] = `/${string.toPascal(args.subModule)}/${string.toPascal(args.sourceName)}`;
    } else {
      args.replaceMap['_NEW'] = `/${string.toPascal(args.sourceName)}`;
    }

    return args;
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

/**
 *
 *
 * @param {*} name
 * @param {*} type
 * @param {*} opt
 * @returns {*}  
 */
function createMiddleware(name, type, opt) {
  const args = parseArgs(name, type);
  if (!args) {
    process.exit(0);
  }
  args.callBack = function () {
    log.log();
    log.log('please modify /app/config/middlewate.ts file:');
    log.log();
    log.log(`list: [..., "${args.newName}"] //加载中间件`);
    log.log('config: { //中间件配置 ');
    log.log(`   "${args.newName}":{ //todo }`);
    log.log('}');

    log.log();
  };
  return args;
}
/**
 *
 *
 * @param {*} name
 * @param {*} type
 * @param {*} opt
 * @returns {*}
 */
function createPlugin(name, type, opt) {
  const args = parseArgs(name, type);
  if (!args) {
    process.exit(0);
  }
  args.callBack = function () {
    log.log();
    log.log('please modify /app/config/plugin.ts file:');
    log.log();
    log.log(`list: [..., "${args.newName}"] //加载的插件列表,执行顺序按照数组元素顺序`);
    log.log('config: { //插件配置 ');
    log.log(`   "${args.newName}":{ //todo }`);
    log.log('}');

    log.log();
  };
  return args;
}

/**
 *
 *
 * @param {*} name
 * @param {*} type
 * @param {*} opt
 * @returns {*}  
 */
function createModel(name, type, opt) {
  const args = parseArgs(name, type);
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

/**
 *
 *
 * @param {*} name
 * @param {*} type
 * @param {*} opt
 * @returns {*}  
 */
function createService(name, type, opt) {
  const args = parseArgs(name, type);
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


/**
 *
 *
 * @param {*} name
 * @param {*} type
 * @param {*} opt
 * @returns {*}  
 */
function createDefault(name, type, opt) {
  const args = parseArgs(name, type);
  if (!args) {
    process.exit(0);
  }
  return args;
}

