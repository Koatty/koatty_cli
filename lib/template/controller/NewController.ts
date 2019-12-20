/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-12-18 09:48:56
 */
import { Controller, BaseController, GetMaping } from "koatty";
import { App } from '<Path>/App';

@Controller("/<New>")
export class <NewController> extends BaseController {
    app: App;

    /**
     * Custom constructor
     *
     */
    init() {
        //...
    }

    @GetMaping("/")
    index() {
        return this.ok('Hello, Koatty!');
    }
}
