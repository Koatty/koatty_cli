/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:51:07
 * @LastEditTime: 2020-12-22 20:34:00
 */
const path = require('path');
const replace = require('replace');
const helper = require('koatty_lib');
const { exec } = require('child_process');
const string = require('../utils/sting');
const log = require('../utils/log');
const fileSystem = require('../utils/fs');

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
const create = async function (name, type) {
    let targetDir = path.resolve(`${getAppPath()}/${type}/`);
    // check is TKoatty project root directory
    // if (!isKoattyApp('./')) {
    //     log.error('Current project is not a Koatty project.');
    //     log.error(`Please execute "koatty ${type} ${name}Name" after enter Koatty project root directory.`);
    //     return;
    // }
    const sourcePath = path.resolve(templatePath, `${type}.template`);
    console.log(templatePath);
    if (!fileSystem.isExist(sourcePath)) {
        log.error(`Type ${type} is not supported currently.`);
        return;
    }
    let subModule = '';
    const subNames = name.split('/');
    if (subNames.length > 1) {
        subModule = subNames[0];
        name = subNames[1];
        targetDir = `${targetDir}/${subModule}`;
    } else {
        name = subNames[0];
    }
    const newName = `${string.toPascal(name)}${string.toPascal(type)}`;
    const destPath = path.resolve(targetDir, `${newName}.ts`);


    console.log(targetDir);
    console.log(newName);
    console.log(destPath);

    //if target file is exist, ignore it
    if (helper.isFile(destPath)) {
        log.error('exist' + ' : ' + destPath);
        return;
    }
    // replace map
    const replaceMap = {
        '<Path>': subModule ? '../..' : '..',
        '<New>': name,
        '<ClassName>': newName
    };
    if (type === 'controller') {
        if (subModule) {
            replaceMap['<New>'] = `/${subModule}/${name}`;
        } else {
            replaceMap['<New>'] = `/${name}`;
        }
    }

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
    });
};

module.exports = create;