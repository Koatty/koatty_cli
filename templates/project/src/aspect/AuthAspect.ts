/*
 * @Description: AOP切面类
 * @Usage: 
 * @Author: xxx
 * @Date: 2020-12-22 15:24:25
 * @LastEditTime: 2023-11-11 11:08:59
 */

import { Aspect, AspectContext, Exception, IAspect, Logger } from "koatty";
import { App } from '../App';

@Aspect()
export class AuthAspect implements IAspect {
  app: App;

  async run(joinPoint: AspectContext): Promise<any> {
    // 访问元数据
    console.log('Method:', joinPoint.getMethodName());
    console.log('Target:', joinPoint.getTarget().constructor.name);

    // 访问参数
    console.log('Current args:', joinPoint.getArgs());
    console.log('Original args:', joinPoint.getOriginalArgs());

    // 修改参数
    const args = joinPoint.getArgs();
    // args[0] = args[0].toUpperCase();
    // joinPoint.setArgs(args);
    const token = args[0];
    Logger.Debug(token);
    const isLogin = await this.checkLogin(token);
    if (!isLogin) {
      throw new Exception("no login", 1, 200);
    }
    // Before、After会自动执行原始方法，Around需手动执行原始方法
    // if (joinPoint.hasProceed()) {
    //   return await joinPoint.executeProceed();
    // }
  }

  checkLogin(token: string): boolean {
    return token.toLocaleLowerCase() === 'koatty';
  }
}
