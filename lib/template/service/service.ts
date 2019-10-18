/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-18 17:54:58
 */
import { Service, Base } from "koatty";

@Service()
export class <Service> extends Base {
    // @Autowired()
    // private testService2: TestService2;

    test() {
        console.log('TestService.test!');
        return "";
    }
}