/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-05-18 11:36:23
 */
import { Middleware, IMiddleware, Koatty, Helper } from "koatty";
const statics = require("think_static");

@Middleware()
export class StaticMiddleware implements IMiddleware {
    run(options: any, app: Koatty) {
        return statics(options, app);
    }
}