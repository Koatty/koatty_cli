/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-30 15:27:21
 */
import { Controller, BaseController, GetMaping, PathVariable, RequestBody } from "koatty";
import { App } from '../App';

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