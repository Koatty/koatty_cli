/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-12 16:27:08
 */
import { Controller, BaseController, All } from "koatty";

@Controller("/<NewController>")
export class <NewController> extends BaseController {
    init() {
        //...
    }

    @All("/")
    index() {
        return this.ok('Hello, Koatty!');
    }
}