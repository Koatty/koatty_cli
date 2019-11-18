/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-11-14 17:26:48
 */
import { Middleware, Helper } from "koatty";
import { createConnection, Connection, BaseApp } from "typeorm";

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
export class TypeormMid {
    run(options: any, app: BaseApp) {
        options = Helper.extend(defaultOpt, options);
        const conn = function () {
            createConnection(options).then((connection: Connection) => {
                Helper.define(app, 'connection', connection);
            }).catch((err) => {
                Helper.error(err);
            });
        };
        //应用启动执行一次
        app.once('appReady', () => {
            conn();
        });
        return async function (ctx: any, next: any) {
            if (!app.connection) {
                await conn();
            }
            return next();
        };
    }
}