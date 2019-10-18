/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-18 17:43:38
 */
import { Controller, BaseController, GetMaping } from "koatty";

@Controller("/<New>")
export class <NewController> extends BaseController {

    init() {
        //...
    }

    @GetMaping("/")
    index() {
        return this.ok('Hello, Koatty!');
    }
}
