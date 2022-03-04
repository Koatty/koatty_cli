/*
 * @Author: richen
 * @Date: 2020-12-08 10:48:45
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-03-04 12:05:24
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const del = require('del');
const cpy = require('ncp').ncp;
const download = require('download-git-repo');
// const { exec, execSync } = require('child_process');
const log = require('./log');
const loading = require('./loading');
const { isExist } = require('./fs');

// os temp dir
const osTempDir = os.tmpdir();

/**
 * download template from remote repository
 * @param {string} url git repository address
 * @param {string} dest repository save path
 * @returns {promise}
 */
const pullTemplate = (url, dest) => new Promise((resolve, reject) => {
    download(`direct:${url}`, dest, { clone: true }, (err) => {
        if (err) reject(err);
        resolve();
    });
});

/**
 * copy template directory
 * @param {string} templatePath template path
 * @param {string} destPath destination path
 * @returns {promise}
 */
// @ts-ignore
const copyTemplate = (templatePath, destPath) => new Promise((resolve, reject) =>
    cpy(templatePath, destPath, (err) => {
        if (err) reject(err);
        resolve();
    }));

/**
 * load remote template and update local template
 * @param {string} templateUrl template git address
 * @param {string} templateName template name
 * @param {string} [templateDir] template directory
 * @returns {Promise<any>} local template path
 */
const loadAndUpdateTemplate = async (templateUrl, templateName, templateDir = "") => {
    if (templateDir == "") {
        templateDir = path.join(osTempDir, templateName);
    }

    // download template
    log.log(`Start download template [${templateName}]`);
    try {
        loading.start();
        // check local template
        if (isExist(templateDir)) {
            // update local template
            // execSync(`rm -rf ${templateDir}`);
            // execSync(`mv ${newTemplateDir} ${templateDir}`);
            const deletedDirectoryPaths = await del(templateDir, { force: true });
            log.info(`Deleted directories:\n[${deletedDirectoryPaths.join('\n')}`);
        }

        await pullTemplate(templateUrl, templateDir);
        log.info(`Download template [${templateName}] success!`);
        return templateDir;
    } catch (error) {
        log.error(`Download template [${templateName}] fail: ${error.stack}`);
    } finally {
        loading.stop();
    }
};

module.exports = {
    pullTemplate,
    copyTemplate,
    loadAndUpdateTemplate,
};