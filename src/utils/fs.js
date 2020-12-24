/*
 * @Author: richen
 * @Date: 2020-12-08 10:42:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-12-24 11:25:36
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const fs = require('fs');
const log = require('../utils/log');
const { exec } = require('child_process');

/**
 * check file is exists
 * @param {string} path 
 */
exports.isExist = (path) => {
    try {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch (err) {
        return false;
    }
};


/**
 * copy file
 * @param {string} source file source path
 * @param {string} dest file destination
 */
exports.copyFile = (source, dest) => new Promise((resolve) => {
    exec(`cp ${source} ${dest}`, (err) => {
        if (err) {
            log.error(err.message);
            resolve(false);
        } else {
            resolve(true);
        }
    });
});

/**
 * move file
 * @param {string} source file source path
 * @param {string} dest file destination
 */
exports.moveFile = (source, dest) => new Promise((resolve) => {
    exec(`mv ${source} ${dest}`, (err) => {
        if (err) {
            log.error(err.message);
            resolve(false);
        } else {
            resolve(true);
        }
    });
});

/**
 * rm file
 * @param {string} dest file destination
 */
exports.rmFile = (dest) => new Promise((resolve) => {
    exec(`rm -f ${dest}`, (err) => {
        if (err) {
            log.error(err.message);
            resolve(false);
        } else {
            resolve(true);
        }
    });
});
