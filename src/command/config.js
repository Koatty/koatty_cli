/*
 * @Description:
 * @Usage:
 * @Author: richen
 * @Date: 2020-12-22 17:29:34
 * @LastEditTime: 2024-03-14 10:59:09
 */

module.exports = {
  TEMPLATE_NAME: 'koatty_template',
  TEMPLATE_URL: 'https://github.com/Koatty/koatty_template.git#main',
  TEMPLATE_URL_GITEE: 'https://gitee.com/richenlin/koatty_template.git#main',
  CLI_TEMPLATE_NAME: 'koatty_template_cli',
  CLI_TEMPLATE_URL: 'https://github.com/Koatty/koatty_template_cli.git#main',
  CLI_TEMPLATE_URL_GITEE: 'https://gitee.com/richenlin/koatty_template_cli.git#main',
  COM_TEMPLATE_NAME: 'koatty_template_component',
  COM_TEMPLATE_URL: 'https://github.com/Koatty/koatty_template_component.git#main',
  COM_TEMPLATE_URL_GITEE: 'https://gitee.com/richenlin/koatty_template_component.git#main',

  CTL_IMPORT: '//_IMPORT_LIST Important! Do not delete this line',
  CTL_METHOD: '//_METHOD_LIST Important! Do not delete this line',

  LOGO: `

┬┌─┌─┐┌─┐┌┬┐┌┬┐┬ ┬
├┴┐│ │├─┤ │  │ └┬┘
┴ ┴└─┘┴ ┴ ┴  ┴  ┴ 
-------------------------------------------
https://github.com/koatty
    `,

  TYPEORM_PLUGIN_CONFIG: {
    TypeormPlugin: {
      type: 'mysql',
      replication: {
        master: {
          host: '127.0.0.1',
          port: 3306,
          username: 'test',
          password: 'test',
          database: 'test',
        },
        slaves: [
          {
            host: '127.0.0.1',
            port: 3306,
            username: 'test',
            password: 'test',
            database: 'test',
          },
        ],
      },
      synchronize: false,
      logging: true,
      entities: [`${process.env.APP_PATH || '${process.env.APP_PATH}'}/model/*`],
    },
  }
};