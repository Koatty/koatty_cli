/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-11-14 17:26:12
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