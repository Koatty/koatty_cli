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