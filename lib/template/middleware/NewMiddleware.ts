/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-05-18 11:36:51
 */
import { Middleware, IMiddleware, KoattyContext, Helper } from "koatty";
import { App } from '<Path>/App';


const defaultOpt = {
    //默认配置项
};


@Middleware()
export class <Middleware> implements IMiddleware {
    run(options: any, app: App) {
        options = Helper.extend(defaultOpt, options);
        //应用启动执行一次
        // app.once('appReady', () => { });

        return function (ctx: KoattyContext, next: Function) {
            return next();
        };
    }
}