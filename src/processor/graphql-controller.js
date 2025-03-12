/*
 * @Description: GraphQL控制器处理器
 * @Usage: 解析GraphQL Schema生成TypeScript解析器
 * @Author: richen
 * @Date: 2025-02-27 12:00:00
 * @LastEditTime: 2025-03-12 13:50:18
 * @License: BSD (3-Clause)
 * @Copyright (c): <richenlin(at)gmail.com>
 */
const { parseGraphqlDocument, parseOperations,
  parseTypeDefinitions, getTypeName } = require('koatty_graphql');
const path = require('path');
const ufs = require('../utils/fs');
const string = require('../utils/sting');
const { getAppPath } = require("../utils/path");
const { CTL_IMPORT, CTL_METHOD } = require('../command/config');

const baseTypes = ['string', 'number', 'boolean', 'ID'];
const operationTypes = ['Query', 'Mutation', 'Subscription'];
/**
 * GraphQL处理器入口
 * @param {object} args 
 * @param {object} templatePath 
 * @returns {object}
 */
function graphqlProcessor(args, templatePath) {
  parseGraphqlArgs(args, templatePath);
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
function parseGraphqlArgs(args, templatePath) {
  const pascalName = string.toPascal(args.sourceName);
  const schemaFile = `${getAppPath()}/graphql/${pascalName}.graphql`;

  if (!ufs.isExist(schemaFile)) {
    throw Error(`GraphQL schema文件不存在: ${schemaFile}`);
  }

  const document = parseGraphqlDocument(schemaFile);
  const operations = parseOperations(document);
  const types = parseTypeDefinitions(document); // 添加类型定义解析函数

  generateResolverClass(args, operations, types, templatePath);
  generateTypeClasses(args, types, templatePath);

  return args;
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
    methods.forEach((method) => {
      // 处理参数类型，添加InputDto后缀并处理数组类型
      const processedArgs = method.args.map((arg) => {
        let typeName = arg.type;
        // 精确匹配基础类型（包括数组形式）
        const isArray = typeName.endsWith('[]');
        const baseTypeName = isArray ? typeName.replace('[]', '') : typeName;
        // 仅非基础类型
        if (!baseTypes.includes(baseTypeName)) {
          typeRefs.add(baseTypeName);
          return `@${opType === 'Query' ? 'Get' : 'Post'}() ${arg.name}: ${typeName}Dto`;
        }

        return `@${opType === 'Query' ? 'Get' : 'Post'}() ${arg.name}: ${typeName}`;
      });

      // 处理返回类型，保留数组标记
      let returnType = method.returnType;
      const isArray = returnType.endsWith('[]');
      const baseReturnTypeName = isArray ? returnType.replace('[]', '') : returnType;

      const methodContext = {
        method: opType === 'Mutation' ? 'PostMapping' : 'GetMapping', // 修正HTTP方法映射
        validated: opType === 'Mutation' ? true : false,
        name: method.name,
        args: processedArgs,
        returnType: returnType
      };
      // 仅非基础类型
      if (!baseTypes.includes(baseReturnTypeName)) {
        typeRefs.add(baseReturnTypeName);
        methodContext.returnType = isArray ? returnType.replace('[]', 'Dto[]') : `${returnType}Dto`;
      }

      let methodStr = methodTemplate.replace(/_METHOD_DECORATOR/g, methodContext.method);
      methodStr = methodStr.replace(/_VALIDATED/g, methodContext.validated ? '\n@Validated()\n' : '');
      methodStr = methodStr.replace(/_METHOD_NAME/g, methodContext.name);
      methodStr = methodStr.replace(/_ARGS/g, methodContext.args.join(','));
      methodStr = methodStr.replace(/_RETURN_TYPE/g, methodContext.returnType);
      methodStr = methodStr.replace(/_RESULT_TYPE/g, isArray ? `Array.of(new ${methodContext.returnType.replace('[]', '')}())` : `new ${methodContext.returnType}()`);
      methodArr.push(methodStr);
    });
  });

  // 生成类型导入
  Array.from(typeRefs).forEach((typeName) => {
    if (types[typeName] && types[typeName].kind !== 'ScalarTypeDefinition') {
      importArr.push(importTemplate
        .replace(/_TYPE_NAME/g, `${typeName}Dto`)
        .replace(/_SUB_PATH/g, args.subModule ? '../..' : '..'));
    }
  });

  // 合并模板内容
  if (importArr.length > 0) {
    resolverContent = resolverContent.replace(new RegExp(CTL_IMPORT, "g"), importArr.join("\n"));
  }
  resolverContent = resolverContent.replace(new RegExp(CTL_METHOD, "g"), methodArr.join("\n"));
  args.createMap[args.destFile] = resolverContent;
}


function generateTypeClasses(args, types, templatePath) {
  const destPath = path.resolve(`${getAppPath()}/dto/`);
  const typeTemplate = ufs.readFile(path.resolve(templatePath, `dto_graphql.template`));

  Object.entries(types).forEach(([typeName, definition]) => {
    if (!operationTypes.includes(definition.name) &&
      (definition.kind === 'ObjectTypeDefinition' || definition.kind === 'InputObjectTypeDefinition')) {
      const props = definition.fields.map((field) => {
        return ` @IsDefined()
  ${field.name.value}: ${getTypeName(field.type)};
  `;
      });

      const typeFile = `${destPath}/${typeName}Dto.ts`;
      const typeContent = typeTemplate
        .replace(/_CLASS_NAME/g, `${typeName}Dto`)
        .replace('//_FIELDS', props.join('\n\n'));

      if (!ufs.isExist(typeFile)) {
        args.createMap[typeFile] = typeContent;
      }
    }
  });
}

module.exports = {
  graphqlProcessor,
  parseGraphqlArgs
}