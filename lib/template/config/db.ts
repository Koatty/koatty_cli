/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2020-03-05 23:31:48
 */
export default {
    /*database config*/
    database: {
        db_type: 'mysql', //support  postgresql,mysql...
        db_host: '127.0.0.1',
        db_port: 3306,
        db_name: 'test',
        db_user: 'root',
        db_pwd: '',
        db_prefix: '',
        db_charset: 'utf8'
    },

    // redis: {
    //     type: 'redis', //数据缓存类型 file,redis,memcache
    //     key_prefix: '', //缓存key前置
    //     timeout: null, //数据缓存有效期，单位: 秒
    //     host: '127.0.0.1',
    //     port: 6379,
    //     password: '',
    //     db: '0'
    // }
};