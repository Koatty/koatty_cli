/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-10-30 15:29:32
 */
import { Service, Base } from "koatty";
import { App } from '<Path>/App';

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