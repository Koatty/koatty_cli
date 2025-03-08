/*
 * @Description: GraphQL控制器处理器
 * @Usage: 解析GraphQL Schema生成TypeScript解析器
 * @Author: richen
 * @Date: 2025-02-27 12:00:00
 * @LastEditTime: 2025-03-08 14:43:15
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */

const { parseGraphQLSDL } = require('@graphql-tools/utils');
const { mustache } = require('mustache');
const path = require('path');
const { getAppPath, string, ufs } = require('../../utils');

/**
 * GraphQL处理器入口
 * @param {object} args 
 * @returns {object}
 */
export function graphqlProcessor(args) {
  parseGraphqlArgs(args);
  args.destMap = {};
  args.replaceMap['_NEW'] = args.subModule
    ? `/${string.toPascal(args.subModule)}/${string.toPascal(args.sourceName)}`
    : `/${string.toPascal(args.sourceName)}`;
  return args;
}

/**
 * 解析GraphQL Schema参数
 * @param {object} args 
 * @returns {object}
 */
export function parseGraphqlArgs(args, templatePath) {
  const pascalName = string.toPascal(args.sourceName);
  const schemaFile = `${getAppPath()}/schema/${pascalName}.graphql`;

  if (!ufs.isExist(schemaFile)) {
    throw Error(`GraphQL schema文件不存在: ${schemaFile}`);
  }

  const source = ufs.readFile(schemaFile);
  const document = parseGraphQLSDL('', source).document;
  const operations = parseOperations(document);
  const types = parseTypeDefinitions(document); // 添加类型定义解析函数

  generateResolverClass(args, operations, types);
  generateTypeClasses(args, types, templatePath);

  return args;
}

/**
 * 解析SDL中的操作定义
 * @param {DocumentNode} document 
 * @returns {object}
 */
function parseOperations(document) {
  const operations = { Query: [], Mutation: [], Subscription: [] };

  document.definitions.forEach(def => {
    if (def.kind === 'OperationDefinition') {
      const operationType = def.operation;
      def.selectionSet.selections.forEach(selection => {
        const fieldName = selection.name.value;
        operations[operationType].push({
          name: fieldName,
          args: selection.arguments.map(arg => ({
            name: arg.name.value,
            type: getTypeName(arg.type)
          })),
          returnType: getTypeName(selection.type)
        });
      });
    }
  });

  return operations;
}

/**
 * 生成解析器类
 */
function generateResolverClass(args, operations, types, templatePath) {
  let resolverContent = ufs.readFile(path.resolve(templatePath, `controller_graphql.template`));
  const methodTemplate = ufs.readFile(path.resolve(templatePath, `controller_graphql_method.template`));
  const importTemplate = ufs.readFile(path.resolve(templatePath, `controller_graphql_import.template`));

  const methodArr = [];
  const importArr = [];
  const typeRefs = new Set();

  // 处理各类型操作
  Object.entries(operations).forEach(([opType, methods]) => {
    methods.forEach(method => {
      // 处理参数类型，添加InputDto后缀并处理数组类型
      const processedArgs = method.args.map(arg => {
        let typeName = arg.type;
        // 精确匹配基础类型（包括数组形式）
        const baseTypes = ['string', 'number', 'boolean', 'ID'];
        const isArray = typeName.endsWith('[]');
        const baseType = isArray ? typeName.replace('[]', '') : typeName;

        // 仅对非基础类型添加InputDto后缀
        if (!baseTypes.includes(baseType)) {
          typeName = isArray ? `${baseType}InputDto[]` : `${baseType}InputDto`;
        }
        return `@${opType}() ${arg.name}: ${typeName}`;
      });

      // 处理返回类型，保留数组标记
      const returnBaseTypes = ['string', 'number', 'boolean', 'ID'];
      let returnType = method.returnType;
      const isReturnArray = returnType.endsWith('[]');
      const returnBaseType = isReturnArray ? returnType.replace('[]', '') : returnType;

      if (!returnBaseTypes.includes(returnBaseType)) {
        returnType = isReturnArray ? `${returnBaseType}Dto[]` : `${returnBaseType}Dto`;
      }

      const methodContext = {
        method: opType === 'Mutation' ? 'PostMapping' : 'GetMapping', // 修正HTTP方法映射
        name: method.name,
        args: processedArgs.map(argStr => {
          // 保持原始装饰器格式
          const [decorator, typeDef] = argStr.split(': ');
          return {
            decorator: decorator.replace('@', ''),
            name: typeDef.split(': ')[0].trim(),
            type: typeDef.split(': ')[1].trim()
          };
        }),
        returnType: returnType,
        hasInputParam: processedArgs.some(arg => arg.includes('InputDto'))
      };

      const methodCode = mustache.render(methodTemplate, methodContext);

      methodArr.push(methodCode);
      typeRefs.add(method.returnType);
      method.args.forEach(arg => typeRefs.add(arg.type));
    });
  });

  // 生成类型导入
  Array.from(typeRefs).forEach(typeName => {
    if (types[typeName] && types[typeName].kind !== 'ScalarTypeDefinition') {
      importArr.push(importTemplate
        .replace(/_TYPE_NAME/g, typeName)
        .replace(/_SUB_PATH/g, args.subModule ? '../..' : '..'));
    }
  });

  // 合并模板内容
  if (importArr.length > 0) {
    resolverContent = resolverContent.replace('// _IMPORTS', importArr.join('\n'));
  }
  resolverContent = resolverContent.replace('// _METHOD_LIST', methodArr.join('\n\n'));
  args.createMap[args.destFile] = resolverContent;
}

/**
 * 生成类型定义类
 */
// 新增类型定义解析和类型名称处理函数
function parseTypeDefinitions(document) {
  const typeMap = {};
  document.definitions.forEach(def => {
    if (['ObjectTypeDefinition', 'InputObjectTypeDefinition', 'ScalarTypeDefinition'].includes(def.kind)) {
      typeMap[def.name.value] = {
        kind: def.kind,
        name: def.name.value,
        fields: def.fields || []
      };
    }
  });
  return typeMap;
}

// 处理GraphQL类型名称
function getTypeName(type) {
  if (type.kind === 'NonNullType') {
    return `${getTypeName(type.type)}`;
  }
  if (type.kind === 'ListType') {
    return `${getTypeName(type.type)}[]`;
  }
  // 类型映射转换
  const typeMap = {
    'ID': 'string',
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Boolean': 'boolean'
  };
  return typeMap[type.name.value] || type.name.value;
}

function generateTypeClasses(args, types, templatePath) {
  const destPath = path.resolve(`${getAppPath()}/types/`);
  const typeTemplate = ufs.readFile(path.resolve(templatePath, `dto_graphql.template`));

  Object.entries(types).forEach(([typeName, definition]) => {
    if (definition.kind === 'ObjectTypeDefinition' || definition.kind === 'InputObjectTypeDefinition') {
      const props = definition.fields.map(field => {
        return `  @IsDefined()
  ${field.name.value}: ${getTypeName(field.type)};`;
      });

      const typeFile = `${destPath}/${typeName}.ts`;
      const typeContent = typeTemplate
        .replace(/_CLASS_NAME/g, typeName)
        .replace('// _FIELDS', props.join('\n\n'));

      if (!ufs.isExist(typeFile)) {
        args.createMap[typeFile] = typeContent;
      }
    }
  });
}
