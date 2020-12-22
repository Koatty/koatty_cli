/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:51:07
 * @LastEditTime: 2020-12-22 19:55:32
 */
const path = require('path');
const string = require('../utils/sting');
const templatePath = __dirname + '/template';
const log = require('../utils/log');
const fileSystem = require('../utils/fs');
const helper = require('koatty_lib');

/**
 * check app
 * @param  {String}  projectRootPath []
 * @return {Boolean}             []
 */
const isKoattyApp = function (projectRootPath) {
    if (fileSystem.isExist(projectRootPath + '.koattysrc')) {
        return true;
    }
    return false;
};

/**
 *
 *
 * @param {*} name
 * @param {*} type
 * @returns {*}  
 */
const create = async function (name, type) {
    const targetDir = path.resolve(`./src/${type}/`);
    // check is TKoatty project root directory
    if (!isKoattyApp('./')) {
        log.error('Current project is not a Koatty project.');
        log.error(`Please execute "koatty ${type} ${name}Name" after enter Koatty project root directory.`);
        return;
    }

    const sourcePath = path.resolve(templatePath, `${type}.template.ts`);
    if (!fileSystem.isExist(sourcePath)) {
        log.error(`Type ${type} is not supported currently.`);
        return;
    }
    let subModule = '';
    const subNames = name.split('/');
    if (subNames.length > 1) {
        subModule = subNames[0];
        name = subNames[1];
        targetDir = `${targetDir}${subModule}`;
    } else {
        name = subNames[0];
    }
    const newName = `${string.toPascal(name)}${string.toPascal(type)}`;
    const destPath = path.resolve(targetDir, `${newName}.ts`);

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

    exec(`mkdir ${targetDir}`, async (err) => {
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
        log.success(`Create module [${projectName}] success!`);
        log.log();
    });
};

module.exports = create;