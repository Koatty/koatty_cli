/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2020-12-08 15:08:37
 * @LastEditTime: 2025-03-10 16:20:56
 */

const path = require('path');
const replace = require('replace');
const string = require('../utils/sting');
const log = require('../utils/log');
const ufs = require('../utils/fs');
const { writeAndFormatFile } = require('../utils/format');
const template = require('../utils/template');

const {
  TEMPLATE_URL,
  TEMPLATE_NAME,
  COM_TEMPLATE_NAME,
  COM_TEMPLATE_URL,
  LOGO,
} = require('./config');
const { processVer } = require('../utils/version');

const defaultOptions = {
  template: 'project',
};

const supportMap = {
  project: {
    fullName: TEMPLATE_NAME,
    url: TEMPLATE_URL,
  },
  middleware: {
    fullName: COM_TEMPLATE_NAME,
    url: COM_TEMPLATE_URL,
  },
  plugin: {
    fullName: COM_TEMPLATE_NAME,
    url: COM_TEMPLATE_URL,
  },
};



const create = async (projectName, options) => {
  log.info('\n Welcome to use Koatty!');
  log.info(LOGO);
  log.info('Start create project...');

  const projectDir = path.resolve('./', projectName);

  // check project name
  if (ufs.isExist(projectDir)) {
    log.error(`Project [${projectName}] has existed, please change the project name!`);
    return;
  }

  const opts = { ...defaultOptions, ...options };
  const temp = supportMap[opts.template];
  if (!temp) {
    log.error(`Can't find template [${opts.template}], please check the template name, [project]、[middleware] and [plugin] is supported currently.`);
    return;
  }
  // process ver
  temp.url = processVer(temp.url);
  const templateDir = await template.loadAndUpdateTemplate(temp.url, temp.fullName);

  if (!templateDir) {
    log.error(`Create project fail, can't find template [${temp.url}], please check network!`);
    return;
  }

  try {
    await template.copyTemplate(templateDir, projectDir);

    if (opts.template !== 'project') {
      await ufs.moveFile(`${projectDir}/src/${opts.template}.ts`, `${projectDir}/index.ts`);
      await ufs.rmDir(`${projectDir}/src`);
      await ufs.moveFile(`${projectDir}/index.ts`, `${projectDir}/src/index.ts`);
    }

    const newName = string.toPascal(projectName);
    const replaceMap = {
      '_PROJECT_NAME': projectName,
      '_CLASS_NAME': newName
    };

    for (let key in replaceMap) {
      replace({
        regex: key,
        replacement: replaceMap[key],
        paths: [projectDir],
        recursive: true,
        silent: true,
      });
    }

    writeAndFormatFile(`${projectDir}/.koattysrc`, JSON.stringify({
      projectName,
    }));
    console.log(`${projectDir}/.git`);
    await ufs.rmDir(`${projectDir}/.git`);
  } catch (err) {
    log.error(err && err.message);
    return;
  }

  log.log();
  log.success(`Create project [${projectName}] success!`);
  log.log();

  log.log('  Enter path:');
  log.log('  $ cd ' + projectDir);
  log.log();

  log.log('  Install dependencies:');
  log.log('  $ npm install');
  log.log();

  if (opts.template == 'project') {
    log.log('  Run the app:');
    log.log('  $ npm run dev');
  }

  log.log();
};

module.exports = create;