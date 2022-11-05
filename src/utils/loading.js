/*
 * @Author: richen
 * @Date: 2020-12-08 10:45:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-04 14:48:37
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const { Spinner } = require('cli-spinner');

const spinner = new Spinner('Processing... %s');
spinner.setSpinnerString('|/-\\');

module.exports = {
  start: () => spinner.start(),
  stop: () => {
    console.log();
    spinner.stop();
  },
};