/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-17 11:04:06
 */
import * as Koa from "Koa";
import { App } from "../App";
import { Controller, BaseController, All } from "koatty";

@Controller("/<NewController>")
export class <NewController> extends BaseController {
    app: App;
    protected ctx: Koa.BaseContext;

    init() {
        //...
    }

    @All("/")
    index() {
        return this.ok('Hello, Koatty!');
    }
}