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
 * @param {string} [giteeUrl] gitee backup url
 * @returns {Promise<any>} local template path
 */
const loadAndUpdateTemplate = async (templateUrl, templateName, templateDir = '', giteeUrl = null) => {
  if (templateDir == '') {
    templateDir = path.join(osTempDir, templateName);
  }

  let branchName = 'main';
  let originalUrl = templateUrl;
  if (templateUrl.includes('#')) {
    const urlArr = templateUrl.split('#');
    if (urlArr.length == 2) {
      templateUrl = urlArr[0] || '';
      branchName = urlArr[1] || 'main';
    }
  }

  // 构建要尝试的URL列表
  const urlsToTry = [templateUrl];
  if (giteeUrl) {
    // 处理giteeUrl的分支信息
    let giteeUrlProcessed = giteeUrl;
    if (giteeUrl.includes('#')) {
      const giteeUrlArr = giteeUrl.split('#');
      giteeUrlProcessed = giteeUrlArr[0] || '';
      // 使用原始URL的分支名称，如果gitee URL没有指定分支的话
      if (!giteeUrlArr[1]) {
        giteeUrlProcessed = `${giteeUrlProcessed}#${branchName}`;
      }
    } else {
      giteeUrlProcessed = `${giteeUrl}#${branchName}`;
    }
    urlsToTry.push(giteeUrlProcessed);
  }

  // download template
  log.log(`Start download template [${templateName}]`);
  
  for (let i = 0; i < urlsToTry.length; i++) {
    const currentUrl = urlsToTry[i];
    const isGiteeUrl = currentUrl.includes('gitee.com');
    
    // 处理当前URL的分支信息
    let currentUrlProcessed = currentUrl;
    let currentBranch = branchName;
    if (currentUrl.includes('#')) {
      const urlArr = currentUrl.split('#');
      currentUrlProcessed = urlArr[0] || '';
      currentBranch = urlArr[1] || branchName;
    }
    
    if (isGiteeUrl) {
      log.log(`Trying Gitee mirror for template [${templateName}]`);
    }
    
    try {
      loading.start();
      let flag = false;
      // check local template
      if (isExist(templateDir)) {
        // update local template
        if (!isExist(path.join(templateDir, '.git'))) {
          await del(templateDir, { force: true });
        } else {
          await pullTemplate(currentUrlProcessed, currentBranch, templateDir).then(() => {
            log.info(`Update template [${templateName}] success!`);
          }).catch(err => {
            flag = true;
            // log.error(`Update template [${templateName}] fail: ${err.stack}`);
          });
          if (!flag) {
            return templateDir;
          }
        }
      }

      // clone template
      await cloneTemplate(currentUrlProcessed, currentBranch, templateDir);
      log.info(`Download template [${templateName}] success!`);
      return templateDir;
    } catch (error) {
      const errorMsg = `Download template [${templateName}] fail from ${isGiteeUrl ? 'Gitee' : 'GitHub'}: ${error.message}`;
      
      if (i === urlsToTry.length - 1) {
        // 最后一个URL也失败了
        log.error(errorMsg);
      } else {
        // 还有备用URL可以尝试
        log.warning(errorMsg);
        log.log('Trying alternative source...');
      }
    } finally {
      loading.stop();
    }
  }
  
  return null;
};

module.exports = {
  pullTemplate,
  copyTemplate,
  loadAndUpdateTemplate,
};