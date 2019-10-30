/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-30 15:28:37
 */
import { Middleware, helper } from "koatty";
import { App } from '<Path>/App';


const defaultOpt = {
    //默认配置项
};


@Middleware()
export class <Middleware> {
    run(options: any, app: App) {
        options = helper.extend(defaultOpt, options);
        //应用启动执行一次
        // app.once('appReady', () => { });

        return function (ctx: any, next: any) {
            return next();
        };
    }
}