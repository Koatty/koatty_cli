/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-18 14:41:46
 */
import { App } from "<Path>/App";
import { Service, Base } from "koatty";

@Service()
export class <Service> extends Base {
    app: App;
    // @Autowired()
    // private testService2: TestService2;

    test() {
        console.log('TestService.test!');
        return "";
    }
}