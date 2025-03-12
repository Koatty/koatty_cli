/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:29:34
 * @LastEditTime: 2025-03-12 17:59:58
 */

module.exports = {
  TEMPLATE_NAME: 'koatty_template',
  TEMPLATE_URL: 'https://github.com/Koatty/koatty_template.git#main',
  CLI_TEMPLATE_NAME: 'koatty_template_cli',
  CLI_TEMPLATE_URL: 'https://github.com/Koatty/koatty_template_cli.git#main',
  COM_TEMPLATE_NAME: 'koatty_template_component',
  COM_TEMPLATE_URL: 'https://github.com/Koatty/koatty_template_component.git#main',

  CTL_IMPORT: "//_IMPORT_LIST Important! Do not delete this line",
  CTL_METHOD: "//_METHOD_LIST Important! Do not delete this line",

  staticMap: new Map(Object.entries({
    proto: "/resource/proto",
    graphql: "/resource/graphql",
  })),

  subfixMap: new Map(Object.entries({
    proto: ".proto",
    graphql: ".graphql",
  })),

  LOGO: `

┬┌─┌─┐┌─┐┌┬┐┌┬┐┬ ┬
├┴┐│ │├─┤ │  │ └┬┘
┴ ┴└─┘┴ ┴ ┴  ┴  ┴ 
-------------------------------------------
https://github.com/koatty
    `
};