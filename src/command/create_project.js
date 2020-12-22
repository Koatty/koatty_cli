/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2020-12-08 15:08:37
 * @LastEditTime: 2020-12-22 19:07:48
 */

const path = require('path');
const replace = require('replace');
const { exec } = require('child_process');
const log = require('../utils/log');
const fileSystem = require('../utils/fs');
const template = require('../utils/template');
const {
    TEMPLATE_URL,
    TEMPLATE_NAME,
    LOGO,
} = require('./config');


const create = async (projectName, options) => {
    log.info('\n Welcome to use Koatty!');
    log.info(LOGO);
    log.info('Start create project...');

    const projectDir = path.resolve('./', projectName);

    // check project name
    if (fileSystem.isExist(projectDir)) {
        log.error(`Project [${projectName}] has existed, please change the project name!`);
        return;
    }

    const opt = {
        ...{
            url: TEMPLATE_URL,
            fullName: TEMPLATE_NAME
        }, ...options
    };
    const templateDir = await template.loadAndUpdateTemplate(opt.url, opt.fullName);

    if (!templateDir) {
        log.error(`Create project fail, can't find template [${opt.fullName}], please check network!`);
        return;
    }

    exec(`mkdir ${projectDir}`, async (err) => {
        if (err) {
            log.error(err && err.message);
            return;
        }

        await template.copyTemplate(templateDir, projectDir);

        replace({
            regex: '<projectName>',
            replacement: projectName,
            paths: [projectDir],
            recursive: true,
            silent: true,
        });

        log.log();
        log.success(`Create project [${projectName}] success!`);
        log.log();
    });
};

module.exports = create;


create('test1')