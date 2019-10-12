/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-12 14:18:58
 */
import { Controller, BaseController, All } from 'koatty';

@Controller()
export class <NewController> extends BaseController {
    init() {
        //...
    }

    @All('/')
    default() {
        return this.ok('Hello, Koatty!');
    }
}