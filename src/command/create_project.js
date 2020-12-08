/*
 * @Author: richen
 * @Date: 2020-12-08 10:40:53
 * @LastEditors: linyyyang<linyyyang@tencent.com>
 * @LastEditTime: 2020-12-08 10:42:01
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const path = require('path');
const replace = require('replace');
const { exec } = require('child_process');
const { template, log, fileSystem } = require('../utils');