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
const { REPLACE_SOURCE, REPLACE_TARGET } = require('../command/config');

// os temp dir
const osTempDir = os.tmpdir();

/**
 * pull template from remote repository
 * @param {string} url git repository address
 * @param {string} dir repository save path
 * @returns {promise}
 */
const pullTemplate = (url, ref, dir) => git.fastForward({
  fs, http, url, dir, ref,
  gitdir: path.join(dir, '.git'),
  singleBranch: true,
});

/**
 * clone template from remote repository
 * @param {string} url git repository address
 * @param {string} ref git repository branch
 * @param {string} dir repository save path
 * @returns {promise}
 */
const cloneTemplate = (url, ref, dir) => git.clone({
  fs, http, url, dir, ref,
  singleBranch: true,
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
    // check local template
    if (isExist(templateDir) && !isExist(path.join(templateDir, '.git'))) {
      // update local template
      // execSync(`rm -rf ${templateDir}`);
      // execSync(`mv ${newTemplateDir} ${templateDir}`);
      const deletedDirectoryPaths = await del(templateDir, { force: true });
      log.info(`Deleted directories:\n[${deletedDirectoryPaths.join('\n')}`);
    }

    // clone template
    await retry(pullTemplate, function (tUrl, tName, tDir) {
      // 下载失败则替换为国内源
      let nUrl = replaceInUrl(tUrl, REPLACE_SOURCE, REPLACE_TARGET);
      return [nUrl, tName, tDir];
    }, [templateUrl, branchName, templateDir]);
    log.info(`Download template [${templateName}] success!`);
    return templateDir;
  } catch (error) {
    log.error(`Download template [${templateName}] fail: ${error.stack}`);
  } finally {
    loading.stop();
  }
};

/**
 * 查找特定字符串并替换原 URL 中的匹配部分。
 * 
 * @param {string} url - 原始 URL。
 * @param {string} target - 要查找的字符串。
 * @param {string} replacement - 用于替换的字符串。
 * @returns {string} - 返回替换后的 URL。
 */
function replaceInUrl(url, target, replacement) {
  // 使用正则表达式进行全局替换
  const regex = new RegExp(target, 'g');
  return url.replace(regex, replacement);
}

/**
 * 尝试执行一个异步操作，如果失败则进行重试。
 * 
 * @param {function} operation - 一个返回 Promise 的异步函数。
 * @param {function} callback - 失败后的回调函数。
 * @param {array} args - 函数参数。
 * @param {number} maxRetries - 最大重试次数（默认为 2）。
 * @returns {Promise<any>} - 返回异步操作的结果。
 * @throws {Error} - 如果在达到最大重试次数后仍然失败，则抛出错误。
 */
async function retry(operation, callback, args = [], maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 尝试执行异步操作
      const result = await operation(...args);
      return result; // 如果成功，返回结果
    } catch (error) {
      // 如果达到最大重试次数，抛出错误
      if (attempt === maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} attempts: ${error.message}`);
      }
      // 回调函数
      if (callback) {
        args = callback(...args);
      }
      // 打印重试信息
      log.warning(`Attempt ${attempt} failed. Retrying...`);
    }
  }
}

module.exports = {
  pullTemplate,
  copyTemplate,
  loadAndUpdateTemplate,
};
