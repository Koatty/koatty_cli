/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-16 18:32:32
 */
import * as Koa from "koa";
import { App } from "../App";
import { Middleware, helper } from "koatty";
const defaultOpt = {
    //默认配置项
};


@Middleware()
export class <Middleware> {
    run(options: any, app: App) {
        options = helper.extend(defaultOpt, options);
        //应用启动执行一次
        // app.once('appReady', () => { });

        return function (ctx: Koa.Context, next: any) {
            return next();
        };
    }
}