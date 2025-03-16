#!/usr/bin/env node

const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const create_project = require('./command/create_project');
const create_module = require('./command/create_module');

updateNotifier({ pkg }).notify();

const camelias = (str) => str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));

/**
 * Clean and transform command line options into a camelCase object.
 * 
 * @param {Command} cmd - Commander.js command object containing parsed options
 * @returns {Object} Object with camelCase keys from long option names and their values
 * @private
 */
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

/**
 * Set program version from package.json and define usage format
 * for command line interface.
 * 
 * @version {string} pkg.version - The version number from package.json
 * @usage [command] <options ...> - The command format pattern
 */
program.version(pkg.version).usage('[command] <options ...>');

/**
 * Command to create a new Koatty project
 * 
 * @param {string} projectName - The name of the project to create
 * @param {Object} cmdObj - Command options
 * @param {string} [cmdObj.template] - Template type to use: project|middleware|plugin
 * 
 * @example
 * ```bash
 * koatty new myproject -t project
 * ```
 */
program
  .command('new <projectName>')
  .description('create project')
  .option('-t, --template <template>', 'create project use custom template: project|middleware|plugin')
  .action((projectName, cmdObj) => {
    create_project(projectName, cleanArgs(cmdObj));
  });

/**
 * Create a new controller class command.
 * 
 * @command controller <controllerName>
 * @description Creates a new controller class with specified name and type
 * @param {string} controllerName - The name of the controller to create
 * @option {string} -t, --type - Controller type (http|grpc|websocket|graphql), defaults to http
 * @example
 *   koatty controller UserController
 *   koatty controller UserController --type grpc
 */
program
  .command('controller <controllerName>')
  .description('create controller class')
  .option('-t, --type <type>', 'create controller\'s type, http|grpc|websocket|graphql, default is http controller.')
  .action((controllerName, cmdObj) => {
    create_module(controllerName, 'controller', cleanArgs(cmdObj));
  });

/**
 * Register command to create middleware class
 * @command middleware <middlewareName>
 * @description Create a new middleware class with specified name
 * @param {string} middlewareName The name of middleware to create
 * @example
 * ```bash
 * koatty middleware TestMiddleware
 * ```
 */
program
  .command('middleware <middlewareName>')
  .description('create middleware class')
  .action((middlewareName) => {
    create_module(middlewareName, 'middleware', undefined);
  });

/**
 * Creates a service class command
 * 
 * @command service <serviceName>
 * @description Create a new service class with optional interface
 * @param {string} serviceName - The name of the service to create
 * @option {boolean} -i, --interface - Whether to create service's interface, defaults to false
 * @example
 * ```bash
 * koatty service user
 * koatty service user --interface
 * ```
 */
program
  .command('service <serviceName>')
  .description('create service class')
  .option(
    '-i, --interface',
    'create service\'s and service interface, default false.'
  )
  .action((serviceName, cmdObj) => {
    create_module(serviceName, 'service', cleanArgs(cmdObj));
  });

/**
 * Create a plugin command that generates a new plugin class
 * 
 * @command plugin <pluginName>
 * @description Create a new plugin class with specified name
 * @param {string} pluginName - The name of the plugin to create
 * @action Calls create_module function with plugin type
 * @example
 * ```bash
 * koatty plugin TestPlugin
 * ```
 */
program
  .command('plugin <pluginName>')
  .description('create plugin class')
  .action((pluginName) => {
    create_module(pluginName, 'plugin', undefined);
  });

/**
 * Create a new aspect class command
 * 
 * @command aspect <aspectName>
 * @description Create a new aspect class with specified name
 * @param {string} aspectName - The name of the aspect to create
 * @action Calls create_module function with aspect type
 * @example
 * ```bash
 * koatty aspect TestAspect
 * ```
 */
program
  .command('aspect <aspectName>')
  .description('create aspect class')
  .action((aspectName) => {
    create_module(aspectName, 'aspect', undefined);
  });

/**
 * Create a new dto class command
 * 
 * @command dto <dtoName>
 * @description Create a new dto class with specified name
 * @param {string} dtoName - The name of the dto to create
 * @action Calls create_module function with dto type
 * @example
 * ```bash
 * koatty dto UserDto
 * ```
 */
program
  .command('dto <dtoName>')
  .description('create dto class')
  .action((dtoName) => {
    create_module(dtoName, 'dto', undefined);
  });

/**
 * Create a new exception class command
 * 
 * @command exception <dtoName>
 * @description Create a new exception class with specified name
 * @param {string} dtoName - The name of the exception to create
 * @action Calls create_module function with exception type
 * @example
 * ```bash
 * koatty exception UserException
 * ```
 */
program
  .command('exception <dtoName>')
  .description('create exception class')
  .action((dtoName) => {
    create_module(dtoName, 'exception', undefined);
  });

/**
 * Create a new proto file command
 * 
 * @command proto <protoName>
 * @description Create a new proto file with specified name
 * @param {string} protoName - The name of the proto to create
 * @action Calls create_module function with proto type
 * @example
 * ```bash
 * koatty proto user
 * ```
 */
program
  .command('proto <protoName>')
  .description('create proto file')
  .action((protoName) => {
    create_module(protoName, 'proto', undefined);
  });

/**
 * Command to create a GraphQL schema
 * @param {string} protoName - The name of the GraphQL schema to create
 * @description Creates a new GraphQL schema module with the specified name
 * @example
 * ```bash
 * koatty graphql user
 * ```
 */
program
  .command('graphql <protoName>')
  .description('create graphql schema')
  .action((protoName) => {
    create_module(protoName, 'graphql', undefined);
  });

/**
 * Create a model class command
 * 
 * @command model <modelName>
 * @description Creates a new model class with specified name
 * @param {string} modelName - The name of the model to create
 * @option {string} -o, --orm - Specify ORM module to use (defaults to typeorm)
 * @example
 * ```bash
 * koatty model User
 * koatty model User --orm thinkorm
 * ```
 */
program
  .command('model <modelName>')
  .description('create model class')
  .option('-o, --orm <orm>', 'Specify ORM module to use, defaults to typeorm')
  .action((modelName, cmdObj) => {
    create_module(modelName, 'model', cleanArgs(cmdObj));
  });




program.parse(process.argv);