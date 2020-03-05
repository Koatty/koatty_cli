/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-03-05 11:45:45
 */
import { Middleware, Helper } from "koatty";
import { App } from '<Path>/App';


const defaultOpt = {
    //默认配置项
};


@Middleware()
export class <Middleware> {
    run(options: any, app: App) {
        options = Helper.extend(defaultOpt, options);
        //应用启动执行一次
        // app.once('appReady', () => { });

        return function (ctx: any, next: any) {
            return next();
        };
    }
}