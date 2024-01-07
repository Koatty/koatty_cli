/*
 * @Description: 版本处理
 * @Usage: 
 * @Author: richen
 * @Date: 2024-01-04 05:26:15
 * @LastEditTime: 2024-01-07 12:24:25
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const lib = require('koatty_lib');
const { version } = require("../../package.json");

const processVer = function (url) {
  const currentVer = version.slice(0, version.lastIndexOf('.'));
  // 从3.11.x版本开始，用分支管理
  if (lib.toNumber(currentVer) >= 3.11) {
    return url.replace("#main", "#" + currentVer + ".x")
  }
  return url;
}


module.exports = {
  processVer,
}