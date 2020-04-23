/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-03-25 15:42:32
 */
import { Controller, BaseController, GetMapping } from "koatty";
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

    @GetMapping("/")
    index() {
        return this.ok('Hello, Koatty!');
    }
}
