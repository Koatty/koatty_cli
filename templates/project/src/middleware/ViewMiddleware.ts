/*
 * @Description: 模板解析中间件
 * @Usage: 支持ejs等模板标签解析
 * @Author: xxx
 * @Date: 2020-12-22 15:54:39
 * @LastEditTime: 2023-12-24 10:18:57
 */

import { Middleware, IMiddleware } from 'koatty';
import { Views } from 'koatty_views';
import { App } from '../App';

@Middleware()
export class ViewMiddleware implements IMiddleware {
  run(options: any, app: App): any {
    return Views(options, app);
  }
}

