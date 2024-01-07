# koatty_cli
Koatty command line tool.

# Usage

## Create koatty project

```shell
koatty new projectName

cd ./projectName

yarn install  // or npm i

npm start
```

## Create a module in the koatty project

* 1.Create a Controller
```shell
// http controller
kt controller test

// grpc controller
kt controller -t grpc test

// websocket controller
kt controller -t websocket test

```

* 2.Create a Service

```shell
kt service test

// service with interface
kt service -i test

```

* 3.Create a Middleware

```shell
kt middleware test

```

* 4.Create a Model

```shell

//default use typeorm
kt model test

```

* 5.Create a Aspect

定义切面类:

```shell

kt aspect test

```
使用切面：

```js
@Controller()
@BeforeEach("TestAspect")  //类的每一个方法执行之前执行
export class TestController extends BaseController {
    app: App;

    @RequestMapping("/test", RequestMethod.ALL)
    @After("TestAspect") //test方法执行之前执行
    async test() {
        const info = await this.testService.test();
        return this.body(info);
    }

}

```

* 6.Create a DTO class

定义数据验证类:

```shell

kt dto test

```
修改数据验证类:

```
export class TestDTO {
    @IsNotEmpty()
    name: string;

    @Min(0)
    @Max(120)
    age: number;
}
```

使用实体类进行验证：

```js
@Controller()
export class TestController extends BaseController {
    app: App;

    @RequestMapping("/test", RequestMethod.ALL)
    @Validated() // <== 开启验证   
    async test(@Get() param: TestDTO) { // <== 指定DTO
        const info = await this.testService.test();
        return this.body(info);
    }

}

```

## Create Koatty Extension Project

* 1、Create a Middleware Project

```shell
kt new projectName -t middleware

cd ./projectName

yarn install  // or npm i

npm start
```

* 2、Create a Plugin Project

```shell
kt new projectName -t plugin

cd ./projectName

yarn install  // or npm i

npm start
```