#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const commander = require('commander');
const helper = require('think_lib');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const cwd = process.cwd();
const templatePath = __dirname + '/template';
const projectRootPath = './'; //project root path
const notifier = updateNotifier({ pkg });

/**
 * get app root path
 * @return {} []
 */
const getProjectAppPath = function (rootPath) {
    return path.resolve(rootPath + 'src');
};

/**
 * get date time
 * @return {} []
 */
const getDateTime = function () {
    const fn = function (d) {
        return ('0' + d).slice(-2);
    };
    let d = new Date();
    let date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
    let time = fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
    return date + ' ' + time;
};

/**
 * get version
 * @return {String} []
 */
const getVersion = function () {
    let filepath = path.resolve(__dirname, '../package.json');
    let version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
};


/**
 * get app name
 * @return {} []
 */
const getAppName = function () {
    let filepath = path.normalize(cwd + '/' + projectRootPath).replace(/\\/g, '');
    let matched = filepath.match(/([^\/]+)\/?$/);
    return matched[1];
};

/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
const copyFile = function (source, target, replace, showWarning) {
    if (showWarning === undefined) {
        showWarning = true;
    }
    if (isBoolean(replace)) {
        showWarning = replace;
        replace = '';
    }
    //if target file is exist, ignore it
    if (helper.isFile(target)) {
        if (showWarning) {
            console.log('exist' + ' : ' + path.normalize(target));
        }
        return;
    }

    helper.mkDir(path.dirname(target));

    //if source file is not exist
    if (!helper.isFile(templatePath + path.sep + source)) {
        return;
    }

    let content = fs.readFileSync(templatePath + path.sep + source, 'utf8');
    //replace content
    if (replace) {
        for (let key in replace) {
            while (true) {
                let content1 = content.replace(key, replace[key]);
                if (content1 === content) {
                    content = content1;
                    break;
                }
                content = content1;
            }
        }
    }

    fs.writeFileSync(target, content);
    console.log('create' + ' : ' + path.normalize(target));
};


/**
 * check app
 * @param  {String}  projectRootPath []
 * @return {Boolean}             []
 */
const isThinkApp = function (projectRootPath) {
    if (isDir(projectRootPath)) {
        let filepath = projectRootPath + '.thinksrc';
        if (helper.isFile(filepath)) {
            return true;
        }
    }
    return false;
};

/**
 * check env
 * @return {} []
 */
const _checkEnv = function () {
    notifier.notify();
    if (!isThinkApp('./')) {
        console.log();
        console.log('current path is not a koatty project.');
        process.exit();
    }
    console.log();
};

/**
 * 
 * 
 * @param {any} projectRootPath 
 */
const createProject = function (projectRootPath) {
    if (isThinkApp(projectRootPath)) {
        console.log('path `' + projectRootPath + '` is already exist');
        process.exit();
    }

    helper.mkDir(projectRootPath);
    copyFile('package.json', projectRootPath + 'package.json');
    copyFile('.eslintrc', projectRootPath + '.eslintrc');
    copyFile('.thinksrc', projectRootPath + '.thinksrc', {
        '<createAt>': getDateTime()
    });
    copyFile('pm2.json', projectRootPath + 'pm2.json', {
        '<ROOT_PATH>': projectRootPath,
        '<APP_NAME>': getAppName()
    });
    copyFile('apidoc.json', projectRootPath + 'apidoc.json', {
        '<APP_NAME>': getDateTime()
    });
    copyFile('README.md', projectRootPath + 'README.md');

    console.log('create' + ' : ' + projectRootPath + '/static');
    helper.mkDir(projectRootPath + path.sep + 'static');
    // helper.mkDir(projectRootPath + path.sep + 'static' + path.sep + 'js');
    // helper.mkDir(projectRootPath + path.sep + 'static' + path.sep + 'css');
    // helper.mkDir(projectRootPath + path.sep + 'static' + path.sep + 'images');
    copyFile('favicon.ico', projectRootPath + path.sep + 'static' + path.sep + 'favicon.ico');

    APP_PATH = getProjectAppPath(projectRootPath);
    console.log('create' + ' : ' + APP_PATH);
    copyFile('app.ts', projectRootPath + 'app.ts');

    helper.mkDir(APP_PATH + path.sep + 'controller');
    // helper.mkDir(APP_PATH + path.sep + 'middleware');
    // helper.mkDir(APP_PATH + path.sep + 'model');
    // helper.mkDir(APP_PATH + path.sep + 'service');
    helper.mkDir(APP_PATH + path.sep + 'config');
    // helper.mkDir(APP_PATH + path.sep + 'view' + path.sep + 'default');

    copyFile('controller' + path.sep + 'index.ts', APP_PATH + path.sep + 'controller' + path.sep + 'index.ts');

    //config
    copyFile('config' + path.sep + 'config.ts', APP_PATH + path.sep + 'config' + path.sep + 'config.ts');
    copyFile('config' + path.sep + 'db.ts', APP_PATH + path.sep + 'config' + path.sep + 'db.ts');

    let conf = 'middleware.ts';
    copyFile('config' + path.sep + conf, APP_PATH + path.sep + 'config' + path.sep + 'middleware.ts');

    console.log();
    console.log('  enter path:');
    console.log('  $ cd ' + projectRootPath);
    console.log();

    console.log('  install dependencies:');
    console.log('  $ npm install');
    console.log();

    console.log('  run the app:');
    console.log('  $ npm start');

    console.log();
};

/**
 * 
 * 
 * @param {any} controller 
 */
const createController = function (controller) {
    _checkEnv();

    let module = '';
    controller = controller.split('/');
    if (controller.length > 1) {
        module = controller[0];
        controller = controller[1];
    } else {
        controller = controller[0];
    }

    module = module.toLowerCase();
    controller = controller.toLowerCase();
    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'controller' + path.sep + module);

    let file = 'new.ts';

    if (module) {
        // module = helper.camelCase(module, { pascalCase: true });
        // controller = helper.camelCase(controller, { pascalCase: true });
        copyFile('controller' + path.sep + file, APP_PATH + path.sep + 'controller' + path.sep + module + path.sep + controller + '.ts', {
            '<NewController>': controller
        });
    } else {
        // controller = helper.camelCase(controller, { pascalCase: true });
        copyFile('controller' + path.sep + file, APP_PATH + path.sep + 'controller' + path.sep + controller + '.ts', {
            '<NewController>': controller
        });
    }

};

/**
 * 
 * 
 * @param {any} middleware 
 */
const createMiddleware = function (middleware) {
    _checkEnv();

    middleware = middleware.split('/');
    if (middleware.length > 1) {
        middleware = middleware[1];
    } else {
        middleware = middleware[0];
    }
    middleware = middleware.toLowerCase();
    APP_PATH = getProjectAppPath(projectRootPath);
    mkdir(APP_PATH + path.sep + 'middleware');
    copyFile('middleware' + path.sep + 'middleware.ts', APP_PATH + path.sep + 'middleware' + path.sep + middleware + '.ts', {
        '<Middleware>': middleware
    });

    console.log();
    console.log('  please modify /app/config/middlewate.ts file:');
    console.log();
    console.log('  list: [..., "' + middleware + '"] //加载中间件' + middleware);
    console.log('  config: { //中间件配置 ');
    console.log('      ...');
    console.log('   }');

    console.log();
};

/**
 * 
 * 
 * @param {any} service 
 */
const createService = function (service) {
    _checkEnv();

    let module = '';
    service = service.split('/');
    if (service.length > 1) {
        module = service[0];
        service = service[1];
    } else {
        service = service[0];
    }

    module = module.toLowerCase();
    service = service.toLowerCase();
    APP_PATH = getProjectAppPath(projectRootPath);
    mkdir(APP_PATH + path.sep + 'service' + path.sep + module);
    if (module) {
        copyFile('service' + path.sep + 'service.ts', APP_PATH + path.sep + 'service' + path.sep + module + path.sep + service + '.ts', {
            '<Service>': service
        });
    } else {
        copyFile('service' + path.sep + 'service.ts', APP_PATH + path.sep + 'service' + path.sep + service + '.ts', {
            '<Service>': service
        });
    }

};


//==================================================================================================

commander.version(getVersion()).usage('[command] <options ...>');

//create project
commander.command('new <projectName>').description('create project').action(function (projectPath) {
    projectRootPath = path.normalize(projectPath + '/');
    createProject(projectRootPath);
});

//create controlelr
commander.command('controller <controllerName>').description('add controller').action(function (controller) {
    createController(controller);
});

//create middleware
commander.command('middleware <middlewareName>').description('add middleware').action(function (middleware) {
    createMiddleware(middleware);
});

//create service
commander.command('service <serviceName>').description('add service').action(function (service) {
    createService(service);
});

commander.parse(process.argv);