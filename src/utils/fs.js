/*
 * @Author: richen
 * @Date: 2020-12-08 10:42:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-11-24 16:21:39
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const fs = require('fs');
const { COPYFILE_EXCL } = fs.constants;
const path = require('path');
const log = require('../utils/log');
const lib = require('koatty_lib');

/**
 * check file is exists
 * @param {string} path 
 */
const isExist = (path) => {
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
const copyFile = async function (source, dest) {
    const destDir = path.dirname(dest);
    if (!isExist(destDir)) {
        await lib.mkDir(destDir);
    }
    return new Promise(function (fulfill, reject) {
        fs.copyFile(source, dest, COPYFILE_EXCL, (e) => {
            return e ? reject(e) : fulfill(null);
        });
    });
};

/**
 * move file
 * @param {string} source file source path
 * @param {string} dest file destination
 */
const moveFile = (source, dest) => new Promise((resolve) => {
    return lib.reFile(source, dest);
});

/**
 * rm file
 * @param {string} dest file destination
 */
const rmFile = (dest) => new Promise((resolve) => {
    return lib.rmFile(dest);
});

/**
 * write file
 *
 * @param {*} filename
 * @param {*} data
 */
const writeFile = (filename, data) => lib.writeFile(filename, data);

/**
 * read file
 *
 * @param {*} filename
 */
const readFile = (filename) => fs.readFileSync(filename).toString();

/**
 * create dir
 * @param {string} path dir
 */
const mkDir = (path) => new Promise((resolve) => {
    return lib.mkDir(path);
});




module.exports = {
    isExist,
    copyFile,
    moveFile,
    readFile,
    writeFile,
    rmFile,
    mkDir,
}