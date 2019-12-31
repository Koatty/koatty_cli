# koatty_cli
Koatty command line tool.

## Usage

### 1.Create Project

```shell
koatty new projectName

cd ./projectName

yarn install

npm start
```

### 2.Create a Controller
```shell
koatty controller test

```

### 3.Create a Service

```shell
koatty service test

```

### 3.Create a Middleware

```shell
koatty middleware test

```

### 4.Create a Model

```shell

//default use thinkorm
koatty model test


//use typeorm
koatty model -o typeorm test

```

### 5.Create a Aspect

定义切面类:

```shell

koatty aspect test

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

### 5.Create a DTO class

定义数据验证类:

```shell

koatty dto test

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