/*
 * @Description: 静态文件服务中间件
 * @Usage: 提供静态文件服务
 * @Author: xxx
 * @Date: 2020-12-22 15:24:25
 * @LastEditTime: 2023-12-23 11:33:51
 */

import { Middleware, IMiddleware } from 'koatty';
import { App } from '../App';
import { KoattyStatic } from "koatty_static";

@Middleware()
export class StaticMiddleware implements IMiddleware {
  run(options: any, app: App) {
    return KoattyStatic(options, app);
  }
}