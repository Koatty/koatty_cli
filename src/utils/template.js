/*
 * @Author: richen
 * @Date: 2020-12-08 10:48:45
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-12-24 11:19:08
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const os = require('os');
const path = require('path');
const download = require('download-git-repo');
const { exec, execSync } = require('child_process');
const log = require('./log');
const loading = require('./loading');
const { isExist } = require('./fs');


const osTempDir = os.tmpdir();

/**
 * download template from remote repository
 * @param {string} url git repository address
 * @param {string} dest repository save path
 * @returns {promise}
 */
const getTemplate = (url, dest) => new Promise((resolve) => {
    download(`direct:${url}`, dest, { clone: true }, (err) => {
        if (err) {
            log.error(err);
            resolve(false);
        }
        resolve(true);
    });
});

/**
 * copy template directory
 * @param {string} templatePath template path
 * @param {string} destPath destination path
 * @returns {promise}
 */
const copyTemplate = (templatePath, destPath) => new Promise((resolve) => {
    exec(`cp -a ${templatePath}/. ${destPath}`, (err) => {
        if (err) {
            log.error(err.message);
            resolve(false);
        } else {
            resolve(true);
        }
    });
});

/**
 * load remote template and update local template
 * @param {string} templateUrl template git address
 * @param {string} templateName template name
 * @returns {string} local template path
 */
const loadAndUpdateTemplate = async (templateUrl, templateName) => {
    const templateDir = `${osTempDir}${path.sep}${templateName}`;
    const randomStr = Date.now().toString();
    const newTemplateDir = `${osTempDir}${path.sep}${templateName}-${randomStr}`;

    const flagPath = `${templateDir}${path.sep}package.json`;

    let localHasTemplate = false;

    // check local template
    if (isExist(flagPath)) {
        localHasTemplate = true;
    }

    // download template
    log.log(`Start download template [${templateName}]`);
    loading.start();
    const getSuccess = await getTemplate(templateUrl, newTemplateDir);
    loading.stop();

    // download success
    if (getSuccess) {
        // update local template
        execSync(`rm -rf ${templateDir}`);
        execSync(`mv ${newTemplateDir} ${templateDir}`);

        log.info(`Use remote template [${templateName}]`);
    } else if (!localHasTemplate) {
        return '';
    } else {
        log.info(`Download template [${templateName}] fail!`);
        log.info(`Use local template [${templateName}]`);
    }

    log.info(`Template [${templateName}] version: v${require(flagPath).version}`);
    return templateDir;
};

module.exports = {
    getTemplate,
    copyTemplate,
    loadAndUpdateTemplate,
};