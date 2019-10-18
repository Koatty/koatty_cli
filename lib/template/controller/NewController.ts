/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-18 14:50:17
 */
import { App } from "<Path>/App";
import { Controller, BaseController, GetMaping } from "koatty";

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
