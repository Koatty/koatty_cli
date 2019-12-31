/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2019-12-27 19:55:20
 */
import { Aspect } from "koatty";
import { App } from '<Path>/App';

@Aspect()
export class <Aspect> {
    app: App;

    run() {
        console.log('TestAspect');
    }
}