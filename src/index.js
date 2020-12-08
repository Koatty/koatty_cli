/*
 * @Author: richen
 * @Date: 2020-12-08 10:35:52
 * @LastEditors: linyyyang<linyyyang@tencent.com>
 * @LastEditTime: 2020-12-08 10:41:19
 * @License: BSD (3-Clause)
 * @Copyright (c) - <richenlin(at)gmail.com>
 */
const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

updateNotifier({ pkg }).notify();

const camelias = str => str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
const cleanArgs = (cmd) => {
    const args = {};
    cmd.options.forEach((o) => {
        const key = camelias(o.long.replace(/^--/, ''));
        // if an option is not present and Command has a method with the same name
        // it should not be copied
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            args[key] = cmd[key];
        }
    });
    return args;
};

program.version(pkg.version).usage('[command] <options ...>');


// create project
program
    .command('init <projectName>')
    .description('create project')
    .option('-t, --template <template>', 'create project use custom template')
    .action((projectName, cmdObj) => {
        require('./command/create_project')(projectName, cleanArgs(cmdObj));
    });
program
    .command('create <projectName>')
    .description('create project')
    .option('-t, --template <template>', 'create project use custom template')
    .action((projectName, cmdObj) => {
        require('./command/create_project')(projectName, cleanArgs(cmdObj));
    });