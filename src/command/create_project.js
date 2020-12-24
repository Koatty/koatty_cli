/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2020-12-08 15:08:37
 * @LastEditTime: 2020-12-24 11:26:16
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
    COMP_TEMPLATE_NAME,
    COMP_TEMPLATE_URL,
    LOGO,
} = require('./config');

const defaultOptions = {
    template: 'project',
};

const supportMap = {
    project: {
        fullName: TEMPLATE_NAME,
        url: TEMPLATE_URL,
    },
    middleware: {
        fullName: COMP_TEMPLATE_NAME,
        url: COMP_TEMPLATE_URL,
    },
    plugin: {
        fullName: COMP_TEMPLATE_NAME,
        url: COMP_TEMPLATE_URL,
    },
};


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

    const opts = { ...defaultOptions, ...options };
    const temp = supportMap[opts.template];
    if (!temp) {
        log.error(`Can't find template [${opts.template}], please check the template name, [project]、[middleware] and [plugin] is supported currently.`);
        return;
    }

    const templateDir = await template.loadAndUpdateTemplate(temp.url, temp.fullName);

    if (!templateDir) {
        log.error(`Create project fail, can't find template [${temp.url}], please check network!`);
        return;
    }

    exec(`mkdir ${projectDir}`, async (err) => {
        if (err) {
            log.error(err && err.message);
            return;
        }

        await template.copyTemplate(templateDir, projectDir);

        if (opts.template === 'middleware') {
            await fileSystem.rmFile(`${projectDir}/src/plugin.ts`);
            await fileSystem.moveFile(`${projectDir}/src/middleware.ts`, `${projectDir}/src/index.ts`);
        }
        if (opts.template === 'plugin') {
            await fileSystem.rmFile(`${projectDir}/src/middleware.ts`);
            await fileSystem.moveFile(`${projectDir}/src/plugin.ts`, `${projectDir}/src/index.ts`);
        }

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

        log.log('  Enter path:');
        log.log('  $ cd ' + projectDir);
        log.log();

        log.log('  Install dependencies:');
        log.log('  $ npm install');
        log.log();

        log.log('  Run the app:');
        log.log('  $ npm start');

        log.log();
    });
};

module.exports = create;