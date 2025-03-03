/*
 * @Description: 业务层
 * @Usage: 接收处理路由参数
 * @Author: xxx
 * @Date: 2020-12-22 15:24:25
 * @LastEditTime: 2025-02-28 16:52:57
 */

import {
  Controller,
  Get,
  GetMapping,
  KoattyContext,
  Post,
  PostMapping
} from 'koatty';
import { Validated } from "koatty_validation";
import { App } from './App';
import { UserDto } from './UserDto';
//_IMPORT_LIST Important! Do not delete this line

@Controller('/User') // Consistent with proto.service name
export class UserController {
  app: App;
  ctx: KoattyContext;

  /**
   * constructor
   *
   */
  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  @GetMapping('/getUser') // Consistent with graphql operation name
  @Validated()
  getUser(@Get() id: string): Promise<UserDto> {
    const res = UserDto
    return Promise.resolve(res);
  }

  @GetMapping('/searchUsers') // Consistent with graphql operation name
  @Validated()
  searchUsers(@Get() keyword: string): Promise<UserDto> {
    const res = UserDto
    return Promise.resolve(res);
  }

  @PostMapping('/createUser') // Consistent with graphql operation name
  @Validated()
  createUser(@Post() input: UserInputDto): Promise<UserDto> {
    const res = UserDto
    return Promise.resolve(res);
  }


  @PostMapping('/updateUser') // Consistent with graphql operation name
  @Validated()
  updateUser(@Post() input: UserInputDto): Promise<UserDto> {
    const res = UserDto
    return Promise.resolve(res);
  }

}