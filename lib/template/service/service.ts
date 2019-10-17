/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-17 11:04:33
 */
import { App } from "../App";
import { Service } from "koatty";

@Service()
export class <Service> {
    app: App;
    // @Autowired()
    // private testService2: TestService2;

    test() {
        console.log('TestService.test!');
        return "";
    }
}