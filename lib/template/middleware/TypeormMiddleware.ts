/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-05-18 11:36:36
 */
import { Middleware, IMiddleware, Helper } from "koatty";
import { createConnection, Connection } from "typeorm";
import { App } from '<Path>/App';

const defaultOpt = {
    //默认配置项
    "type": "mysql", //mysql, mariadb, postgres, sqlite, mssql, oracle, mongodb, cordova
    "host": "localhost",
    "port": 3306,
    "username": "test",
    "password": "test",
    "database": "test",
    "synchronize": true, //true 每次运行应用程序时实体都将与数据库同步
    "logging": true,
    "entities": [`${process.env.APP_PATH}/model/*`]
};


@Middleware()
export class TypeormMiddleware implements IMiddleware {
    run(options: any, app: App) {
        options = Helper.extend(defaultOpt, options);
        const conn = function () {
            return createConnection(options).then((connection: Connection) => {
                Helper.define(app, 'connection', connection);
            }).catch((err) => {
                Helper.error(err);
            });
        };
        //应用启动执行一次
        app.once('appReady', async () => {
            await conn();
        });
        return async function (ctx: any, next: any) {
            if (!app.connection) {
                await conn();
            }
            return next();
        };
    }
}