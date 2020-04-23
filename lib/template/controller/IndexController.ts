/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-03-25 15:42:10
 */
import { Controller, BaseController, GetMapping, PathVariable, RequestBody } from "koatty";
import { App } from '../App';

@Controller()
export class IndexController extends BaseController {
    app: App;

    /**
     * Custom constructor
     *
     */
    init() {
        //...
    }

    @GetMapping("/")
    index(@PathVariable("path") path: string) {
        return this.ok('Hello, Koatty!');
    }
}