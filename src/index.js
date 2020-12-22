#!/usr/bin/env node

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


// create controller
program
    .command('controller <controllerName>')
    .description('add controller class')
    .action((controllerName) => {
        require('./command/create_module')(controllerName, 'controller');
    });
program
    .command('ctl <controllerName>')
    .description('add controller class')
    .action((controllerName) => {
        require('./command/create_module')(controllerName, 'controller');
    });

// create middleware
program
    .command('middleware <middlewareName>')
    .description('add middleware class')
    .action((middlewareName) => {
        require('./command/create_module')(middlewareName, 'middleware');
    });
program
    .command('mid <middlewareName>')
    .description('add middleware class')
    .action((middlewareName) => {
        require('./command/create_module')(middlewareName, 'middleware');
    });


// create service
program
    .command('service <serviceName>')
    .description('add service class')
    .action((serviceName) => {
        require('./command/create_module')(serviceName, 'service');
    });
program
    .command('svc <serviceName>')
    .description('add service class')
    .action((serviceName) => {
        require('./command/create_module')(serviceName, 'service');
    });

// create plugin
program
    .command('plugin <pluginName>')
    .description('add plugin class')
    .action((pluginName) => {
        require('./command/create_module')(pluginName, 'plugin');
    });
program
    .command('plg <pluginName>')
    .description('add plugin class')
    .action((pluginName) => {
        require('./command/create_module')(pluginName, 'plugin');
    });


// create aspect
program
    .command('aspect <aspectName>')
    .description('add aspect class')
    .action((aspectName) => {
        require('./command/create_module')(aspectName, 'aspect');
    });
program
    .command('asp <aspectName>')
    .description('add aspect class')
    .action((aspectName) => {
        require('./command/create_module')(aspectName, 'aspect');
    });


// create model
program
    .command('model <modelName>')
    .description('add model class')
    .action((modelName) => {
        require('./command/create_module')(modelName, 'model');
    });
program
    .command('asp <modelName>')
    .description('add model class')
    .action((modelName) => {
        require('./command/create_module')(modelName, 'model');
    });




program.parse(process.argv);