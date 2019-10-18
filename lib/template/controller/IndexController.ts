/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-18 14:42:24
 */
import { App } from "../App";
import { Controller, BaseController, GetMaping, PathVariable, RequestBody } from "koatty";

@Controller()
export class IndexController extends BaseController {
    app: App;

    init() {
        //...
    }

    @GetMaping("/")
    index(@PathVariable("path") path: string) {
        return this.ok('Hello, Koatty!');
    }
}