#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const helper = require('think_lib');
const loader = require('think_loader');
const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const cwd = process.cwd();
const templatePath = __dirname + '/template';
let projectRootPath = './'; //project root path
const notifier = updateNotifier({ pkg });

/**
 * get app root path
 * @return {} []
 */
const getProjectAppPath = function (rootPath) {
    return path.resolve(rootPath + '/src');
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
    if (helper.isBoolean(replace)) {
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
    if (helper.isDir(projectRootPath)) {
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
    copyFile('launch.json', projectRootPath + '.vscode/launch.json');
    copyFile('package.txt', projectRootPath + 'package.json');
    copyFile('tsconfig.txt', projectRootPath + 'tsconfig.json');
    copyFile('tslint.txt', projectRootPath + 'tslint.json');
    copyFile('.gitignore', projectRootPath + '.gitignore');
    copyFile('.thinksrc', projectRootPath + '.thinksrc', {
        '<createAt>': getDateTime()
    });
    copyFile('pm2.json', projectRootPath + 'pm2.json', {
        '<APP_NAME>': getAppName()
    });
    copyFile('apidoc.json', projectRootPath + 'apidoc.json', {
        '<APP_NAME>': getDateTime()
    });
    copyFile('README.md', projectRootPath + 'README.md');

    console.log('create' + ' : ' + projectRootPath + 'static');
    helper.mkDir(projectRootPath + path.sep + 'static');
    // helper.mkDir(projectRootPath + path.sep + 'static' + path.sep + 'js');
    // helper.mkDir(projectRootPath + path.sep + 'static' + path.sep + 'css');
    // helper.mkDir(projectRootPath + path.sep + 'static' + path.sep + 'images');
    // copyFile('favicon.ico', projectRootPath + path.sep + 'static' + path.sep + 'favicon.ico');

    APP_PATH = getProjectAppPath(projectRootPath);
    console.log('create' + ' : ' + APP_PATH);
    helper.mkDir(APP_PATH);
    copyFile('App.ts', APP_PATH + path.sep + 'App.ts');

    helper.mkDir(APP_PATH + path.sep + 'controller');
    // helper.mkDir(APP_PATH + path.sep + 'middleware');
    // helper.mkDir(APP_PATH + path.sep + 'model');
    // helper.mkDir(APP_PATH + path.sep + 'service');
    helper.mkDir(APP_PATH + path.sep + 'config');
    // helper.mkDir(APP_PATH + path.sep + 'view' + path.sep + 'default');

    copyFile('controller' + path.sep + 'IndexController.ts', APP_PATH + path.sep + 'controller' + path.sep + 'IndexController.ts');

    //config
    copyFile('config' + path.sep + 'config.ts', APP_PATH + path.sep + 'config' + path.sep + 'config.ts');
    copyFile('config' + path.sep + 'db.ts', APP_PATH + path.sep + 'config' + path.sep + 'db.ts');
    copyFile('config' + path.sep + 'router.ts', APP_PATH + path.sep + 'config' + path.sep + 'router.ts');
    copyFile('config' + path.sep + 'middleware.ts', APP_PATH + path.sep + 'config' + path.sep + 'middleware.ts');

    //add static middleware
    copyFile('middleware' + path.sep + 'StaticMiddleware.ts', APP_PATH + path.sep + 'middleware' + path.sep + 'StaticMiddleware.ts');

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

    module = helper.camelCase(module, { pascalCase: true });
    controller = helper.camelCase(controller, { pascalCase: true });

    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'controller' + path.sep + module);

    let file = 'NewController.ts';

    if (module) {
        copyFile('controller' + path.sep + file, APP_PATH + path.sep + 'controller' + path.sep + module + path.sep + controller + 'Controller.ts', {
            '<Path>': '../..',
            '<New>': module.toLowerCase() + '/' + controller.toLowerCase(),
            '<NewController>': controller + 'Controller'
        });
    } else {
        copyFile('controller' + path.sep + file, APP_PATH + path.sep + 'controller' + path.sep + controller + 'Controller.ts', {
            '<Path>': '..',
            '<New>': controller.toLowerCase(),
            '<NewController>': controller + 'Controller'
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

    middleware = helper.camelCase(middleware, { pascalCase: true });

    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'middleware');
    copyFile('middleware' + path.sep + 'NewMiddleware.ts', APP_PATH + path.sep + 'middleware' + path.sep + middleware + 'Middleware.ts', {
        '<Path>': '..',
        '<Middleware>': middleware + 'Middleware'
    });

    console.log();
    console.log('  please modify /app/config/middlewate.ts file:');
    console.log();
    console.log('  list: [..., "' + middleware + 'Middleware' + '"] //加载中间件' + middleware);
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

    module = helper.camelCase(module, { pascalCase: true });
    service = helper.camelCase(service, { pascalCase: true });

    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'service' + path.sep + module);
    if (module) {
        copyFile('service' + path.sep + 'NewService.ts', APP_PATH + path.sep + 'service' + path.sep + module + path.sep + service + 'Service.ts', {
            '<Path>': '../..',
            '<Service>': service + 'Service'
        });
    } else {
        copyFile('service' + path.sep + 'service.ts', APP_PATH + path.sep + 'service' + path.sep + service + 'Service.ts', {
            '<Path>': '..',
            '<Service>': service + 'Service'
        });
    }

};

/**
 * 
 * 
 * @param {any} model 
 */
const createModel = function (model) {
    _checkEnv();

    let module = '';
    model = model.split('/');
    if (model.length === 2) {
        module = model[0];
        model = model[1];
    } else {
        model = model[0];
    }

    module = helper.camelCase(module, { pascalCase: true });
    model = helper.camelCase(model, { pascalCase: true });


    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'model' + path.sep + module);

    let orm = program.orm || 'thinkorm';

    if (module) {
        copyFile('model' + path.sep + orm + '.ts', APP_PATH + path.sep + 'model' + path.sep + module + path.sep + model + 'Model.ts', {
            '<ClassName>': model + 'Model',
            '<ModelName>': model,
            '<Path>': '..',
        });
    } else {
        copyFile('model' + path.sep + orm + '.ts', APP_PATH + path.sep + 'model' + path.sep + model + 'Model.ts', {
            '<ClassName>': model + 'Model',
            '<ModelName>': model,
            '<Path>': '..',
        });
    }

    if (orm == 'typeorm') {
        copyFile('middleware' + path.sep + 'TypeormMiddleware.ts', APP_PATH + path.sep + 'middleware' + path.sep + 'TypeormMiddleware.ts');
        console.log();
        console.log('  please modify /app/config/middlewate.ts file:');
        console.log();
        console.log('  list: [..., "TypeormMiddleware"]');
        console.log('  config: { //中间件配置 ');
        console.log('      TypeormMiddleware: {');
        console.log(`       "type": "mysql", //mysql, mariadb, postgres, sqlite, mssql, oracle, mongodb, cordova
        "host": "localhost",
        "port": 3306,
        "username": "test",
        "password": "test",
        "database": "test",
        "synchronize": true, //true 每次运行应用程序时实体都将与数据库同步
        "logging": true,
        "entities": [\`\$\{ process.env.APP_PATH \} \/model\/*\`]`);
        console.log('      }');
        console.log('   }');

    }

};

/**
 *
 *
 * @param {*} aspect
 */
const createAspect = function (aspect) {
    _checkEnv();

    aspect = helper.camelCase(aspect, { pascalCase: true });

    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'aspect');
    copyFile('aspect' + path.sep + 'NewAspect.ts', APP_PATH + path.sep + 'aspect' + path.sep + aspect + 'Aspect.ts', {
        '<Path>': '..',
        '<Aspect>': aspect + 'Aspect'
    });
};

/**
 *
 *
 * @param {*} dto(dto)ct
 */
const createDto = function (dto) {
    _checkEnv();

    dto = helper.camelCase(dto, { pascalCase: true });

    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'Dto');
    copyFile('dto' + path.sep + 'NewDTO.ts', APP_PATH + path.sep + 'Dto' + path.sep + dto + 'DTO.ts', {
        '<DTO>': dto + 'DTO'
    });
};


/**
 *
 *
 * @param {*} plugin
 */
const createPlugin = function (plugin) {
    _checkEnv();

    plugin = helper.camelCase(plugin, { pascalCase: true });

    APP_PATH = getProjectAppPath(projectRootPath);
    helper.mkDir(APP_PATH + path.sep + 'plugin');
    copyFile('plugin' + path.sep + 'NewPlugin.ts', APP_PATH + path.sep + 'plugin' + path.sep + plugin + 'Plugin.ts', {
        '<PLUG>': plugin + 'Plugin'
    });
};


/**
 *
 *
 * @param {*} modelClass
 * @param {*} conf
 * @returns
 */
async function migrateExec(modelClass, conf) {
    try {
        if (helper.isClass(modelClass)) {
            let cls = new modelClass(conf);
            if (cls.config) {
                return cls.migrate();
            }
        }
        return Promise.resolve();
    } catch (e) {
        console.error(e);
        return;
    }
}

/**
 *
 *
 * @param {*} model
 * @returns
 */
const migrate = function (model) {
    _checkEnv();

    let file = program.file;
    let key = program.key;

    if (helper.isEmpty(file)) {
        console.log('please input the config file path. use the default value: `-f ./dist/config/db.js`');
        file = './dist/config/db.js';
    }
    if (helper.isEmpty(key)) {
        console.log('please input the database config key. use the default value: `-k database`');
        key = 'database';
    }
    let conf = require(path.resolve(projectRootPath + file));
    conf = conf.default ? conf.default : conf;
    if (helper.isEmpty(conf) || helper.isEmpty(conf[key])) {
        console.error('load config error.');
    }
    const distPath = path.resolve(projectRootPath + '/dist');
    if (model === "all") {
        const models = loader(distPath, {
            root: 'model',
            suffix: '.js',
            prefix: '',
        });
        let ps = [];
        for (let n in models) {
            if (models[n] && models[n][n]) {
                ps.push(migrateExec(models[n][n], conf[key]));
            }
        }
        return Promise.all(ps).then(() => {
            process.exit(1);
        }).catch(() => {
            process.exit(1);
        });
    } else {
        model = helper.camelCase(model, { pascalCase: true });
        const modelClass = require(`${distPath}/model/${model}Model.js`);
        return migrateExec(modelClass, conf[key]).then(() => {
            process.exit(1);
        }).catch(() => {
            process.exit(1);
        });
    }
};

//==================================================================================================

program.version(getVersion()).usage('[command] <options ...>')
    .option('-o, --orm <value>', 'used orm module (thinkorm, typeorm), default is thinkorm, used in `koatty model` command')
    .option('-f, --file <value>', 'defined config file path. used in `koatty migrate`')
    .option('-k, --key <value>', 'defined database config key. used in `koatty migrate`');

//create project
program.command('new <projectName>').description('create project').action(function (projectPath) {
    projectRootPath = path.normalize(projectPath + path.sep);
    createProject(projectRootPath);
});

//create controlelr
program.command('controller <controllerName>').description('add controller class').action(function (controller) {
    createController(controller);
});
program.command('ctl <controllerName>').description('add controller class').action(function (controller) {
    createController(controller);
});

//create middleware
program.command('middleware <middlewareName>').description('add middleware class').action(function (middleware) {
    createMiddleware(middleware);
});
program.command('mw <middlewareName>').description('add middleware class').action(function (middleware) {
    createMiddleware(middleware);
});

//create service
program.command('service <serviceName>').description('add service class').action(function (service) {
    createService(service);
});
program.command('sev <serviceName>').description('add service class').action(function (service) {
    createService(service);
});

//create model
program.command('model <modelName>').description('add model class').action(function (model) {
    createModel(model);
});
program.command('mo <modelName>').description('add model class').action(function (model) {
    createModel(model);
});

//create aspect
program.command('aspect <aspectName>').description('add aspect class').action(function (aspect) {
    createAspect(aspect);
});

//create dto
program.command('dto <dtoName>').description('add dto class').action(function (dto) {
    createDto(dto);
});

//create plugin
program.command('plugin <pluginName>').description('add plugin class').action(function (plugin) {
    createPlugin(plugin);
});

//migrate(for thinkorm)
program.command('migrate <modelName>').description('migrate for thinkorm').action(function (model) {
    migrate(model);
});

program.parse(process.argv);