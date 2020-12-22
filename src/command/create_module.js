/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:51:07
 * @LastEditTime: 2020-12-22 21:25:36
 */
const path = require('path');
const replace = require('replace');
const helper = require('koatty_lib');
const { exec } = require('child_process');
const string = require('../utils/sting');
const log = require('../utils/log');
const fileSystem = require('../utils/fs');
const { LOGO } = require('./config');

const cwd = process.cwd();
const templatePath = path.resolve('./src/template');
/**
 * check app
 * @param  {String}  path []
 * @return {Boolean}             []
 */
const isKoattyApp = function (path) {
    if (fileSystem.isExist(path + '.koattysrc')) {
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
 *
 *
 * @param {*} name
 * @param {*} type
 * @returns {*}  
 */
module.exports = async function (name, type) {
    log.info('\n Welcome to use Koatty!');
    log.info(LOGO);
    log.info('Start create module...');

    let args = {};
    switch (type) {
        case 'controller':
            args = createController(name, type);
            break;
        case 'middleware':
            args = createMiddleware(name, type);
            break;
        default:
            args = createDefault(name, type);
            break;
    }

    const { newName, targetDir, sourcePath, destPath, replaceMap, callBack } = args;

    exec(`mkdir -p ${targetDir}`, async (err) => {
        if (err) {
            log.error(err && err.message);
            return;
        }

        await fileSystem.copyFile(sourcePath, destPath);

        for (let key in replaceMap) {
            replace({
                regex: key,
                replacement: replaceMap[key],
                paths: [targetDir],
                recursive: true,
                silent: true,
            });
        }

        log.log();
        log.success(`Create module [${newName}] success!`);
        log.log();

        callBack && callBack();
    });
};

/**
 * 路径参数处理
 *
 * @param {*} name
 * @param {*} type
 * @returns {*}  
 */
function parseArgs(name, type) {
    let targetDir = path.resolve(`${getAppPath()}/${type}/`);
    // check is TKoatty project root directory
    if (!isKoattyApp('./')) {
        log.error('Current project is not a Koatty project.');
        log.error(`Please execute "koatty ${type} ${name}Name" after enter Koatty project root directory.`);
        return;
    }
    const sourcePath = path.resolve(templatePath, `${type}.template`);
    if (!fileSystem.isExist(sourcePath)) {
        log.error(`Type ${type} is not supported currently.`);
        return;
    }
    let subModule = '', sourceName = '';
    const subNames = name.split('/');
    if (subNames.length > 1) {
        subModule = subNames[0];
        sourceName = subNames[1];
        targetDir = `${targetDir}/${subModule}`;
    } else {
        sourceName = subNames[0];
    }
    const newName = `${string.toPascal(sourceName)}${string.toPascal(type)}`;
    const destPath = path.resolve(targetDir, `${newName}.ts`);

    // replace map
    const replaceMap = {
        '<Path>': subModule ? '../..' : '..',
        '<New>': sourceName,
        '<ClassName>': newName
    };

    //if target file is exist, ignore it
    if (helper.isFile(destPath)) {
        log.error('Module existed' + ' : ' + destPath);
        return;
    }
    console.log('================================');
    return { sourceName, newName, subModule, targetDir, sourcePath, destPath, replaceMap };
}

/**
 * 
 *
 * @param {*} name
 * @param {*} type
 * @returns {*}  
 */
function createController(name, type) {
    const args = parseArgs(name, type);
    if (!args) {
        process.exit(0);
    }

    if (args.subModule) {
        args.replaceMap['<New>'] = `/${args.subModule}/${args.sourceName}`;
    } else {
        args.replaceMap['<New>'] = `/${args.sourceName}`;
    }
    return args;
}

/**
 *
 *
 * @param {*} params
 * @returns {*}  
 */
function createMiddleware(name, type) {
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
 * @returns {*}  
 */
function createDefault(name, type) {
    const args = parseArgs(name, type);
    if (!args) {
        process.exit(0);
    }
    return args;
}
