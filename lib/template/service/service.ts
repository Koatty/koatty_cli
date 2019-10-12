/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-12 15:56:42
 */
import { Service } from "koatty";

@Service()
export class <Service> {
    app: any;
    // @Autowired()
    // private testService2: TestService2;
    // @Autowired()
    // private testService3: TestService3;

    public sayHello() {
        console.log(this.app.app_debug);
        console.log('TestService.sayHello!');
    }
}