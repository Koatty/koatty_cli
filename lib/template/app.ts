/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-12 15:40:39
 */
import { Koatty, Bootstrap } from "koatty";
// import * as path from "path";

@Bootstrap()
export class app extends Koatty {
    public init() {
        // this.root_path = path.dirname(__dirname);
        // this.app_debug = true; //线上环境请将debug模式关闭，即：app_debug:false
    }
}