/*
 * @Author: richen
 * @Date: 2020-12-08 10:42:52
 * @LastEditors: linyyyang<linyyyang@tencent.com>
 * @LastEditTime: 2020-12-08 10:43:04
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const fs = require('fs');

exports.isExist = (path) => {
    try {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch (err) {
        return false;
    }
};