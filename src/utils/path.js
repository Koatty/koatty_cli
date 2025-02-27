/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2025-02-27 13:47:51
 * @LastEditTime: 2025-02-27 13:48:03
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const path = require('path');
const ufs = require('../fs');

const cwd = process.cwd();
// const templatePath = path.dirname(__dirname) + '/template';
/**
 * check app
 * @param  {String}  path []
 * @return {Boolean}             []
 */
export const isKoattyApp = function (path) {
  if (ufs.isExist(path + '.koattysrc')) {
    return true;
  }
  return false;
};

/**
 *
 *
 * @returns {*}  
 */
export const getAppPath = function () {
  return path.normalize(cwd + '/src/');
}
