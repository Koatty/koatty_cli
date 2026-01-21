/*
 * @Description: AOP切面类
 * @Usage: 
 * @Author: xxx
 * @Date: 2020-12-22 15:24:25
 * @LastEditTime: 2023-11-11 11:08:59
 */

import { Aspect, Exception, IAspect, Logger } from "koatty";
import { App } from '../App';

@Aspect()
export class AuthAspect implements IAspect {
  app: App;

  async run(token: string) {
    Logger.Debug(token);
    const isLogin = await this.checkLogin(token);
    if (!isLogin) {
      throw new Exception("no login", 1, 200);
    }
  }

  checkLogin(token: string): boolean {
    return token.toLocaleLowerCase() === 'koatty';
  }
}
