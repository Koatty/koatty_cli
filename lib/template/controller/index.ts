/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-12 15:39:32
 */
import { Controller, BaseController, All } from 'koatty';

@Controller()
export class index extends BaseController {
    init() {
        //...
    }

    @All('/')
    default() {
        return this.ok('Hello, Koatty!');
    }
}