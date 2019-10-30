/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-30 15:28:23
 */
import { Controller, BaseController, GetMaping } from "koatty";
import { App } from '<Path>/App';

@Controller("/<New>")
export class <NewController> extends BaseController {
    app: App;

    init() {
        //...
    }

    @GetMaping("/")
    index() {
        return this.ok('Hello, Koatty!');
    }
}
