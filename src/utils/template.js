/*
 * @Author: richen
 * @Date: 2020-12-08 10:48:45
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-01-10 14:12:41
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const del = require('del');
const cpy = require('ncp').ncp;
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const log = require('./log');
const loading = require('./loading');
const { isExist } = require('./fs');
const { GITHUB_MIRRORS } = require('../command/config');

// os temp dir
const osTempDir = os.tmpdir();

/**
 * get mirrors
 */
function getMirrors(url) {
  const mirrors = GITHUB_MIRRORS.map(mirror => {
    return url.replace(mirror.key, mirror.val);
  });
  mirrors.unshift(url);
  return mirrors;
}

/**
 * pull template from remote repository
 * @param {string} url git repository address
 * @param {string} dir repository save path
 * @returns {promise}
 */
const pullTemplate = async (url, ref, dir) => {
  const mirrors = getMirrors(url);

  for (let attempt = 1; attempt <= mirrors.length; attempt++) {
    try {
      return await git.fastForward({
        fs, http,
        url: mirrors[attempt - 1],
        dir, ref,
        gitdir: path.join(dir, '.git'),
        singleBranch: true,
      });
    } catch (error) {
      log.warning(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * clone template from remote repository
 * @param {string} url git repository address
 * @param {string} ref git repository branch
 * @param {string} dir repository save path
 * @returns {promise}
 */
const cloneTemplate = async (url, ref, dir) => {
  const mirrors = getMirrors(url);

  for (let attempt = 1; attempt <= mirrors.length; attempt++) {
    try {
      return await git.clone({
        fs, http,
        url: mirrors[attempt - 1],
        dir, ref,
        gitdir: path.join(dir, '.git'),
        singleBranch: true,
      });
    } catch (error) {
      log.warning(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

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
    resolve(null);
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

  let branchName = "main";
  if (templateUrl.includes("#")) {
    const urlArr = templateUrl.split('#');
    if (urlArr.length == 2) {
      templateUrl = urlArr[0] || "";
      branchName = urlArr[1] || "main";
    }
  }

  // download template
  log.log(`Start download template [${templateName}]`);
  try {
    loading.start();
    let flag = false;
    // check local template
    if (isExist(templateDir)) {
      // update local template
      // execSync(`rm -rf ${templateDir}`);
      // execSync(`mv ${newTemplateDir} ${templateDir}`);
      if (!isExist(path.join(templateDir, '.git'))) {
        await del(templateDir, { force: true });
      } else {
        await pullTemplate(templateUrl, branchName, templateDir).then(() => {
          log.info(`Update template [${templateName}] success!`);
        }).catch(() => {
          flag = true;
          // log.error(`Update template [${templateName}] fail: ${err.stack}`);
        });
        if (!flag) {
          return templateDir;
        }
      }
    }

    // clone template
    await cloneTemplate(templateUrl, branchName, templateDir);
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